# Smart Car Rental — AWS Multi-Tier Cloud Application
**Course:** Software Engineering for Cloud Applications  
**Institution:** Arab Academy for Science, Technology and Maritime Transport (AASTMT)  
**Team Formation:** 3 Students  

---

## 1. Project Overview & Deliverables Checklist

This project implements and deploys a complete 3-tier web application running on Amazon Web Services (AWS), adhering strictly to all requirements specified in the project rubric:

- [x] **Website Deliverable:** Functional 3-page web application deployed on AWS and accessible via public HTTP.
- [x] **Amazon VPC:** Custom virtual network (`10.0.0.0/16`) with Public & Private Subnets across 2 Availability Zones, Route Tables, and Internet Gateway.
- [x] **Amazon EC2:** Compute instance hosting the Node.js/Express web application with automated systemd lifecycle management.
- [x] **Amazon S3:** Object storage bucket (`smartcar-assets-...`) storing user-uploaded vehicle photos and assets.
- [x] **Amazon RDS:** Managed relational database (`car_rental_db`) storing vehicle records in private subnets.
- [x] **AWS Architecture Diagram:** Submitted in both SVG/web format and high-resolution documentation adhering to official AWS architecture standards.
- [x] **Individual Knowledge:** Comprehensive defense preparation guide for all 3 team members.

---

## 2. Team Member Information

| Student Name | Student ID | Specialty Focus for Discussion |
| :--- | :--- | :--- |
| *Student 1* | *[ID Here]* | **Amazon VPC & Network Topology** (Subnets, IGW, Route Tables, Security Groups) |
| *Student 2* | *[ID Here]* | **Amazon EC2 & Web Hosting** (AMI, UserData, systemd, Port 80, Express app) |
| *Student 3* | *[ID Here]* | **Amazon RDS & Amazon S3** (DB Subnet Groups, SQL, Object Storage, IAM Instance Profile) |

---

## 3. Website Pages Summary (Minimum 3 Pages Required)

| Page | URL Route | Cloud Service Integration | Description |
| :--- | :--- | :--- | :--- |
| **Page 1: Home** | `/` | **Amazon EC2 + VPC Telemetry** | Displays platform hero, live AWS health status (instance ID, AZ, RDS status, S3 bucket). |
| **Page 2: Fleet Catalog** | `/cars` | **Amazon RDS (MySQL / PostgreSQL)** | Dynamic data page querying `cars` table in RDS with category filtering and pricing. |
| **Page 3: Add Vehicle** | `/cars/new` | **Amazon S3 + Amazon RDS** | Form page uploading car images directly to **Amazon S3** (`PutObject`) and inserting metadata into **Amazon RDS**. |
| **Bonus: Architecture** | `/architecture` | **Full AWS Cloud Topology** | Embedded interactive architecture diagram and oral defense study notes. |

---

## 4. Required AWS Services & Configurations

### 1. Amazon VPC (Virtual Private Cloud)
- **VPC CIDR:** `10.0.0.0/16`
- **Public Subnet A:** `10.0.1.0/24` (AZ: `us-east-1a` or `eu-central-1a`) — Hosts the EC2 Web Server with Public IPv4.
- **Public Subnet B:** `10.0.2.0/24` (AZ: `us-east-1b` or `eu-central-1b`) — Redundant subnet for high availability.
- **Private Subnet A:** `10.0.11.0/24` (AZ: `us-east-1a` or `eu-central-1a`) — Isolated subnet hosting Amazon RDS.
- **Private Subnet B:** `10.0.12.0/24` (AZ: `us-east-1b` or `eu-central-1b`) — Required by RDS DB Subnet Group.
- **Internet Gateway:** Attached to Custom VPC; Public Route Table routes `0.0.0.0/0` -> `igw`.

### 2. Security Groups (Defense-in-Depth)
- **Web Security Group (`sg-web`):**
  - Inbound: Port 80 (HTTP) from `0.0.0.0/0`, Port 22 (SSH) from `0.0.0.0/0`.
- **RDS Security Group (`sg-rds`):**
  - Inbound: Port 3306 (MySQL) **ONLY** from source `sg-web` (no public IP allowed).

### 3. Amazon EC2 (Elastic Compute Cloud)
- **Instance Type:** `t2.micro` or `t3.micro` (Free Tier).
- **AMI:** Amazon Linux 2023.
- **User Data Automation:** Installs Node.js 20, pulls code, injects RDS endpoints, and starts service via `systemd`.
- **IAM Role:** `LabInstanceProfile` (or custom EC2 role) granting access to Amazon S3 without hardcoded keys.

### 4. Amazon S3 (Simple Storage Service)
- **Bucket Name:** `smartcar-assets-${AWS::AccountId}-${AWS::Region}`
- **Usage:** Stores vehicle photos submitted via Page 3.
- **Delivery:** Direct high-speed CDN/HTTPS delivery to client browsers.

### 5. Amazon RDS (Relational Database Service)
- **Engine:** MySQL 8.0 (or PostgreSQL).
- **Instance Class:** `db.t3.micro`.
- **Access:** Placed strictly in private subnets with `PubliclyAccessible: false`.
- **Database Name:** `car_rental_db`.
- **Table:** `cars` (`id`, `make`, `model`, `year`, `category`, `daily_rate`, `description`, `image_url`, `created_at`).

---

## 5. Quick Deployment Instructions

### 1-Click AWS CloudFormation Deployment:
1. Open [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation).
2. Click **Create stack** -> **Upload a template file**.
3. Choose `cloudformation.yaml`.
4. Enter Stack name `SmartCarProject`.
   - If using **AWS Academy Learner Lab**, keep `EnvironmentType: AcademyLab`.
   - If using **Personal AWS Account**, select `EnvironmentType: StandardAWS`.
5. Click **Next** -> **Next** -> **Submit**.
6. In ~5 minutes, check the **Outputs** tab for your public website link (`WebsiteURL`)!

---

## 6. Project Documentation Index

- [AWS Architecture Diagram & Topology](file:///c:/Users/User/.gemini/antigravity-ide/scratch/smart-car-rental/aws-smart-car-rental/AWS_ARCHITECTURE_DIAGRAM.md)
- [Step-by-Step Deployment Guide](file:///c:/Users/User/.gemini/antigravity-ide/scratch/smart-car-rental/aws-smart-car-rental/DEPLOYMENT_GUIDE.md)
- [Oral Exam & Defense Study Guide (Section 6)](file:///c:/Users/User/.gemini/antigravity-ide/scratch/smart-car-rental/aws-smart-car-rental/EXAM_DEFENSE_GUIDE.md)
- [CloudFormation Infrastructure Template](file:///c:/Users/User/.gemini/antigravity-ide/scratch/smart-car-rental/aws-smart-car-rental/cloudformation.yaml)
- [Database Schema & Seed Script](file:///c:/Users/User/.gemini/antigravity-ide/scratch/smart-car-rental/aws-smart-car-rental/db/init.sql)

