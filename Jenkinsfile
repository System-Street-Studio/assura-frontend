// Mirrors AssuraBackend/Jenkinsfile's shape and rationale — see that file's header for why
// every stage starts with `checkout scm` (fresh pod per stage under the Kubernetes plugin) and
// why this pipeline never runs kubectl. Build context for Docker/Kaniko is `frontend/`.
pipeline {
    agent none

    environment {
        ECR_REPO    = "CHANGE_ME.dkr.ecr.us-east-1.amazonaws.com/assura-demo-frontend"
        IMAGE_TAG   = "${env.GIT_COMMIT.take(12)}"
        GITOPS_REPO = "https://github.com/System-Street-Studio/assura-gitops.git"
    }

    stages {
        stage('Secret scan') {
            agent { label 'node' }
            steps {
                checkout scm
                sh 'curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/master/install.sh | sh -s -- -b /tmp v8.21.2'
                sh '/tmp/gitleaks detect --source . --redact --exit-code 1 --config .gitleaks.toml'
            }
        }

        stage('Install deps') {
            agent { label 'node' }
            steps {
                checkout scm
                dir('frontend') {
                    sh 'npm ci'
                    stash name: 'node-modules-and-src', includes: '**'
                }
            }
        }

        stage('Lint') {
            agent { label 'node' }
            steps {
                checkout scm
                dir('frontend') {
                    unstash 'node-modules-and-src'
                    sh 'npm run lint'
                }
            }
        }

        stage('SAST — Semgrep') {
            agent { label 'node' }
            steps {
                checkout scm
                dir('frontend') {
                    // node:22-alpine doesn't ship python3 — installed here rather than assumed.
                    sh 'apk add --no-cache python3 py3-pip'
                    sh 'pip install --quiet --break-system-packages semgrep'
                    sh 'semgrep scan --config p/typescript --config p/angular --error --sarif --output ../semgrep-frontend.sarif .'
                }
            }
            post {
                always { archiveArtifacts artifacts: 'semgrep-frontend.sarif', allowEmptyArchive: true }
            }
        }

        stage('SCA — npm audit') {
            agent { label 'node' }
            steps {
                checkout scm
                dir('frontend') {
                    unstash 'node-modules-and-src'
                    sh 'npm audit --audit-level=high'
                }
            }
        }

        stage('Unit tests') {
            agent { label 'node' }
            steps {
                checkout scm
                dir('frontend') {
                    unstash 'node-modules-and-src'
                    sh 'npm run test -- --no-watch --no-progress --browsers=ChromeHeadless'
                }
            }
        }

        stage('Build & push image') {
            agent { label 'kaniko' }
            steps {
                checkout scm
                sh """
                    /kaniko/executor \
                      --context=frontend \
                      --dockerfile=frontend/Dockerfile \
                      --destination=${ECR_REPO}:${IMAGE_TAG} \
                      --cache=true
                """
            }
        }

        stage('Image scan — Trivy') {
            agent { label 'trivy' }
            steps {
                sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${ECR_REPO}:${IMAGE_TAG}"
            }
        }

        stage('SBOM + sign') {
            agent { label 'syft-cosign' }
            steps {
                // Plain Alpine (see the podTemplate note on why) — fetch both binaries first.
                sh 'wget -qO /tmp/syft.tar.gz https://github.com/anchore/syft/releases/download/v1.18.0/syft_1.18.0_linux_amd64.tar.gz && tar -xzf /tmp/syft.tar.gz -C /usr/local/bin syft'
                sh 'wget -qO /usr/local/bin/cosign https://github.com/sigstore/cosign/releases/download/v2.4.1/cosign-linux-amd64 && chmod +x /usr/local/bin/cosign'
                sh "syft ${ECR_REPO}:${IMAGE_TAG} -o cyclonedx-json > sbom-frontend.json"
                sh "cosign sign --key awskms:///CHANGE_ME_COSIGN_KEY_ARN ${ECR_REPO}:${IMAGE_TAG}"
            }
            post {
                always { archiveArtifacts artifacts: 'sbom-frontend.json', allowEmptyArchive: true }
            }
        }

        stage('Update GitOps manifest') {
            agent { label 'git' }
            steps {
                sh 'wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/download/v4.44.6/yq_linux_amd64 && chmod +x /usr/local/bin/yq'
                sh 'apk add --no-cache aws-cli'
                // Fully single-quoted — see AssuraBackend/Jenkinsfile's identical stage for why
                // (no Groovy interpolation of the token anywhere; GIT_TOKEN/GITOPS_REPO/IMAGE_TAG
                // are all resolved as plain shell variables at runtime instead).
                sh '''
                    set -eu
                    GIT_TOKEN=$(aws secretsmanager get-secret-value \
                        --secret-id assura-demo/github-gitops-pat \
                        --query SecretString --output text --region us-east-1 \
                        | yq -r '.token')
                    git clone "https://x-access-token:${GIT_TOKEN}@${GITOPS_REPO#https://}" gitops
                    cd gitops
                    yq -i '.image.tag = strenv(IMAGE_TAG)' charts/assura-frontend/values-image.yaml
                    git config user.name "jenkins-bot"
                    git config user.email "jenkins-bot@assura.local"
                    git commit -am "deploy: assura-frontend@${IMAGE_TAG}"
                    git push origin main
                '''
            }
        }
    }
}
