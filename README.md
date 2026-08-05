# SQLLab (SQL Tutor)

SQLLab is an interactive, highly-scalable platform for learning SQL, practicing queries, and optimizing database performance. Built with a modern microservices architecture, it provides users with personalized sandbox databases, an IDE-like coding environment, and a gamified learning experience to master SQL concepts from basic `SELECT` statements to complex window functions and performance tuning.

## 🌟 Key Features

### 💻 Professional Workspace
- **IDE-Like Interface**: A resizable, split-pane workspace (built with custom resizable hooks) resembling VS Code.
- **Intelligent Autocomplete**: Trie-based autocomplete for SQL keywords, tables, and columns dynamically populated from your sandbox schema.
- **Query History & Persistence**: Save your queries, view execution history, and seamlessly pick up where you left off.

### 🛡️ Secure Multi-Tenant Architecture
- **Database Isolation**: Every user gets their own isolated MySQL sandbox environment (`user_{id}_...`) dynamically routed and managed by the SQL service.
- **System Protection**: Rigorous security checks and query rewriting ensure users cannot modify system databases or interfere with other users' data.

### 🎮 Gamified Learning
- **SQL Challenges**: Practice specific topics (e.g., Joins, Aggregation, CTEs) with real-time feedback against hidden test cases.
- **Dynamic Leaderboard**: Global ranking system implemented with Max Heaps to surface top performers based on XP and completed challenges.
- **Profile Stats**: Live tracking of your daily streak, accuracy, and detailed skill progression across different SQL operations.

### 🚀 Performance & Analytics
- **Query Execution Plans**: Run `EXPLAIN` on your queries directly from the UI to receive automated optimization suggestions (e.g., detecting full table scans).
- **Event-Driven Architecture**: Real-time stats updating powered by Redis Pub/Sub, separating heavy analytical workloads from core execution paths.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Build Tool**: Vite

### Backend (Microservices)
- **Runtime**: Node.js (Express.js)
- **API Gateway**: `http-proxy-middleware` for routing and rate limiting.
- **Database**: MySQL 8.0
- **Caching & Pub/Sub**: Redis
- **Monorepo Management**: PNPM Workspaces

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD Pipeline**: Jenkins (Automated builds, Docker Hub pushes, and SSH deployments)
- **Hosting**: AWS EC2
- **Proxy/Web Server**: NGINX

---

## 🧩 Microservices Architecture

SQLLab is composed of specialized, decoupled services:

1. **Gateway (`/gateway`)**: The entry point for all client requests. Handles rate limiting and proxies traffic to the appropriate downstream service.
2. **Auth Service (`/services/auth-service`)**: Manages user registration, login, JWT issuance, and session management.
3. **SQL Service (`/services/sql-service`)**: The core execution engine. Handles multi-tenant database provisioning, query execution, caching, schema retrieval, and query optimization analysis.
4. **Challenge Service (`/services/challenge-service`)**: Manages the SQL problem sets, hidden test cases, submissions, and leaderboard rankings.
5. **Analytics Service (`/services/analytics-service`)**: An event-driven service that listens to Redis Pub/Sub events to compile usage data and platform-wide metrics.

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- [Docker & Docker Desktop](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (v18+)
- [PNPM](https://pnpm.io/) (`npm install -g pnpm`)

### 1. Running with Docker Compose (Recommended)
You can spin up the required databases (MySQL, Redis) using Docker Compose, and run the services locally.

```bash
# Start MySQL and Redis
docker compose up -d

# Install monorepo dependencies
pnpm install

# Start all microservices and the React client concurrently
pnpm run dev
```
The application will be available at `http://localhost:5173`.

### 2. Database Initialization
The database schema and initial practice data are automatically seeded via the scripts in the `./docker/mysql/` directory when the MySQL container starts up. The `sql-service` will also automatically initialize the global practice database.

---

## 🚢 Deployment (AWS EC2)

The platform is deployed using a fully automated Jenkins CI/CD pipeline defined in `Jenkinsfile`.

### Pipeline Stages:
1. **Build**: Builds Docker images for the client, gateway, and all 4 microservices.
2. **Push**: Pushes the tagged images to Docker Hub.
3. **Deploy**: SSH's into the AWS EC2 instance.
4. **Run**: Pulls the latest images and orchestrates them using `docker-compose.prod.yml`.

### Manual Deployment
If you need to deploy manually on a production server:
```bash
# Export your registry prefix
export REGISTRY_PREFIX=yourdockerhubusername/

# Pull the latest images
docker compose -f docker-compose.prod.yml pull

# Start the production environment
docker compose -f docker-compose.prod.yml up -d
```
The production environment routes traffic through an NGINX container that serves the built React static files and proxies `/api` calls to the Gateway on port `3000`.

---

## 🤝 Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request