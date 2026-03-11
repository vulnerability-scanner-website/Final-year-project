# Docker Setup

## Prerequisites
- Docker Desktop installed
- Docker Compose installed

## Quick Start

1. **Build and start all services:**
```bash
docker-compose up --build
```

2. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

3. **Stop all services:**
```bash
docker-compose down
```

4. **Stop and remove volumes (clean database):**
```bash
docker-compose down -v
```

## Individual Services

**Start only backend:**
```bash
docker-compose up backend
```

**Start only frontend:**
```bash
docker-compose up frontend
```

**View logs:**
```bash
docker-compose logs -f
```

## Database Access

**Connect to PostgreSQL:**
```bash
docker exec -it security-scanner-db psql -U admin -d security_scanner
```

**Credentials:**
- User: admin
- Password: admin123
- Database: security_scanner

## Troubleshooting

**Rebuild containers:**
```bash
docker-compose up --build --force-recreate
```

**Remove all containers and volumes:**
```bash
docker-compose down -v
docker system prune -a
```
