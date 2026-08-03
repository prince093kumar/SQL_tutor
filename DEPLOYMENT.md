# SQLLab Deployment Guide (Jenkins -> AWS EC2)

This document outlines how to set up the necessary AWS infrastructure and Jenkins configuration to execute the `Jenkinsfile` CI/CD pipeline.

## 1. Docker Hub Setup

This CI/CD pipeline pushes images to Docker Hub rather than AWS ECR.
You don't need to manually create repositories; Docker Hub will create them automatically on the first push under your namespace (`prince093kumar`). 

## 2. Target EC2 Setup

The application will be deployed to a single EC2 instance using Docker Compose.

1. **Launch an EC2 Instance** (Ubuntu 22.04 LTS recommended, t3.medium or larger).
2. **Open Security Groups**:
   - Port 22 (SSH)
   - Port 80 (HTTP for Client)
   - Port 3000 (API Gateway, optional if you route everything through client Nginx, but recommended for debugging).
3. **Install Docker and Docker Compose** on the instance:
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io docker-compose -y
   sudo usermod -aG docker ubuntu
   ```

## 3. Jenkins Configuration

Your Jenkins server will need specific plugins and credentials.

### Plugins Required
- **Docker Pipeline**
- **SSH Agent**

### Credentials Configuration
Based on your Jenkins setup, ensure the following credentials exist with exact IDs:
1. **`dockerhub`** (Username with password): Your Docker Hub username (`prince093kumar`) and password/access token.
2. **`aws-key`** (SSH Username with private key): 
   - Username: `ubuntu`
   - Private Key: The `.pem` key used to SSH into your EC2 instance.

### System Dependencies on Jenkins Agent
Ensure the machine running the Jenkins agent has:
- **Docker** installed and running.
- **Node.js & pnpm** (or handled dynamically by Jenkins).
- **AWS CLI v2** installed so Jenkins can execute `aws ecr get-login-password`.

## 4. Environment Variables

The `docker-compose.prod.yml` references several environment variables. You must provide a `.env` file on the EC2 server, or export these before running docker-compose.
For an MVP, the simplest approach is to SSH into the EC2 instance once and create a `.env` file in the home directory (`/home/ubuntu/`).

*(Windows tip: You can SSH into your EC2 instance directly from PowerShell using your `.pem` key)*:
```powershell
ssh -i "path\to\your-key.pem" ubuntu@54.172.118.6
```

Then create your `.env` file on the server:

```bash
# /home/ubuntu/.env
JWT_SECRET=super_secret_production_key_here
```
*(You can also use AWS Secrets Manager or Parameter Store for more advanced configurations in the future).*

## 5. Pipeline Execution

Once configured, create a new **Pipeline** job in Jenkins, point it to this Git repository, and Jenkins will automatically execute the `Jenkinsfile`.

It will:
1. Build all 6 Docker images from the root.
2. Push them to your AWS ECR.
3. SSH into the EC2 instance, copy over the `docker-compose.prod.yml` and database seed scripts.
4. Pull the latest images and reboot the containers with zero downtime.
