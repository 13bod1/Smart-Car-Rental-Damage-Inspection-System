# Deployment Guide: Smart Car Rental on AWS
**Course:** Software Engineering for Cloud Applications — AASTMT  
**Target Services:** Amazon VPC, Amazon EC2, Amazon RDS, Amazon S3  

---

## Method A: 1-Click CloudFormation Deployment (Recommended)

This method automatically provisions the entire architecture (VPC, 4 Subnets, Internet Gateway, Route Tables, Security Groups, S3 Bucket, RDS MySQL instance, and EC2 Web Server) without manual networking errors.

### Step 1: Open AWS CloudFormation
1. Log in to your **AWS Management Console** (AWS Academy Learner Lab or Personal AWS Account).
2. Set your desired region at the top right (e.g., `us-east-1` N. Virginia or `eu-central-1` Frankfurt).
3. In the search bar at the top, type **CloudFormation** and open the service.

### Step 2: Create Stack
1. Click the orange **Create stack** button (select **With new resources (standard)**).
2. Under **Prerequisite - Prepare template**, select **Template is ready**.
3. Under **Specify template**, select **Upload a template file**.
4. Click **Choose file** and select `aws-smart-car-rental/cloudformation.yaml`.
5. Click **Next**.

### Step 3: Configure Stack Parameters
1. **Stack name:** Enter `SmartCarRentalProject`.
2. **EnvironmentType:**
   - Select **`AcademyLab`** if using **AWS Academy Learner Lab** (uses the pre-existing `LabInstanceProfile`).
   - Select **`StandardAWS`** if using a personal AWS Free Tier account.
3. **DBUsername:** Keep `admin` (or choose a custom username).
4. **DBPassword:** Keep `Password123!` (or enter your custom secure password).
5. Click **Next** -> Click **Next** on the Configure stack options page.
6. Scroll to the bottom and click **Submit**.

### Step 4: Access Your Live Website
1. CloudFormation will display **CREATE_IN_PROGRESS**.
2. Wait approximately 5 to 7 minutes until the status turns to **CREATE_COMPLETE**.
3. Click the **Outputs** tab in CloudFormation.
4. You will see:
   - **`WebsiteURL`**: Click the link (e.g. `http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com`) to open your live 3-page website!
   - **`RDSEndpoint`**: Hostname of your Amazon RDS database.
   - **`S3BucketName`**: Name of your created Amazon S3 bucket.

---

## Method B: Step-by-Step AWS Management Console Deployment

If your professor requires manual console creation and screenshots:

### Step 1: Create Amazon S3 Bucket
1. Go to **S3** in the AWS Console -> Click **Create bucket**.
2. Bucket name: `smartcar-assets-student-[your-name]` (must be globally unique).
3. AWS Region: Select your current region.
4. Uncheck **Block *all* public access** (acknowledge warning).
5. Click **Create bucket**.
6. Open your bucket -> Go to **Permissions** tab -> Scroll to **Bucket Policy** -> Click **Edit** -> Paste:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```
   *(Replace `YOUR-BUCKET-NAME` with your actual bucket name)* -> Click **Save changes**.

### Step 2: Create Custom VPC & Subnets
1. Go to **VPC** -> Click **Create VPC**.
2. Choose **VPC and more** (this automatically designs subnets and route tables):
   - Name tag: `SmartCar-VPC`
   - IPv4 CIDR: `10.0.0.0/16`
   - Number of Availability Zones (AZs): `2`
   - Number of public subnets: `2` (e.g., `10.0.1.0/24`, `10.0.2.0/24`)
   - Number of private subnets: `2` (e.g., `10.0.11.0/24`, `10.0.12.0/24`)
   - NAT gateways: `None` (avoids charges!)
   - VPC Endpoints: `None`
3. Click **Create VPC**.

### Step 3: Create Security Groups
1. In the VPC Console, click **Security Groups** on the left menu -> Click **Create security group**.
2. **Web Security Group (`sg-web`):**
   - Name: `SmartCar-Web-SG`
   - VPC: Select `SmartCar-VPC`.
   - Inbound Rules:
     - Type: `HTTP`, Port: `80`, Source: `0.0.0.0/0` (Anywhere-IPv4).
     - Type: `SSH`, Port: `22`, Source: `0.0.0.0/0` (or My IP).
   - Click **Create security group**.
3. **Database Security Group (`sg-rds`):**
   - Name: `SmartCar-RDS-SG`
   - VPC: Select `SmartCar-VPC`.
   - Inbound Rules:
     - Type: `MySQL/Aurora`, Port: `3306`, Source: Type `Custom` and select `SmartCar-Web-SG`.
   - Click **Create security group**.

### Step 4: Create Amazon RDS Database
1. Go to **RDS** -> Click **Subnet groups** -> Click **Create DB Subnet Group**:
   - Name: `smartcar-db-subnet-group`
   - VPC: Select `SmartCar-VPC`.
   - Add subnets: Choose both Availability Zones and select your **Private Subnets** (`10.0.11.0/24` and `10.0.12.0/24`).
   - Click **Create**.
2. Click **Databases** on the left menu -> Click **Create database**:
   - Choose **Standard create**.
   - Engine: **MySQL** (or PostgreSQL).
   - Templates: **Free tier**.
   - DB instance identifier: `smartcar-db-instance`.
   - Master username: `admin`.
   - Master password: `Password123!`.
   - DB instance class: `db.t3.micro`.
   - Storage: 20 GiB (gp2 / gp3).
   - Connectivity:
     - VPC: Select `SmartCar-VPC`.
     - DB Subnet Group: `smartcar-db-subnet-group`.
     - Public access: **No** (keeps database securely private).
     - Existing VPC security groups: Select `SmartCar-RDS-SG` (remove default).
   - Additional configuration:
     - Initial database name: `car_rental_db`.
3. Click **Create database** (takes ~5 minutes).
4. Once **Available**, copy the **Endpoint** (e.g. `smartcar-db-instance.xxxxxx.rds.amazonaws.com`).

### Step 5: Launch Amazon EC2 Instance
1. Go to **EC2** -> Click **Launch instances**:
   - Name: `SmartCar-Web-Server`.
   - AMI: **Amazon Linux 2023 AMI**.
   - Instance type: `t2.micro` (or `t3.micro`).
   - Key pair: Select or create a key pair (e.g., `vockey` in AWS Academy).
   - Network settings (click **Edit**):
     - VPC: `SmartCar-VPC`.
     - Subnet: Select **Public Subnet A** (`10.0.1.0/24`).
     - Auto-assign public IP: **Enable**.
     - Security Group: Select existing `SmartCar-Web-SG`.
   - Advanced details:
     - IAM instance profile: Select **`LabInstanceProfile`** (in AWS Academy) or an EC2 role with S3 permissions.
     - User data (at the very bottom): Paste the startup bash script from `cloudformation.yaml` or run manually via SSH.
2. Click **Launch instance**.
3. When the instance status changes to **Running**, copy its **Public IPv4 address** and open `http://<YOUR-EC2-PUBLIC-IP>` in your browser!

---

## Verifying All 3 Project Pages

1. **Page 1 (Home Page - `/`):**
   - Displays real-time telemetry from EC2 metadata service, RDS connection status, S3 bucket name, and VPC zone.
2. **Page 2 (Fleet Catalog - `/cars`):**
   - Demonstrates active SQL `SELECT` queries executing against Amazon RDS.
   - Images are rendered directly from Amazon S3.
3. **Page 3 (Add Vehicle - `/cars/new`):**
   - Fill in car details and select an image.
   - Click **Upload & Save Vehicle**.
   - The backend sends the binary file to Amazon S3 via AWS SDK v3 `PutObjectCommand`, stores metadata in Amazon RDS, and redirects to `/cars` with the new vehicle visible!

