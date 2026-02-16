# Assura - Fixed Assets Management System (FAMS) 🛡️

[cite_start]**Assura** is a comprehensive enterprise solution engineered to manage the entire lifecycle of an organization's physical assets—from registration and assignment to depreciation and discarding[cite: 1764, 1777]. [cite_start]The system ensures financial accuracy, real-time tracking via QR technology, and accountability across the organization[cite: 1788, 1858].

## 🚀 Tech Stack
* [cite_start]**Frontend:** Angular (Standalone Components) [cite: 1766, 1933]
* [cite_start]**Mobile:** Flutter (Cross-platform) [cite: 1935, 1960]
* [cite_start]**Backend:** .NET / ASP.NET Core REST API [cite: 1767, 1938]
* [cite_start]**Database:** MySQL [cite: 1767, 1944]
* [cite_start]**Reporting:** ClosedXML (Excel) and QuestPDF (PDF) [cite: 1978]
* [cite_start]**Security:** JWT Authentication and Role-Based Access Control (RBAC) [cite: 1768, 1947]

## 🌟 Key Role Features
[cite_start]Assura provides a tailored experience for 10 distinct user groups[cite: 1981, 2035]:

1.  [cite_start]**HR Manager**: Manages user accounts and assigns specific roles and divisions to employees after account creation[cite: 1991, 2003].
2.  [cite_start]**Procurement Manager**: Manages suppliers and tenders, prepares purchase orders, and coordinates with external repair firms[cite: 1986, 1997].
3.  [cite_start]**Storekeeper**: Registers new assets, generates unique QR codes, and manages inventory documentation like GRN, GIN, and TIN[cite: 1830, 1992, 1997].
4.  [cite_start]**Superintendent**: Manages asset discarding workflows, records disposal notes, and oversees the physical discarding process[cite: 1990, 2020].
5.  [cite_start]**Accountant**: Confirms discard notes with proof of disposal and updates the store's status in the system[cite: 1994, 2024].
6.  [cite_start]**Auditor**: Monitors real-time analytics, detects anomalies, and exports comprehensive reports as Excel or PDF files[cite: 1836, 1987, 2048].
7.  [cite_start]**Admin**: Responsible for asset verification and tracking physical status and division via QR scanning[cite: 1985, 2069].
8.  [cite_start]**Employee**: Views assigned assets, makes requests for new assets, and initiates transfer or discard requests[cite: 1983, 2007].
9.  [cite_start]**Division Head**: Reviews, approves, or rejects requests from employees within their division and manages internal transfers[cite: 1984, 1997, 2019].

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
