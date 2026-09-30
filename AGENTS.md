# 🛡️ DEV MOTORS — AI AGENT & DEVELOPER GUARDRAILS & BUSINESS LOGIC SPECIFICATION

> **CRITICAL INSTRUCTION FOR ALL AI AGENTS & DEVELOPERS:**  
> **READ THIS FILE FIRST BEFORE MAKING ANY CODE OR DATABASE CHANGES!**  
> Do **NOT** scan the entire repository or alter any workflow rules, employee mappings, or approval flows without adhering strictly to the constraints outlined in this document. Any change that violates these business rules will break store-deployed production builds (Apple App Store & Google Play Store).

---

## 📑 Quick Navigation
1. [Absolute Invariant Guardrails (DO NOT BREAK)](#1-absolute-invariant-guardrails)
2. [Complete 45-Member Dealership Directory & Credentials Matrix](#2-complete-45-member-dealership-directory--credentials-matrix)
3. [The 3-Tier Approval Workflow State Machine](#3-the-3-tier-approval-workflow-state-machine)
4. [Direct Owner Reporting Matrix & Manager Bypass Rules](#4-direct-owner-reporting-matrix--manager-bypass-rules)
5. [Sales vs Service Super-Management Structure](#5-sales-vs-service-super-management-structure)
6. [Cashier Settlement & Payout Rules](#6-cashier-settlement--payout-rules)
7. [Authentication, Session Persistence & Login System](#7-authentication-session-persistence--login-system)
8. [Codebase Source of Truth & File Map](#8-codebase-source-of-truth--file-map)
9. [Pre-Commit Automated Verification Commands](#9-pre-commit-automated-verification-commands)

---

## 1. Absolute Invariant Guardrails

When modifying, adding, or refactoring features, you **MUST** respect the following rules:

1. **NO QUICK LOGIN:**  
   The application **MUST** strictly require real **Employee ID** and **Password** authentication. Never re-introduce quick login buttons, demo pills, or one-click role bypass buttons on the login screen.
2. **PERMANENT AUTO-LOGIN SESSION:**  
   Once logged in, the session token is persistently saved in secure local storage. App launches **MUST** automatically bypass the login screen into the user's role dashboard until the user explicitly taps "Logout".
3. **DO NOT MODIFY REPORTING MANAGERS:**  
   Across the entire dealership, **ONLY TWO EMPLOYEES** report to Branch Managers:
   - **Sunil Sharma (`main_sunil_spare`)** $\rightarrow$ reports to **Dinesh Sharma (`main_dinesh_gm`)** [Service GM]
   - **Shibli (`iglas_shibli_rec`)** $\rightarrow$ reports to **Ahmar Ammar (`main_ahmar_gm`)** [Sales GM]  
   **All other employees report directly to the Dealership Owners** (`managerId = null`). Never revert them to branch managers!
4. **DO NOT DISBURSE UNAPPROVED EXPENSES:**  
   Cashiers **CANNOT** pay out any claim unless it has attained **`PENDING_CASHIER`** (fully approved by Owner).
5. **IMMUTABILITY OF PAID RECORDS:**  
   Once a claim status is **`PAID`** or **`SETTLED`**, it is permanent and locked. It cannot be re-opened, edited, or re-processed.
6. **CREDENTIAL STABILITY:**  
   All active dealership members use the standard password **`Dev@2026`**. Reviewer test accounts (`TEST01`–`TEST12`) support both **`Dev@2026`** and **`12345678`**. Never change, overwrite, or re-hash passwords without explicit instructions.

---

## 2. Complete 45-Member Dealership Directory & Credentials Matrix

### 👑 Owners & Global Leadership (All Branches)
| Name | Employee ID | Role | Branch | Password | Reporting Manager |
|---|---|---|---|---|---|
| **Sumit Agarwal** | `owner_sumit` | OWNER | Global / All Outlets | `Dev@2026` | None (Direct Owner) |
| **Gaurav Sharma** | `owner_gaurav_sharma` | OWNER | Global / All Outlets | `Dev@2026` | None (Direct Owner) |
| **Gaurav Agarwal** | `owner_gaurav_agr` | OWNER | Global / All Outlets | `Dev@2026` | None (Direct Owner) |
| **Drona Agarwal** | `owner_dron` | OWNER | Global / All Outlets | `Dev@2026` | None (Direct Owner) |
| **Arpit Verma** | `owner_arpit` | OWNER | Global / All Outlets | `Dev@2026` | None (Direct Owner) |

### 🏢 Main Outlet
| Name | Employee ID | Role / Designation | Branch | Password | Reporting Manager |
|---|---|---|---|---|---|
| **Ahmar Ammar** | `main_ahmar_gm` | MANAGER (Sales GM) | Main Outlet | `Dev@2026` | None (Direct Owner) |
| **Dinesh Sharma** | `main_dinesh_gm` | MANAGER (Service GM) | Main Outlet | `Dev@2026` | None (Direct Owner) |
| **Girish Sharma** | `iglas_grish_acc` | CASHIER / Accountant | Main Outlet | `Dev@2026` | None (Direct Owner) |
| **Gaurav Sharma** | `iglas_gaurav_cashier` | CASHIER | Main Outlet | `Dev@2026` | None (Direct Owner) |
| **Gyanendra Singhle** | `main_gyanendra_bsm` | EMPLOYEE (BSM) | Main Outlet | `Dev@2026` | **Direct Owner** |
| **Radha Pal** | `main_radha_ccm` | EMPLOYEE (CCM) | Main Outlet | `Dev@2026` | **Direct Owner** |
| **Sunil Sharma** | `main_sunil_spare` | EMPLOYEE (Spare Parts) | Main Outlet | `Dev@2026` | **Dinesh Sharma (`main_dinesh_gm`)** |
| **Shibli** | `iglas_shibli_rec` | EMPLOYEE (Reception) | Main Outlet | `Dev@2026` | **Ahmar Ammar (`main_ahmar_gm`)** |
| **Birendra Tiwari** | `iglas_birendra_emp` | EMPLOYEE | Main Outlet | `Dev@2026` | **Direct Owner** |
| **Bablu Canteen** | `iglas_bablu_can` | EMPLOYEE (Canteen) | Main Outlet | `Dev@2026` | **Direct Owner** |
| **Noushad Ahmad** | `It_nausad` | EMPLOYEE (IT) | Main Outlet | `Dev@2026` | **Direct Owner** |

### 🏎️ Aligarh Nexa
| Name | Employee ID | Role / Designation | Branch | Password | Reporting Manager |
|---|---|---|---|---|---|
| **St. Stephen Joseph** | `nexa_stephen_sm` | MANAGER (Sales Mgr) | Aligarh Nexa | `Dev@2026` | None (Direct Owner) |
| **Dheeraj Chaudhary** | `nexa_dheeraj_wm` | MANAGER (Workshop Mgr) | Aligarh Nexa | `Dev@2026` | None (Direct Owner) |
| **Shivam** | `nexa_shivam_acc` | CASHIER / Accountant | Aligarh Nexa | `Dev@2026` | None (Direct Owner) |
| **Muneesh Kumar** | `nexa_muneesh_bsm` | EMPLOYEE (BSM) | Aligarh Nexa | `Dev@2026` | **Direct Owner** |
| **Akash Sharma** | `nexa_akash_bsm` | EMPLOYEE (BSM) | Aligarh Nexa | `Dev@2026` | **Direct Owner** |
| **Sunny** | `nexa_sunny_spare` | EMPLOYEE (Spare Parts) | Aligarh Nexa | `Dev@2026` | **Direct Owner** |
| **Santosh** | `nexa_santosh_spare` | EMPLOYEE (Spare Parts) | Aligarh Nexa | `Dev@2026` | **Direct Owner** |

### 🛠️ Khair Outlet
| Name | Employee ID | Role / Designation | Branch | Password | Reporting Manager |
|---|---|---|---|---|---|
| **Pankaj Verma** | `khair_pankaj_sm` | MANAGER (Sales Mgr) | Khair | `Dev@2026` | None (Direct Owner) |
| **Dev Kumar Baghel** | `khair_dev_wm` | MANAGER (Workshop Mgr) | Khair | `Dev@2026` | None (Direct Owner) |
| **Rohit** | `khair_rohit_acc` | CASHIER / Accountant | Khair | `Dev@2026` | None (Direct Owner) |
| **Rajendra Dubey** | `khair_rajendra_bm` | EMPLOYEE (Branch Staff) | Khair | `Dev@2026` | **Direct Owner** |

### 🔧 Atrauli Outlet
| Name | Employee ID | Role / Designation | Branch | Password | Reporting Manager |
|---|---|---|---|---|---|
| **Raj Vardhan** | `atrauli_raj_sm` | MANAGER (Sales Mgr) | Atrauli | `Dev@2026` | None (Direct Owner) |
| **Jai Saraswat** | `atrauli_jai_wm` | MANAGER (Workshop Mgr) | Atrauli | `Dev@2026` | None (Direct Owner) |
| **Sumit** | `atrauli_sumit_acc` | CASHIER / Accountant | Atrauli | `Dev@2026` | None (Direct Owner) |
| **Yogesh Kumar** | `atrauli_yogesh_bsm` | EMPLOYEE (BSM) | Atrauli | `Dev@2026` | **Direct Owner** |

### 📍 Iglas Outlet
| Name | Employee ID | Role / Designation | Branch | Password | Reporting Manager |
|---|---|---|---|---|---|
| **Nitesh Pal** | `iglas_nitesh_sm` | MANAGER (Sales Mgr) | Iglas | `Dev@2026` | None (Direct Owner) |
| **Rahul** | `iglas_rahul_wm` | MANAGER (Workshop Mgr) | Iglas | `Dev@2026` | None (Direct Owner) |

### 🧪 Reviewer & Store Testing Accounts (Kanpur Dealership)
| Name | Employee ID | Role | Password | Testing Scope |
|---|---|---|---|---|
| Tester 01 | `TEST01` | EMPLOYEE | `Dev@2026` / `12345678` | Employee Claim Creation & Receipts |
| Tester 02 | `TEST02` | EMPLOYEE | `Dev@2026` / `12345678` | Employee Claim Creation & Receipts |
| Tester 03 | `TEST03` | EMPLOYEE | `Dev@2026` / `12345678` | Employee Claim Creation & Receipts |
| Tester 04 | `TEST04` | EMPLOYEE | `Dev@2026` / `12345678` | Employee Claim Creation & Receipts |
| Tester 05 | `TEST05` | EMPLOYEE | `Dev@2026` / `12345678` | Employee Claim Creation & Receipts |
| Tester 06 | `TEST06` | EMPLOYEE | `Dev@2026` / `12345678` | Employee Claim Creation & Receipts |
| Tester 07 | `TEST07` | MANAGER | `Dev@2026` / `12345678` | Level 1 Claim Approval / Rejection |
| Tester 08 | `TEST08` | MANAGER | `Dev@2026` / `12345678` | Level 1 Claim Approval / Rejection |
| Tester 09 | `TEST09` | MANAGER | `Dev@2026` / `12345678` | Level 1 Claim Approval / Rejection |
| Tester 10 | `TEST10` | CASHIER | `Dev@2026` / `12345678` | Level 3 Payout & Settlement |
| Tester 11 | `TEST11` | CASHIER | `Dev@2026` / `12345678` | Level 3 Payout & Settlement |
| Tester 12 | `TEST12` | OWNER | `Dev@2026` / `12345678` | Level 2 Owner Oversight & Analytics |

---

## 3. The 3-Tier Approval Workflow State Machine

The expense approval pipeline moves strictly through these discrete states:

```
[Employee Submits]
       │
       ├── (Has Manager? Sunil / Shibli) ────────► PENDING_MANAGER (Level 1)
       │                                                   │
       │                                            Manager Approves
       │                                                   │
       └── (Direct Owner Reporting or Mgr/Cashier) ────────┼────────┐
                                                           ▼        ▼
                                                   PENDING_OWNER (Level 2)
                                                           │
                                                     Owner Approves
                                                           │
                                                           ▼
                                                   PENDING_CASHIER (Level 3)
                                                           │
                                                    Cashier Disburses
                                                           │
                                                           ▼
                                                         PAID
                                              (Permanently Locked History)
```

### State Definitions
1. **`PENDING_MANAGER` (Level 1 Review):**
   - Active only for employees with an assigned reporting manager.
   - Visible in Branch Manager's **Action Needed** tab.
   - Action: `APPROVED_1` (advances to `PENDING_OWNER`) or `REJECTED_1` (terminates to `REJECTED`).
2. **`PENDING_OWNER` (Level 2 Review):**
   - Visible in Dealership Owner's **Review Queue** across all branches.
   - Claims created by Managers, Cashiers, or Direct Owner Reporting employees enter here directly.
   - Action: `APPROVED_2` (advances to `PENDING_CASHIER`) or `REJECTED_2` (terminates to `REJECTED`).
3. **`PENDING_CASHIER` (Level 3 Settlement):**
   - Visible in Cashier's **Payout Queue**.
   - Cashier enters payment transaction reference (UPI / Cash / Bank Transfer).
   - Action: `PAY` / `SETTLE` / `DISBURSE` (advances to `PAID`).
4. **`PAID`:**
   - Moves to Employee's and Dealership's permanent **Settled History** tab.

---

## 4. Direct Owner Reporting Matrix & Manager Bypass Rules

The following employees **ALWAYS BYPASS LEVEL 1** and route directly to `PENDING_OWNER`:
1. **Gaurav Sharma (`iglas_gaurav_cashier`)**
2. **Birendra Tiwari (`iglas_birendra_emp`)**
3. **Bablu Canteen (`iglas_bablu_can`)**
4. **Noushad Ahmad (`It_nausad`)**
5. **Gyanendra Singhle (`main_gyanendra_bsm`)**
6. **Radha Pal (`main_radha_ccm`)**
7. **Santosh (`nexa_santosh_spare`)**
8. **Sunny (`nexa_sunny_spare`)**
9. **Muneesh Kumar (`nexa_muneesh_bsm`)**
10. **Akash Sharma (`nexa_akash_bsm`)**
11. **Yogesh Kumar (`atrauli_yogesh_bsm`)**
12. **Rajendra Dubey (`khair_rajendra_bm`)**
13. **All Managers (`nexa_stephen_sm`, `main_ahmar_gm`, etc.)**
14. **All Cashiers (`nexa_shivam_acc`, `iglas_grish_acc`, etc.)**

Implementation: `ClaimWorkflowEngine.isDirectOwnerReporting(expense)` in Dart, and `!dbUser.managerId` condition in `expense.controller.ts`.

---

## 5. Sales vs Service Super-Management Structure

In the Main Outlet:
- **Sales GM (Ahmar Ammar - `main_ahmar_gm`):**
  - Manages Showroom Sales, New Bookings, Vehicle Sales Operations.
  - Direct subordinate: **Shibli (`iglas_shibli_rec`)**.
- **Service GM (Dinesh Sharma - `main_dinesh_gm`):**
  - Manages Bodyshop, Workshop, Mechanical Repairs, Service Center Operations.
  - Direct subordinate: **Sunil Sharma (`main_sunil_spare`)**.

---

## 6. Cashier Settlement & Payout Rules

1. **Strict Settlement Gate:** A cashier cannot pay out an expense if status is `PENDING_MANAGER` or `PENDING_OWNER`.
2. **Payment Methods Supported:**
   - `CASH`
   - `UPI` (with Transaction ID reference)
   - `BANK_TRANSFER` / `NEFT` / `RTGS`
3. **Audit Trail:** Cashier user ID, settlement timestamp, and payment note are stamped directly onto the database record upon payment.

---

## 7. Authentication, Session Persistence & Login System

1. **Endpoint:** `POST /api/auth/login`
   - Body: `{ "employeeId": "<id>", "password": "<password>" }`
   - Case-insensitive `employeeId` lookup.
2. **Session Persistence:**
   - SharedPreferences stores: `auth_token`, `user_id`, `employee_id`, `user_name`, `user_role`, `user_location`.
   - On app startup, `AuthProvider.restoreSession()` verifies token validity and immediately routes user to their dashboard.
3. **Password Security:**
   - Seeded passwords use standard bcrypt cost factor 10.
   - Master fallback `Dev@2026` is enabled in non-production environments for operational resilience.

---

## 8. Codebase Source of Truth & File Map

| Purpose | Frontend File (Flutter) | Backend File (Node/TypeScript) |
|---|---|---|
| **Workflow State Machine & Queue Filtering** | `lib/core/utils/claim_workflow_engine.dart` | `backend/src/modules/expenses/expense.controller.ts` |
| **Approval Stepper Widget** | `lib/features/expenses/presentation/widgets/approval_stepper.dart` | — |
| **Authentication & Session Persistence** | `lib/features/auth/providers/auth_provider.dart` | `backend/src/modules/auth/auth.service.ts` |
| **Database Schema & Models** | — | `backend/prisma/schema.prisma` |
| **Database Seed Directory** | — | `backend/prisma/seed_from_directory.js` |
| **Notification Center** | `lib/core/services/notification_service.dart` | `backend/src/modules/notifications/notification.controller.ts` |

---

## 9. Pre-Commit Automated Verification Commands

Before pushing any commit or releasing any build, you **MUST** run and pass these tests:

```bash
# 1. Run Workflow Engine Unit Tests (23/23 must pass)
flutter test test/claim_workflow_engine_test.dart

# 2. Run Department Workflow Tests (5/5 must pass)
flutter test test/department_workflow_test.dart

# 3. Run Session Persistence Tests (4/4 must pass)
flutter test test/session_persistence_test.dart

# 4. Run Approval Stepper UI Tests (10/10 must pass)
flutter test test/approval_stepper_test.dart

# 5. Verify Backend TypeScript & Prisma Build (Exit 0)
cd backend && npm run build
```

---
*Created on 2026-09-30 for Dev Motors Production System. Do not alter without architectural sign-off.*
