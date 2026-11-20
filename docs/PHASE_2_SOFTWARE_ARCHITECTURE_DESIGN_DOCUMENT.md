# Phase 2: Software Architecture Design Document (ADD)
## Smart Car Rental Platform
**Academic Course:** Software Engineering for Cloud Applications / Software Architecture  
**Institution:** Arab Academy for Science, Technology and Maritime Transport (AASTMT)  
**Deliverable:** Phase 2 Complete Architecture Design Document & Diagrammatic Specifications  
**Methodology:** Attribute-Driven Design (ADD v3.0)

---

## Executive Summary & ADD Methodology Overview

This document presents the complete architectural design for the **Smart Car Rental Platform**, engineered using the **Attribute-Driven Design (ADD)** methodology developed by the Software Engineering Institute (SEI). 

The ADD process recursively decomposes the system by choosing architectural patterns and tactics that satisfy the prioritized **Architecturally Significant Requirements (ASRs)** and **Quality Attribute Scenarios** established in Phase 1:

```
[Phase 1 Inputs: ASRs & Utility Tree Scenarios]
                     │
                     ▼
       ┌───────────────────────────┐
       │ Step 1: Choose System     │
       │ Element to Decompose      │
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │ Step 2: Formulate ASRs    │
       │ for Selected Element      │
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │ Step 3: Select Suitable   │
       │ Architectural Patterns    │ ───► Layered + Microservices + Strategy
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │ Step 4: Instantiate &     │
       │ Allocate Responsibilities │ ───► System Context, Uses, Class Diagrams
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │ Step 5: Define Runtime &  │
       │ Deployment Structures     │ ───► Unified C&C + Allocation Diagram
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │ Step 6: Validate with     │
       │ Sequence Interaction Flow │ ───► 5 Core Dynamic Sequence Diagrams
       └─────────────┬─────────────┘
                     ▼
       ┌───────────────────────────┐
       │ Step 7: Assess Quality    │
       │ Attributes & Tactics      │ ───► Traceability & Rationale Matrix
       └───────────────────────────┘
```

---

# 1. System Context Diagram (View 1)

### 1.1 Diagram Description
The System Context Diagram defines the formal boundary of the Smart Car Rental Platform (DFD Level 0 equivalent). It identifies all external human actors and peripheral third-party software systems that interact directly with the platform, showing all primary directed data flows across the system boundary.

### 1.2 System Context Diagram (Mermaid)

```mermaid
flowchart TB
    subgraph Primary_Actors ["Human Actors"]
        Renter["👤 Renter / Customer<br/>(Browses, Reserves, Scans)"]
        Owner["👤 Vehicle Owner<br/>(Enrolls Fleet, Approves)"]
        Admin["👤 System Administrator<br/>(Audits, Overrides, Governs)"]
    end

    subgraph System_Boundary ["System Boundary: Smart Car Rental Platform"]
        CoreSystem(("🚗 Smart Car Rental<br/>Platform Core System"))
    end

    subgraph External_Services ["External Peripheral Services"]
        GovKYC["🏛️ National Identity &<br/>Driving License Authority"]
        PaymentGW["💳 External Payment &<br/>Escrow Gateway"]
        SMSNotify["📱 SMS & Push Notification<br/>Gateway"]
        MapService["🗺️ Geospatial & Navigation<br/>Service API"]
        InsuranceAPI["🛡️ Insurance & Valuation<br/>Service API"]
    end

    %% Actor Interactions
    Renter -->|"1. Registration, Search Filters, Booking, Photos"| CoreSystem
    CoreSystem -->|"2. Catalog, Reservation Confirmation, Damage Report"| Renter

    Owner -->|"3. Vehicle Enrollment, Terms, Approval Decisions"| CoreSystem
    CoreSystem -->|"4. Booking Requests, Fleet Payouts, Inspection Summaries"| Owner

    Admin -->|"5. Audit Queries, KYC Approval Overrides, System Config"| CoreSystem
    CoreSystem -->|"6. Operational Metrics, Audit Logs, Incident Alerts"| Admin

    %% External System Interactions
    CoreSystem -->|"7. Identity & License Verification Request"| GovKYC
    GovKYC -->|"8. Verification Validity Status & Metadata"| CoreSystem

    CoreSystem -->|"9. Payment Capture & Deposit Authorization"| PaymentGW
    PaymentGW -->|"10. Authorization Token, Settlement Confirmation"| CoreSystem

    CoreSystem -->|"11. Dispatch Alert / Transactional SMS Message"| SMSNotify
    SMSNotify -->|"12. Delivery Confirmation Receipt"| CoreSystem

    CoreSystem -->|"13. Coordinates, Route Query, Mileage Query"| MapService
    MapService -->|"14. Distance Matrix, Route Geometries, Maps"| CoreSystem

    CoreSystem -->|"15. Vehicle Plate, VIN, Model Inquiry"| InsuranceAPI
    InsuranceAPI -->|"16. Baseline Valuation & Policy Coverage Status"| CoreSystem

    classDef actor fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef system fill:#0f172a,stroke:#f59e0b,stroke-width:3px,color:#ffffff;
    classDef external fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

    class Renter,Owner,Admin actor;
    class CoreSystem system;
    class GovKYC,PaymentGW,SMSNotify,MapService,InsuranceAPI external;
```

### 1.3 Boundary Data Flow Specification

| External Entity | Input Data Flow (To System) | Output Data Flow (From System) | Architectural Purpose |
|---|---|---|---|
| **Renter** | Account credentials, KYC photos, reservation dates, vehicle filters, return damage photos. | Vehicle listings, booking vouchers, damage assessment cost breakdown, deposit refund receipts. | Primary consumer of rental services. |
| **Vehicle Owner** | Vehicle specifications (VIN, plate, model), daily rate, deposit requirement, approval actions. | Booking requests, fleet utilization analytics, damage compensation payouts. | Fleet asset provider and approver. |
| **System Administrator** | Governance policies, manual verification overrides, fee calibration rules. | Audit logs, security alerts, aggregate financial settlement reports. | Operational governance and compliance. |
| **Identity / KYC Authority** | Verified identity confirmation, document authenticity validation. | Encrypted applicant national ID number and driving license payload. | Regulatory compliance and fraud mitigation. |
| **Payment Gateway** | Payment authorization tokens, settlement webhooks, refund transaction receipts. | Cardholder authorization request, payment capture amount, deposit hold mandate. | Secure cashless financial settlement. |
| **SMS / Notification Gateway**| SMS dispatch delivery receipts, bounce notifications. | Outgoing transactional alerts, OTP codes, booking confirmation messages. | Renter / owner real-time notifications. |
| **Geospatial & Mapping API** | Route distance, travel time estimates, reverse geocoded locations. | Pickup/dropoff coordinates, route waypoint queries. | Location filtering & roadtrip fuel calculation. |

---

# 2. Module Structure Diagrams (View 2)

The Module Structure View defines how the software source code is logically decomposed into decoupled, maintainable code units and layers. In accordance with course guidelines, this view contains two distinct diagrams:
1. **The Uses Diagram** (Dependencies between functional layers and modules)
2. **The Class Diagram** (Detailed object structure, properties, methods, and relationships)

---

## 2.1 The Uses Diagram (Module Dependency View)

### Description
The Uses Diagram illustrates the hierarchical layering of modules. A directed arrow from **Module A to Module B** denotes that **A requires the presence and correct functioning of B to fulfill its responsibility** (`A uses B`). Strict unidirectional layering guarantees acyclic dependencies and high maintainability.

```mermaid
flowchart TD
    subgraph Presentation_Layer ["Layer 1: Presentation & Client Modules"]
        M_UI["🖥️ Web & Mobile Client Interface Module"]
        M_State["🔄 Client State & Form Validation Module"]
    end

    subgraph Ingress_Layer ["Layer 2: API & Gateway Control Modules"]
        M_Router["🚦 API Ingress & Routing Controller Module"]
        M_AuthMiddleware["🛡️ Authentication & Authorization Guard Module"]
        M_InputSanitizer["🧹 Input Validation & Schema Sanitizer Module"]
    end

    subgraph Service_Layer ["Layer 3: Application Service Modules"]
        M_UserService["👤 User & KYC Verification Service Module"]
        M_CatalogService["🚗 Vehicle Catalog & Search Service Module"]
        M_BookingService["📅 Reservation & Contract Management Service Module"]
        M_DamageService["🔍 Inspection & AI Damage Analysis Service Module"]
        M_FinanceService["💰 Financial Settlement & Deposit Strategy Service Module"]
        M_NotifyService["🔔 Notification & Dispatcher Service Module"]
    end

    subgraph Domain_Layer ["Layer 4: Domain Core & Business Rules"]
        M_DomainModel["📦 Core Entities (User, Vehicle, Rental, DamageReport)"]
        M_DepositStrategy["⚖️ Deposit Strategy Pattern Module (Full, Partial, Confiscate)"]
        M_DamageScorer["📐 Damage Zone & Cost Calculation Logic"]
    end

    subgraph Data_Access_Layer ["Layer 5: Data Access & Integration Modules"]
        M_Repo["🗄️ Persistence Repositories (CRUD & Transactions)"]
        M_ObjectVault["📁 Document & Photo Storage Adapter"]
        M_PaymentAdapter["💳 External Payment Gateway Client Adapter"]
        M_SMSAdapter["📱 External Notification Client Adapter"]
    end

    %% Dependencies (Uses)
    M_UI --> M_State
    M_State --> M_Router
    
    M_Router --> M_AuthMiddleware
    M_Router --> M_InputSanitizer
    M_Router --> M_UserService
    M_Router --> M_CatalogService
    M_Router --> M_BookingService
    M_Router --> M_DamageService
    M_Router --> M_FinanceService

    M_UserService --> M_DomainModel
    M_UserService --> M_Repo
    M_UserService --> M_ObjectVault

    M_CatalogService --> M_DomainModel
    M_CatalogService --> M_Repo

    M_BookingService --> M_DomainModel
    M_BookingService --> M_Repo
    M_BookingService --> M_FinanceService
    M_BookingService --> M_NotifyService

    M_DamageService --> M_DomainModel
    M_DamageService --> M_DamageScorer
    M_DamageService --> M_ObjectVault
    M_DamageService --> M_Repo

    M_FinanceService --> M_DomainModel
    M_FinanceService --> M_DepositStrategy
    M_FinanceService --> M_PaymentAdapter
    M_FinanceService --> M_Repo

    M_NotifyService --> M_SMSAdapter

    M_Repo --> M_DomainModel
    M_DepositStrategy --> M_DomainModel
    M_DamageScorer --> M_DomainModel

    classDef pres fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#ffffff;
    classDef ingr fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#ffffff;
    classDef serv fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ffffff;
    classDef dom fill:#78350f,stroke:#fbbf24,stroke-width:2px,color:#ffffff;
    classDef data fill:#4c1d95,stroke:#c084fc,stroke-width:2px,color:#ffffff;

    class M_UI,M_State pres;
    class M_Router,M_AuthMiddleware,M_InputSanitizer ingr;
    class M_UserService,M_CatalogService,M_BookingService,M_DamageService,M_FinanceService,M_NotifyService serv;
    class M_DomainModel,M_DepositStrategy,M_DamageScorer dom;
    class M_Repo,M_ObjectVault,M_PaymentAdapter,M_SMSAdapter data;
```

---

## 2.2 Detailed Class Diagram (Domain & Object View)

### Description
The Class Diagram models the core structural entities, their internal fields, member methods, access visibility (`+` public, `-` private, `#` protected), and precise object-oriented relationships. It demonstrates the **Strategy Pattern** applied to the security deposit computation.

```mermaid
classDiagram
    %% Core Entities
    class User {
        +UUID id
        +String fullName
        +String email
        +String phone
        +Role role
        +Boolean kycVerified
        +DateTime createdAt
        +register() Boolean
        +login(password) Token
        +uploadKYC(idPhoto, licensePhoto) Boolean
        +getProfile() UserProfile
    }

    class Renter {
        +String nationalId
        +String licenseNumber
        +List~Rental~ rentalHistory
        +searchVehicles(filterCriteria) List~Vehicle~
        +bookVehicle(vehicleId, dates) Rental
        +submitReturnPhotos(rentalId, photos) DamageReport
    }

    class VehicleOwner {
        +String bankAccountNumber
        +List~Vehicle~ fleet
        +enrollVehicle(vehicleData) Vehicle
        +approveBooking(rentalId) Boolean
        +rejectBooking(rentalId, reason) Boolean
        +getEarningsSummary() FinancialReport
    }

    class Vehicle {
        +UUID id
        +UUID ownerId
        +String make
        +String model
        +Integer year
        +String plateNumber
        +String vin
        +VehicleCategory category
        +Decimal dailyRate
        +Decimal securityDeposit
        +VehicleStatus status
        +List~String~ baselinePhotoUrls
        +isAvailable(startDate, endDate) Boolean
        +updateStatus(newStatus) Void
        +calculateRentalCost(days) Decimal
    }

    class Rental {
        +UUID id
        +UUID vehicleId
        +UUID renterId
        +UUID ownerId
        +Date startDate
        +Date endDate
        +Decimal dailyRate
        +Decimal subtotal
        +Decimal securityDeposit
        +DepositStatus depositStatus
        +Decimal depositDeduction
        +RentalStatus status
        +DateTime createdAt
        +calculateTotalCost() Decimal
        +confirm() Void
        +completeRental(returnMileage) Void
        +dispute() Void
    }

    class VehiclePhoto {
        +UUID id
        +UUID vehicleId
        +UUID rentalId
        +PhotoPhase phase
        +VehicleAngle angle
        +String storageUrl
        +DateTime uploadedAt
        +verifyImageIntegrity() Boolean
    }

    class DamageReport {
        +UUID id
        +UUID rentalId
        +UUID vehicleId
        +DamageSeverity severity
        +String overallCondition
        +Decimal totalRepairCost
        +Float confidenceScore
        +List~DamageZone~ damageZones
        +ReportStatus status
        +addDamageZone(zone) Void
        +computeTotalCost() Decimal
    }

    class DamageZone {
        +String zoneName
        +DamageType anomalyType
        +DamageSeverity severity
        +Decimal estimatedCost
        +String description
    }

    %% Strategy Pattern for Security Deposit
    class DepositStrategy {
        <<interface>>
        +calculate(depositAmount, repairCost, severity)* DepositOutcome
    }

    class FullRefundStrategy {
        +calculate(depositAmount, repairCost, severity) DepositOutcome
    }

    class PartialDeductionStrategy {
        +calculate(depositAmount, repairCost, severity) DepositOutcome
    }

    class ConfiscationStrategy {
        +calculate(depositAmount, repairCost, severity) DepositOutcome
    }

    class DepositOutcome {
        +DepositStatus status
        +Decimal amountHeld
        +Decimal deductionAmount
        +Decimal refundAmount
        +String rationale
    }

    class PaymentTransaction {
        +UUID transactionId
        +UUID rentalId
        +Decimal amount
        +TransactionType type
        +TransactionStatus status
        +String gatewayReference
        +DateTime timestamp
        +authorizeHold() Boolean
        +capturePayment() Boolean
        +executeRefund(amount) Boolean
    }

    %% Inheritance
    User <|-- Renter
    User <|-- VehicleOwner

    %% Associations
    VehicleOwner "1" *-- "0..*" Vehicle : owns
    Renter "1" --> "0..*" Rental : reserves
    Vehicle "1" <-- "0..*" Rental : rented_in
    Rental "1" *-- "0..*" VehiclePhoto : includes
    Rental "1" *-- "0..1" DamageReport : evaluates_to
    DamageReport "1" *-- "1..*" DamageZone : comprises
    Rental "1" *-- "1..*" PaymentTransaction : settles_via
    
    %% Strategy Association
    Rental ..> DepositStrategy : uses_for_settlement
    DepositStrategy <|.. FullRefundStrategy : implements
    DepositStrategy <|.. PartialDeductionStrategy : implements
    DepositStrategy <|.. ConfiscationStrategy : implements
    DepositStrategy ..> DepositOutcome : produces
```

---

# 3 & 4. Unified Component & Connector (C&C) and Allocation (Deployment) Structure Diagram

### 3.1 Unification Rationale (Physical Section, Week 9)
Per the course architectural guidelines, the **Component & Connector (C&C)** view and the **Allocation (Deployment)** view are unified into a single holistic diagram. 
- **C&C semantics:** Models concurrent executing components, data buses, thread pools, and protocols.
- **Allocation semantics:** Maps those runtime components onto physical and virtualized computing hardware, execution environments, network zones, subnets, and communication links.

### 3.2 Combined C&C + Deployment Architecture Diagram

```mermaid
flowchart TB
    subgraph Tier_Client ["CLIENT DEVICE TIER (External Public Network)"]
        node_browser["💻 Web Browser (Client Device)<br/><b>Component:</b> React/SPA Client App<br/><b>Execution:</b> V8 / WebKit JS Engine<br/><b>Protocols:</b> HTTPS / TLS 1.3"]
        node_mobile["📱 Mobile Browser (Client Device)<br/><b>Component:</b> Responsive PWA Client<br/><b>Execution:</b> Mobile Webkit<br/><b>Protocols:</b> HTTPS / TLS 1.3"]
    end

    subgraph Tier_Ingress ["INGRESS / DMZ TIER (Public Subnet - Reverse Proxy & Security Guard)"]
        node_gateway["🛡️ API Gateway & Reverse Proxy Node<br/><b>Component:</b> Ingress Controller & SSL Terminator<br/><b>Port:</b> 443 (HTTPS) / 80 (HTTP Redirect)<br/><b>Responsibilities:</b> Rate Limiting, WAF, Token Verification"]
    end

    subgraph Tier_Compute ["APPLICATION COMPUTE TIER (Private App Subnet)"]
        subgraph Node_AppServer ["Host Node: Web & API Application Server"]
            comp_web_api["⚙️ Web Application & Orchestrator Service<br/><b>Runtime:</b> Node.js Event Loop Engine<br/><b>Ports:</b> Internal :3000<br/><b>Responsibilities:</b> Routing, Auth, Booking, Catalog"]
        end

        subgraph Node_FinServer ["Host Node: Financial Management Worker Node"]
            comp_fin_worker["💼 Financial Settlement & Strategy Service<br/><b>Runtime:</b> High-Precision Application Worker<br/><b>Ports:</b> Internal :8002<br/><b>Responsibilities:</b> Deposit Calculation, Escrow, Invoicing"]
        end
    end

    subgraph Tier_AI_Compute ["SPECIALIZED HIGH-PERFORMANCE COMPUTE TIER (Isolated AI Subnet)"]
        subgraph Node_AIServer ["Host Node: GPU/SIMD Accelerated Inspection Server"]
            comp_ai_engine["🧠 Computer Vision Damage Inspection Engine<br/><b>Runtime:</b> Deep Learning Inference Engine<br/><b>Ports:</b> Internal :8001 (gRPC / HTTP REST)<br/><b>Responsibilities:</b> Anomaly Localization, Severity Grading, Cost Model"]
        end
    end

    subgraph Tier_Persistence ["DATA PERSISTENCE & STORAGE TIER (Secure Private Storage Subnet)"]
        subgraph Node_DBCluster ["Host Node: Managed Relational Database Cluster"]
            comp_rdbms["🗄️ Relational DBMS Service<br/><b>Engine:</b> ACID Relational SQL Engine<br/><b>Port:</b> Internal :5432<br/><b>Storage:</b> Encrypted Block Storage Volume (AES-256)"]
        end

        subgraph Node_ObjectStorage ["Host Node: Distributed Encrypted Object Storage Vault"]
            comp_blob["📁 Secure Object Storage Vault<br/><b>Port:</b> Internal Storage API<br/><b>Responsibilities:</b> Encrypted Baseline & Return Photos, KYC Documents"]
        end
    end

    subgraph External_Cloud ["EXTERNAL THIRD-PARTY CLOUD INTEGRATIONS"]
        ext_pay["💳 Banking & Payment Gateway API"]
        ext_gov["🏛️ National KYC Authority Gateway"]
        ext_sms["📱 SMS & Push Dispatch Service"]
    end

    %% Connectors and Communication Links
    node_browser -->|"HTTPS / TLS 1.3 (:443)<br/>REST & JSON Payload"| node_gateway
    node_mobile -->|"HTTPS / TLS 1.3 (:443)<br/>REST & JSON Payload"| node_gateway

    node_gateway -->|"Internal HTTP Proxy (:3000)<br/>Authenticated JWT Headers"| comp_web_api

    comp_web_api -->|"Internal Synchronous REST (:8002)<br/>Rental Settlement Mandate"| comp_fin_worker
    comp_web_api -->|"Internal Binary gRPC/REST (:8001)<br/>Multi-part Inspection Image Stream"| comp_ai_engine

    comp_web_api -->|"TCP Connection Pool (:5432)<br/>TLS Parameterized SQL Queries"| comp_rdbms
    comp_fin_worker -->|"TCP Connection Pool (:5432)<br/>Transactional Escrow Ledger Queries"| comp_rdbms
    comp_ai_engine -->|"TCP Connection Pool (:5432)<br/>Write Damage Assessment Records"| comp_rdbms

    comp_web_api -->|"Encrypted API Calls<br/>Store / Fetch Document Objects"| comp_blob
    comp_ai_engine -->|"Direct High-Throughput Fetch<br/>Raw Inspection Photos"| comp_blob

    comp_web_api -->|"TLS 1.3 External API Call"| ext_gov
    comp_fin_worker -->|"TLS 1.3 External Encrypted API Call"| ext_pay
    comp_web_api -->|"TLS 1.3 External API Call"| ext_sms

    classDef clientNode fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef ingressNode fill:#1e1e38,stroke:#818cf8,stroke-width:2px,color:#ffffff;
    classDef computeNode fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ffffff;
    classDef aiNode fill:#451a03,stroke:#fbbf24,stroke-width:2px,color:#ffffff;
    classDef persistNode fill:#3b0764,stroke:#c084fc,stroke-width:2px,color:#ffffff;
    classDef extNode fill:#18181b,stroke:#94a3b8,stroke-width:2px,color:#ffffff;

    class node_browser,node_mobile clientNode;
    class node_gateway ingressNode;
    class comp_web_api,comp_fin_worker computeNode;
    class comp_ai_engine aiNode;
    class comp_rdbms,comp_blob persistNode;
    class ext_pay,ext_gov,ext_sms extNode;
```

### 3.3 Hardware & Allocation Mapping Table

| Logical Runtime Component | Hosting Node / Environment | Network Zone | Protocols & Ports | Allocation Justification |
|---|---|---|---|---|
| **Web & Mobile Client Application** | End-User Client Devices (PC, Mobile, Tablets) | Public Internet | Outgoing HTTPS (Port 443) | Executed client-side; zero operational server rendering cost for static UI assets. |
| **Ingress API Gateway & WAF** | Dedicated Reverse Proxy Node | DMZ / Public Subnet (`10.0.1.0/24`) | Inbound 443, Outbound to App Subnet | Shields application servers from DDoS attacks; centralizes TLS termination and SSL certificate renewals. |
| **Web Application & Orchestrator** | Virtualized Application Server Node | Private Application Subnet (`10.0.10.0/24`) | Internal Port 3000 | Isolated from public internet; handles core orchestration, session management, and business routing. |
| **Computer Vision Damage Engine** | Accelerated Compute Node (SIMD/GPU) | Isolated AI Subnet (`10.0.11.0/24`) | Internal Port 8001 (gRPC/REST) | High-throughput image tensor manipulation requires dedicated CPU/GPU allocation without impacting general API responsiveness. |
| **Financial Strategy Service** | Application Worker Node | Private Application Subnet (`10.0.10.0/24`) | Internal Port 8002 (HTTP REST) | Decoupled financial settlement engine ensuring strict auditability and adherence to Strategy pattern. |
| **Relational Database Cluster** | High-Memory Database Node (Multi-AZ) | Private Data Subnet (`10.0.20.0/24`) | Internal Port 5432 (PostgreSQL TCP) | Only accepts inbound traffic from security groups of Application and AI nodes; encrypted persistent SSD storage. |
| **Secure Object Storage Vault** | Distributed Cloud Object Store | Managed Cloud Storage Tier | Encrypted HTTPS / IAM API | Dedicated, highly available multi-region durability for high-resolution vehicle photos and KYC documents. |

---

# 5. Sequence Diagrams (Dynamic Behavioral View)

To model the step-by-step runtime interactions for all key system operations, **a separate Sequence Diagram is provided for each of the five main user flows**.

---

## 5.1 User Flow 1: Customer Identity Verification & KYC Flow

```mermaid
sequenceDiagram
    autonumber
    actor Renter as 👤 Renter
    participant WebUI as 🖥️ Client UI
    participant Gateway as 🛡️ API Gateway
    participant UserSvc as ⚙️ User & KYC Service
    participant Vault as 📁 Secure Object Vault
    participant GovAPI as 🏛️ National KYC Authority
    participant DB as 🗄️ Relational Database

    Renter->>WebUI: 1. Upload National ID & Driver License Photos
    WebUI->>Gateway: 2. POST /api/kyc/verify (Multipart Form-Data)
    Gateway->>Gateway: 3. Verify JWT Session Token & Check Rate Limits
    Gateway->>UserSvc: 4. Forward Document Upload Payload
    
    UserSvc->>Vault: 5. Store Encrypted License & ID Images (AES-256)
    Vault-->>UserSvc: 6. Return Secure Object Storage URIs
    
    UserSvc->>GovAPI: 7. Validate ID Authenticity (NationalID, LicenseNumber)
    GovAPI-->>UserSvc: 8. Verification Success Response (Status: Valid)
    
    UserSvc->>DB: 9. UPDATE profiles SET kyc_verified=TRUE, license_url=URI WHERE id=userId
    DB-->>UserSvc: 10. Confirmation (Record Updated)
    
    UserSvc-->>Gateway: 11. Return KYC Verified Confirmation Payload
    Gateway-->>WebUI: 12. HTTP 200 OK: Profile Verified Badge
    WebUI-->>Renter: 13. Display "Account Verified: You are now eligible to rent!"
```

---

## 5.2 User Flow 2: Vehicle Search, Filter & Reservation Booking Flow

```mermaid
sequenceDiagram
    autonumber
    actor Renter as 👤 Renter
    participant WebUI as 🖥️ Client UI
    participant Gateway as 🛡️ API Gateway
    participant CatalogSvc as 🚗 Catalog Service
    participant BookingSvc as 📅 Booking Service
    participant FinSvc as 💼 Financial Service
    participant PayGW as 💳 Payment Gateway
    participant DB as 🗄️ Relational Database
    actor Owner as 👤 Vehicle Owner

    Renter->>WebUI: 1. Input Filters (Category: SUV, Dates: May 1-5, MaxRate: $150)
    WebUI->>Gateway: 2. GET /api/vehicles/search?category=suv&start=...&end=...
    Gateway->>CatalogSvc: 3. Query Available Fleet
    CatalogSvc->>DB: 4. SELECT * FROM vehicles WHERE status='available' AND NOT RESERVED
    DB-->>CatalogSvc: 5. Available Vehicles Result Set
    CatalogSvc-->>Gateway-->>WebUI: 6. Render Filtered Fleet Catalog
    
    Renter->>WebUI: 7. Select Vehicle & Click "Reserve Now"
    WebUI->>Gateway: 8. POST /api/rentals/book (VehicleId, Dates, PaymentMethod)
    Gateway->>BookingSvc: 9. Initiate Reservation Workflow
    
    BookingSvc->>DB: 10. BEGIN TRANSACTION: Lock Vehicle Row for Requested Dates
    BookingSvc->>FinSvc: 11. Compute Total Rental Cost & Mandatory Security Deposit
    FinSvc-->>BookingSvc: 12. Calculation: Subtotal $600 + Security Deposit $1,000
    
    BookingSvc->>PayGW: 13. Pre-Authorize Credit Card Hold ($1,600 Total)
    PayGW-->>BookingSvc: 14. Authorization Succeeded (Hold Reference Token)
    
    BookingSvc->>DB: 15. INSERT INTO rentals (status='pending', deposit_status='held')
    DB-->>BookingSvc: 16. Rental Record Created (ID: rent_9481)
    BookingSvc->>DB: 17. COMMIT TRANSACTION
    
    BookingSvc-->>Gateway-->>WebUI: 18. Display "Booking Placed - Awaiting Owner Approval"
    BookingSvc-)Owner: 19. Send Push/SMS Notification: "New Booking Request Received"
```

---

## 5.3 User Flow 3: AI Vehicle Damage Inspection & Assessment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Renter as 👤 Renter
    participant WebUI as 🖥️ Client UI
    participant Gateway as 🛡️ API Gateway
    participant InspectSvc as ⚙️ Inspection Orchestrator
    participant Vault as 📁 Secure Object Vault
    participant AIEngine as 🧠 Computer Vision Engine
    participant DB as 🗄️ Relational Database

    Renter->>WebUI: 1. Capture & Submit 6 Multi-Angle Return Vehicle Photos
    WebUI->>Gateway: 2. POST /api/rentals/rent_9481/inspection (Image Stream)
    Gateway->>InspectSvc: 3. Forward Inspection Stream
    
    InspectSvc->>Vault: 4. Ingest and Persist Return Images
    Vault-->>InspectSvc: 5. Return Permanent Storage URLs
    
    InspectSvc->>DB: 6. SELECT baseline_urls FROM vehicles WHERE id=vehicleId
    DB-->>InspectSvc: 7. Return Baseline Reference Images
    
    InspectSvc->>AIEngine: 8. Run Damage Inference (Baseline Images vs Return Images)
    Note over AIEngine: AIEngine executes Convolutional Feature Extraction,<br/>Object Detection & Bounding Box Anomaly Localization
    AIEngine->>AIEngine: 9. Detect: Scratch on Front Bumper, Severity: Minor
    AIEngine->>AIEngine: 10. Compute Repair Estimate: $120.00 (Calibrated for Vehicle Make)
    AIEngine-->>InspectSvc: 11. Return DamageReport Object (Confidence: 94%, Zone: Front Bumper)
    
    InspectSvc->>DB: 12. INSERT INTO ai_damage_reports (rental_id, severity, repair_cost, zones)
    DB-->>InspectSvc: 13. Confirmation Recorded
    
    InspectSvc-->>Gateway-->>WebUI: 14. Real-time Assessment Summary
    WebUI-->>Renter: 15. Display Interactive Damage Map, Repair Estimate ($120), and Photos
```

---

## 5.4 User Flow 4: Vehicle Owner Listing & Fleet Management Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as 👤 Vehicle Owner
    participant WebUI as 🖥️ Client UI
    participant Gateway as 🛡️ API Gateway
    participant CatalogSvc as 🚗 Fleet Catalog Service
    participant Vault as 📁 Secure Object Vault
    participant InsuranceAPI as 🛡️ External Insurance API
    participant DB as 🗄️ Relational Database

    Owner->>WebUI: 1. Fill Vehicle Info (Make, Model, Year, VIN, Plate, Daily Rate)
    Owner->>WebUI: 2. Upload Baseline Exterior & Interior Reference Photos
    WebUI->>Gateway: 3. POST /api/fleet/enroll (Vehicle Data + Photo Stream)
    Gateway->>CatalogSvc: 4. Forward Enrollment Mandate
    
    CatalogSvc->>InsuranceAPI: 5. Verify VIN & Retrieve Insured Market Valuation
    InsuranceAPI-->>CatalogSvc: 6. Valid VIN (Market Value: $28,000, Policy: Active)
    
    CatalogSvc->>Vault: 7. Store Baseline Reference Photos
    Vault-->>CatalogSvc: 8. Return Baseline Image URLs
    
    CatalogSvc->>DB: 9. INSERT INTO vehicles (owner_id, make, model, rate, status='available')
    DB-->>CatalogSvc: 10. Vehicle Record Created (ID: veh_512)
    
    CatalogSvc-->>Gateway-->>WebUI: 11. HTTP 201 Created: Vehicle Enrolled Successfully
    WebUI-->>Owner: 12. Display Vehicle in "Active Fleet Dashboard"
```

---

## 5.5 User Flow 5: Rental Return, Deposit Calculation & Settlement Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as 👤 Vehicle Owner
    participant WebUI as 🖥️ Client UI
    participant Gateway as 🛡️ API Gateway
    participant BookingSvc as 📅 Booking Service
    participant FinSvc as 💼 Financial Service
    participant Strategy as ⚖️ Deposit Strategy Engine
    participant PayGW as 💳 External Payment Gateway
    participant DB as 🗄️ Relational Database
    actor Renter as 👤 Renter

    Owner->>WebUI: 1. Confirm Return Odometer Mileage & Accept Damage Assessment
    WebUI->>Gateway: 2. POST /api/rentals/rent_9481/complete
    Gateway->>BookingSvc: 3. Complete Rental Request
    
    BookingSvc->>DB: 4. SELECT damage_report, security_deposit FROM rentals WHERE id='rent_9481'
    DB-->>BookingSvc: 5. Return Deposit: $1,000, Damage: Minor ($120.00 Repair Cost)
    
    BookingSvc->>FinSvc: 6. Calculate Final Deposit Settlement(Deposit=$1,000, Repair=$120, Severity='minor')
    
    Note over FinSvc,Strategy: Strategy Pattern Invocation: Selects PartialDeductionStrategy
    FinSvc->>Strategy: 7. PartialDeductionStrategy.calculate($1000, $120, 'minor')
    Strategy-->>FinSvc: 8. DepositOutcome(Status: partial_deduction, Deduct: $120, Refund: $880)
    
    FinSvc->>PayGW: 9. Capture $120 from Held Deposit (Compensation to Owner)
    PayGW-->>FinSvc: 10. Capture Authorized (Tx: cap_7731)
    
    FinSvc->>PayGW: 11. Release Remaining $880 to Renter Credit Card
    PayGW-->>FinSvc: 12. Refund Confirmed (Tx: ref_9921)
    
    FinSvc->>DB: 13. UPDATE rentals SET status='completed', deposit_status='partial_refund', deposit_deduction=120
    DB-->>FinSvc: 14. Transaction Committed
    
    FinSvc-->>BookingSvc-->>Gateway-->>WebUI: 15. Display Final Settlement Invoice
    BookingSvc-)Renter: 16. Email/SMS: "$880 Deposit Refund Released, $120 Deducted for Damage"
    BookingSvc-)Owner: 17. Email/SMS: "$120 Damage Compensation Credited to Your Account"
```

---

# 6. Architectural Patterns, Tactics, and Rationales (ADD Traceability Matrix)

### 6.1 Architectural Patterns Applied

1. **Layered Architecture Pattern (N-Tier):**
   - *Rationale:* Decouples presentation from business logic and physical storage. Ensures that changes to database schemas or third-party gateways do not ripple into user interface components.
2. **Modular Service-Oriented Decomposition:**
   - *Rationale:* Isolates computationally intensive workloads (such as Deep Learning Computer Vision inference) from transactional web handling. Guarantees that slow image processing cannot cause thread starvation for user browsing and booking.
3. **Strategy Pattern (GoF Behavioral Pattern):**
   - *Rationale:* Implemented across `DepositStrategy`, `FullRefundStrategy`, `PartialDeductionStrategy`, and `ConfiscationStrategy`. Allows business rules governing deposit deductions to evolve or vary by car tier without requiring changes to the core checkout pipeline.
4. **API Gateway & Reverse Proxy Pattern:**
   - *Rationale:* Serves as the single ingress boundary for all client devices. Consolidates SSL/TLS termination, rate-limiting, and centralized JWT authorization validation, shielding downstream internal application services.

---

### 6.2 Architectural Tactics Mapped to Prioritized Quality Attributes

| Quality Attribute | Phase 1 ASR / Scenario | Architectural Tactic Applied | Concrete Mechanism in Design | Observable Architectural Result |
|---|---|---|---|---|
| **Availability** | Scenario A-1 (Worker Failover) | **Fault Detection & Supervisor Restart** | Health check endpoints monitored by process orchestrator; stateless application nodes. | If a worker process fails, orchestrator replaces it within **2 seconds** without data corruption. |
| **Availability** | Scenario A-2 (DB Connection Failover) | **Retry with Exponential Backoff & Connection Pooling** | Data Access Repository encapsulates exponential backoff connection pool manager. | Transient network blips absorb delays without terminating active transactions. |
| **Performance** | Scenario P-1 (Catalog Search Latency) | **Resource Caching & Query Indexing** | In-memory cache layer for vehicle fleet status; indexed multi-column database keys (`category`, `daily_rate`, `status`). | 95% of catalog search requests resolve in **< 1.5 seconds** under 1,000 concurrent queries. |
| **Performance** | Scenario P-2 (Damage Analysis Latency) | **Dedicated Compute Tier & Asynchronous Processing** | Dedicated high-performance Computer Vision node with accelerated tensor inference. | Full 6-image damage inspection finishes in **< 15 seconds**. |
| **Security** | Scenario S-1 (Identity Document Protection) | **Encrypt at Rest & Encrypt in Transit** | TLS 1.3 for all ingress links; AES-256 server-side encryption for national IDs and licenses in object vault. | Zero plaintext exposure of sensitive customer documents. |
| **Security** | Scenario S-2 (Injection & Tampering Defense) | **Validate Input at Perimeter & Parameterize Queries** | API Gateway input schema validation; parameterized SQL query abstraction in Data Access Layer. | 100% of SQL injection and XSS payloads rejected at ingress. |
| **Modifiability** | Scenario M-1 (New Deposit Rules) | **Encapsulate Variation & Strategy Pattern** | Abstract `DepositStrategy` interface decouples computation logic from `Rental` orchestration. | New deposit rules introduced in **<= 2 person-days** with 0 regressions. |
| **Scalability** | Scenario SC-1 (Holiday Traffic Surge) | **Stateless Processing & Horizontal Elastic Scaling** | Stateless API workers; session state externalized via cryptographically signed tokens. | System handles 400% traffic spikes with < 20% latency variation. |

---

# 7. Board Presentation & Oral Defense Guide

When presenting this architecture on the board during your personal discussion, follow this 4-step sequence to guarantee full marks:

### Step 1: Open with the System Context (1 minute)
- Point to the central **Smart Car Rental Core System** circle.
- Explain the 3 human actors: **Renter**, **Vehicle Owner**, **Administrator**.
- Point to the 5 external systems: **Identity Authority (KYC)**, **Payment Gateway**, **SMS Provider**, **Map Service**, **Insurance API**.
- Highlight that the system boundary cleanly encapsulates all business logic while treating external APIs as peripheral services.

### Step 2: Explain the Structural Decomposition (2 minutes)
- Point to the **Uses Diagram** and explain the 5 layers: Presentation, API Control, Application Services, Domain Logic, and Data Access. Emphasize that all arrows flow **strictly downwards** (acyclic dependencies).
- Point to the **Class Diagram** and highlight the **Strategy Pattern** for `DepositStrategy` (`FullRefund`, `PartialDeduction`, `Confiscation`). Explain that this directly fulfills **Modifiability (Scenario M-1)**.

### Step 3: Walk Through the Unified C&C and Deployment Diagram (3 minutes)
- Explain why C&C and Deployment are combined: **"Per Week 9 guidelines, this maps our runtime software components directly onto their physical and virtual hardware nodes."**
- Walk through the 5 Tiers:
  1. *Client Tier:* Web and mobile browsers connecting over TLS 1.3 (:443).
  2. *Ingress / DMZ Tier:* API Gateway terminating SSL, enforcing rate limits, and protecting internal nodes.
  3. *Application Compute Tier:* Stateless Web/API and Financial Settlement nodes.
  4. *Specialized AI Compute Tier:* Dedicated inspection engine node with GPU/tensor acceleration to fulfill **Performance (Scenario P-2)**.
  5. *Persistence Tier:* Relational Database Cluster (PostgreSQL) and Encrypted Object Storage.

### Step 4: Trace a Sequence Diagram to Prove a Quality Attribute (2 minutes)
- Pick **Flow 3 (AI Damage Inspection)** or **Flow 5 (Rental Return & Settlement)**.
- Trace the exact message numbers from the Renter's photo upload down through the AI inspection engine, the database record, and the payment gateway refund.
- Conclude: **"Every design decision in Phase 2 directly originates from our Phase 1 Quality Attribute Scenarios and ASRs."**
