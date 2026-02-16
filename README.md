# Assura - Fixed Assets Management System (FAMS) 🛡️

[cite_start]**Assura** is a comprehensive enterprise solution engineered to manage the entire lifecycle of an organization's physical assets—from registration and assignment to depreciation and discarding[cite: 1764, 1777]. [cite_start]The system ensures financial accuracy, real-time tracking via QR technology, and accountability across the organization[cite: 1788, 1858].

## 🚀 Tech Stack
* **Frontend:** Angular (Standalone Components) 
* **Mobile:** Flutter (Cross-platform)
* **Backend:** .NET / ASP.NET Core REST API
* **Database:** MySQL 
* **Reporting:** ClosedXML (Excel) and QuestPDF (PDF) 
* **Security:** JWT Authentication and Role-Based Access Control (RBAC) 

## 🌟 Key Role Features
Assura provides a tailored experience for 10 distinct user groups:

1.  **HR Manager**: Manages user accounts and assigns specific roles and divisions to employees after account creation.
2.  **Procurement Manager**: Manages suppliers and tenders, prepares purchase orders, and coordinates with external repair firms.
3.  **Storekeeper**: Registers new assets, generates unique QR codes, and manages inventory documentation like GRN, GIN, and TIN.
4.  **Superintendent**: Manages asset discarding workflows, records disposal notes, and oversees the physical discarding process.
5.  **Accountant**: Confirms discard notes with proof of disposal and updates the store's status in the system.
6.  **Auditor**: Monitors real-time analytics, detects anomalies, and exports comprehensive reports as Excel or PDF files.
7.  **Admin**: Responsible for asset verification and tracking physical status and division via QR scanning.
8.  **Employee**: Views assigned assets, makes requests for new assets, and initiates transfer or discard requests.
9.  **Division Head**: Reviews, approves, or rejects requests from employees within their division and manages internal transfers.

## 📁 Folder Structure
The project follows a **Feature-based Standalone Architecture** to ensure scalability and isolation of role-specific logic.

```text
public/
└── appLogo.ico                          # App Icon

src/app/
├── core/                                # Global Singleton Logic
│   ├── auth/                            # JWT Logic, AuthService
│   ├── guards/                          # RoleGuard, AuthGuard 
│   ├── interceptors/                    # AuthInterceptor (Token Injection)
│   ├── services/                        # ApiService, NotificationService
│   └── models/                          # Global Interfaces (User, Asset models)
│
├── shared/                              # Reusable UI Components
│   ├── components/                      # Custom Tables, QR-Scanner, Modals
│   ├── directives/                      # hasRole directive (Permission Control)
│   └── pipes/                           # Currency/Date format pipes
│
├── features/                            # Functional Modules (Roles & Features)
│   ├── shell/                           # Main Frame (Navbar, Sidebar)
│   │   ├── components/                  # Global Header, Footer
│   │   ├── shell.component.ts           # Root layout component
│   │   └── shell.routes.ts              # Registry for child features
│   ├── auth/                            # Login & Signup (Outside Shell)
│   ├── employee/                        # Common Portal for ALL Users 
│   ├── hr/                              # HR Manager Pages
│   ├── inventory/                       # Storekeeper Pages
│   ├── procurement/                     # Procurement Manager Pages
│   ├── reporting/                       # Auditor Analytics Pages
│   ├── approvals/                       # Division Head Workflow Pages
│   └── maintenance/                     # Superintend & Accountant Pages
│
├── app.config.ts                        # Application Config (Providers)
├── app.routes.ts                        # Root Routing (Auth vs Shell)
└── main.ts                              # Entry point

src/assets/
├── fonts/                               # System Typography (.tff)
└── images/                              # Branding & UI Images

```

## Setup Steps

 # clone repo
 git clone repo_link

 # Dependencies install 
 npm install

 # run in local server
 ng serve
