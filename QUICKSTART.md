# Quick Start Guide for Team Members

## Prerequisites
- Docker Desktop installed and running
- Git installed

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/vulnerability-scanner-website/Final-year-project.git
cd Final-year-project
```

### 2. Checkout the Alpha Branch
```bash
git checkout alpha
```

### 3. Create Environment File
Copy the example environment file:
```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

### 4. Start the Application
```bash
docker-compose up -d
```

This will start all services:
- Backend API (Port 5000)
- Frontend (Port 3000)
- PostgreSQL Database (Port 5432)
- ZAP Scanner (Port 9090)
- DVWA Test Target (Port 8080)

### 5. Wait for Services to Start
Give it about 30-60 seconds for all services to initialize.

### 6. Access the Application
Open your browser and go to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health

### 7. Login Credentials
Default admin account:
- Email: `admin@security.com`
- Password: `admin123`

## Troubleshooting

### Services not starting?
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Need to rebuild?
```bash
# Stop and remove containers
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Database issues?
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

## Project Structure
```
Final-year-project/
├── backend/          # Node.js API server
├── frontend/         # Next.js frontend
├── scanner/          # Security scanning tools
├── docker-compose.yml # Docker orchestration
└── .env.example      # Environment variables template
```

## Development Workflow

1. Pull latest changes:
   ```bash
   git pull origin alpha
   ```

2. Make your changes

3. Test locally with Docker

4. Commit and push:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin alpha
   ```

## Need Help?
Contact the team lead or check the documentation in the `/docs` folder.
