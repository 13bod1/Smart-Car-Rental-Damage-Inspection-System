# AWS Cloud Architecture Documentation
**Course:** Software Engineering for Cloud Applications  
**Institution:** Arab Academy for Science, Technology and Maritime Transport (AASTMT)  
**Project:** Smart Car Rental Multi-Tier Cloud Application  
**Team:** 3 Students  

---

## 1. Executive Summary & Architecture Overview

The Smart Car Rental application is implemented as an enterprise-grade, highly available, secure multi-tier architecture on Amazon Web Services (AWS). The infrastructure follows the **AWS Well-Architected Framework**, separating presentation, compute, persistent relational storage, and static object assets into distinct security and network zones.

---

## 2. Architecture Diagram

```mermaid
graph TD
    classDef client fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef vpc fill:#3b0764,stroke:#7e22ce,stroke-width:2px,stroke-dasharray: 5 5,color:#fff;
    classDef pubSubnet fill:#0369a1,stroke:#0284c7,stroke-width:1.5px,color:#fff;
    classDef privSubnet fill:#047857,stroke:#059669,stroke-width:1.5px,color:#fff;
    classDef ec2 fill:#d97706,stroke:#b45309,stroke-width:2px,color:#fff;
    classDef rds fill:#059669,stroke:#047857,stroke-width:2px,color:#fff;
    classDef s3 fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#fff;
    classDef igw fill:#4338ca,stroke:#3730a3,stroke-width:2px,color:#fff;

    Client["fa:fa-user Client / Web Browser"]:::client

    subgraph AWSCloud ["AWS Cloud Environment (eu-central-1 / us-east-1)"]
        
        S3Bucket["fa:fa-database Amazon S3 Bucket<br/>(smartcar-assets-bucket)<br/>• Vehicle photos & static assets<br/>• Direct CDN/HTTPS delivery"]:::s3

        subgraph CustomVPC ["Amazon VPC (CIDR: 10.0.0.0/16)"]
            
            IGW["fa:fa-globe Internet Gateway (IGW)<br/>Route: 0.0.0.0/0"]:::igw

            subgraph PublicZone ["Public Subnet (CIDR: 10.0.1.0/24 - AZ A)"]
                EC2["fa:fa-server Amazon EC2 Instance (t2.micro)<br/>Security Group: sg-web<br/>Inbound: Port 80 (HTTP), Port 22 (SSH)<br/>Runs Node.js + Express + EJS App"]:::ec2
            end

            subgraph PrivateZone ["Private Subnet (CIDR: 10.0.11.0/24 - AZ A & AZ B)"]
                RDS["fa:fa-database Amazon RDS Instance (db.t3.micro)<br/>Security Group: sg-rds<br/>Inbound: Port 3306 (MySQL) from sg-web ONLY<br/>No Public IP"]:::rds
            end

        end
    end

    %% Network & Application Flows
    Client -->|"1. HTTP GET / POST (Port 80)"| IGW
    IGW -->|"2. Forward to Public Subnet"| EC2
    EC2 -->|"3. Query / Insert Cars (TCP 3306)"| RDS
    EC2 -->|"4. PutObject / Upload Photo (AWS SDK v3)"| S3Bucket
    Client -.->|"5. Direct S3 Image Render via HTTPS"| S3Bucket
```

---

## 3. Network Topology & Subnet Breakdown

| Component | CIDR / Identifier | Availability Zone | Routing / Access | Role in Project |
| :--- | :--- | :--- | :--- | :--- |
| **Amazon VPC** | `10.0.0.0/16` | Multi-AZ | Dedicated virtual network | Complete boundary isolation |
| **Internet Gateway** | `igw-smartcar` | Region-wide | Attached to Custom VPC | Grants internet access to public subnets |
| **Public Subnet A** | `10.0.1.0/24` | `az-a` | Route `0.0.0.0/0` -> `igw` | Hosts the web server EC2 instance |
| **Public Subnet B** | `10.0.2.0/24` | `az-b` | Route `0.0.0.0/0` -> `igw` | Multi-AZ redundancy & RDS Subnet Group |
| **Private Subnet A** | `10.0.11.0/24` | `az-a` | Local route only (`10.0.0.0/16`) | Hosts primary Amazon RDS DB |
| **Private Subnet B** | `10.0.12.0/24` | `az-b` | Local route only (`10.0.0.0/16`) | RDS DB Subnet Group failover subnet |

---

## 4. Security Group Configurations (Least Privilege)

### A. Web Server Security Group (`sg-web`)
Attached to: **Amazon EC2 Instance**
* **Inbound Rules:**
  * `HTTP` (TCP Port 80) from `0.0.0.0/0` (Allows end-users to visit website).
  * `SSH` (TCP Port 22) from Administrator IP (Allows secure server management).
* **Outbound Rules:**
  * All traffic allowed (`0.0.0.0/0`) for downloading packages and communicating with AWS services.

### B. Database Security Group (`sg-rds`)
Attached to: **Amazon RDS MySQL/PostgreSQL Instance**
* **Inbound Rules:**
  * `MySQL/Aurora` (TCP Port 3306) **ONLY** from source security group `sg-web`.
  * *Critical Security Feature:* No IP address range (`0.0.0.0/0`) can touch the database. The database is invisible to the public internet.
* **Outbound Rules:**
  * Restricted to internal VPC response traffic.

---

## 5. Storage Architecture & Media Flow

1. **Amazon EC2 Root Volume (EBS):**
   * Stores the operating system (Amazon Linux 2023), Node.js runtime, and application source code.
2. **Amazon S3 (`smartcar-assets-...`):**
   * Stores user-uploaded vehicle photos.
   * Eliminates state on the EC2 instance, allowing future autoscaling without file synchronization issues.
   * Web frontend renders images directly via public HTTPS S3 Object URLs.
3. **Amazon RDS (`car_rental_db`):**
   * Persists vehicle metadata: `make`, `model`, `year`, `category`, `daily_rate`, `description`, and `image_url` (pointing to S3).

---

## 6. Official AWS Architecture Diagram Submission Checklist

When presenting this diagram to the examination committee:
- [x] **AWS Cloud Boundary** clearly delineated with region notation.
- [x] **Custom Amazon VPC** with CIDR block specified (`10.0.0.0/16`).
- [x] **Subnets** differentiated between Public Subnet (with IGW route) and Private Subnet (isolated).
- [x] **Amazon EC2** placed inside Public Subnet with port 80 listener.
- [x] **Amazon RDS** placed inside Private Subnet with DB Subnet Group across 2 AZs.
- [x] **Amazon S3** placed in AWS Cloud, connected via IAM Role / SDK.
- [x] **Security Groups** explicitly labeled showing port and source filtering.
- [x] **User Flow Arrow** traversing from Internet -> IGW -> EC2 -> RDS / S3.

