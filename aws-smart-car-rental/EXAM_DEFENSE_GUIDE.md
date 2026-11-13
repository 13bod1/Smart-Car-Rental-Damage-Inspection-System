# Section 6: Individual Knowledge Defense & Oral Exam Guide
**Course:** Software Engineering for Cloud Applications — AASTMT  
**Requirement Focus:** Individual Grading Preparation for Team of 3 Students  

---

> [!IMPORTANT]
> **Project Requirement #6 states:**  
> *"Every team member must understand every service used in the project, not only the part they personally built... Each student will be asked individually during the discussion, and grading is individual."*  
> Use this guide to ensure all 3 students understand the complete AWS ecosystem.

---

## Student 1 Specialist Focus: Amazon VPC & Networking Architecture

### Q1: What is an Amazon VPC, and why did you create a custom one instead of using the Default VPC?
* **Answer:** A VPC (Virtual Private Cloud) is our logically isolated virtual network within AWS. While AWS provides a Default VPC, creating a custom VPC (`10.0.0.0/16`) allows us to design a custom IP address allocation scheme, implement true multi-tier network segregation (public vs private subnets), and enforce enterprise defense-in-depth security standards required for production systems.

### Q2: What is the difference between your Public Subnet and Private Subnet?
* **Answer:** 
  * A **Public Subnet** has an entry in its Route Table pointing destination `0.0.0.0/0` (all internet traffic) to an **Internet Gateway (IGW)**, and instances inside receive a Public IPv4 address. Our EC2 web server resides here so users can access the website.
  * A **Private Subnet** has NO route to an Internet Gateway and instances do not receive public IP addresses. Our Amazon RDS database is placed here to protect it from direct external attacks.

### Q3: What is a Route Table, and how does traffic exit to the Internet?
* **Answer:** A Route Table contains a set of rules (routes) that determine where network traffic from our subnets is directed. In our public route table, local VPC traffic stays inside `10.0.0.0/16`, while internet-bound traffic (`0.0.0.0/0`) is routed to the target `igw-xxxxxxxx`.

---

## Student 2 Specialist Focus: Amazon EC2 & Web Server Hosting

### Q4: How does the EC2 instance launch and start the application automatically?
* **Answer:** We used **EC2 User Data**, a bash script that executes automatically with root privileges upon the first boot of the instance. The script updates the operating system, installs Node.js 20 and Git, pulls the application source code, installs production dependencies, configures `.env` with RDS and S3 parameters, and registers the server as a persistent `systemd` background service on port 80.

### Q5: How are Security Groups configured between EC2 and RDS?
* **Answer:** 
  * The EC2 Security Group (`sg-web`) allows inbound traffic on port 80 (HTTP) and port 22 (SSH) from `0.0.0.0/0`.
  * The RDS Security Group (`sg-rds`) allows inbound traffic on port 3306 (MySQL) **referenced by Security Group ID (`sg-web`)** rather than an IP CIDR. This means only traffic originating from our web server is allowed to connect, even if other instances exist in the VPC.

### Q6: If the EC2 instance terminates, what happens to the data?
* **Answer:** Because our application follows cloud-native stateless principles:
  * Persistent vehicle records remain safely preserved in **Amazon RDS**.
  * User-uploaded vehicle photos remain safely preserved in **Amazon S3**.
  * A replacement EC2 instance can be launched via our User Data script or CloudFormation template within 2 minutes with zero data loss.

---

## Student 3 Specialist Focus: Amazon RDS & Amazon S3 Object Storage

### Q7: Why use Amazon RDS instead of installing MySQL directly on the EC2 instance?
* **Answer:** Amazon RDS is a fully managed Database-as-a-Service (DBaaS). It offloads administrative operational overhead:
  * Automated OS patching and software maintenance.
  * Automated automated daily snapshots and point-in-time recovery.
  * Easy Multi-AZ failover and read replica scaling.
  * Built-in CloudWatch database metrics (CPU, IOPS, connection counts).
  Installing MySQL on EC2 would make EC2 stateful, consume EC2 memory, and risk total data loss if the EBS volume fails without manual backup automation.

### Q8: What is an RDS DB Subnet Group, and why does RDS require at least two subnets?
* **Answer:** A DB Subnet Group is a collection of subnets designated for RDS inside our VPC. AWS strictly mandates that a DB Subnet Group must span **at least two different Availability Zones** (e.g. `eu-central-1a` and `eu-central-1b`). This ensures that if we enable Multi-AZ replication, RDS can instantly launch a synchronous standby replica in the second AZ for high availability.

### Q9: Why store images in Amazon S3 instead of saving them to the EC2 hard drive (EBS)?
* **Answer:** 
  1. **Durability:** S3 offers 99.999999999% (11 9s) of durability by automatically replicating objects across multiple physical data centers.
  2. **Stateless Web Tier:** EC2 instances can scale in and out without worrying about missing local image files.
  3. **Performance:** Browsers download car images directly from S3's high-speed distributed object endpoints, eliminating I/O and bandwidth load on our EC2 web server.

### Q10: How does the EC2 application authenticate to Amazon S3 to upload files?
* **Answer:** We use an **IAM Instance Profile (Role)** attached directly to the EC2 instance. The AWS SDK v3 automatically queries the EC2 Instance Metadata Service (`http://169.254.169.254/latest/meta-data/iam/security-credentials/`) to acquire temporary rotating credentials. **No AWS secret keys are hardcoded in the source code**, adhering to AWS Security Best Practices.

---

## Rapid-Fire Cross-Cutting Questions for All 3 Students

| Question | Core Concept to Mention |
| :--- | :--- |
| **"What port does the user connect on?"** | Port 80 (HTTP) or 443 (HTTPS) through the Internet Gateway to EC2. |
| **"What port connects EC2 to RDS?"** | Port 3306 (MySQL) or Port 5432 (PostgreSQL) strictly inside the VPC private subnets. |
| **"Is your RDS database accessible from your laptop at home?"** | **No.** It is located in a private subnet with `PubliclyAccessible: false` and a security group that only accepts connections from the EC2 security group. |
| **"What AWS SDK library is used in the project?"** | `@aws-sdk/client-s3` (AWS SDK v3 for JavaScript / Node.js) using the `PutObjectCommand`. |
| **"How did you verify your 3 pages?"** | Page 1 (`/`): Health dashboard; Page 2 (`/cars`): Dynamic `SELECT` query from RDS; Page 3 (`/cars/new`): Direct `PutObject` to S3 + SQL `INSERT` to RDS. |

