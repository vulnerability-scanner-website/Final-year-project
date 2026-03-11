# Security Scanner - Web Vulnerability Detection System

A comprehensive web application security scanner built with React, Node.js, and Docker. Integrates OWASP ZAP and Nuclei for automated vulnerability detection.

## Features

- 🔍 **Automated Security Scanning** - Scan websites for vulnerabilities using industry-standard tools
- 🛡️ **Multiple Scanner Support** - OWASP ZAP, Nuclei, and Nikto integration
- 📊 **Real-time Dashboard** - View scan results and vulnerabilities in an intuitive interface
- 🔐 **User Authentication** - Secure JWT-based authentication system
- 📈 **Vulnerability Management** - Track, categorize, and manage security findings
- 🐳 **Docker-based** - Easy deployment with Docker Compose

## Tech Stack

### Frontend
- Next.js 16
- React
- Tailwind CSS
- Recharts for data visualization

### Backend
- Node.js
- Fastify
- PostgreSQL
- JWT Authentication

### Security Scanners
- OWASP ZAP (Zed Attack Proxy)
- Nuclei
- Nikto

## Prerequisites

- Docker Desktop
- Node.js 20+ (for local development)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/security-scanner.git
cd security-scanner
```

2. Start all services with Docker Compose:
```bash
docker-compose up -d
```

3. Wait for all containers to start (about 30 seconds)

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ZAP API: http://localhost:9090

## Default Credentials

- **Email**: admin@security.com
- **Password**: admin123

⚠️ Change these credentials in production!

## Usage

### Starting a Scan

1. Log in to the dashboard
2. Click "New Scan"
3. Enter target URL (e.g., http://pensive_saha:3000 for Juice Shop)
4. Select scan type:
   - **ZAP** - Comprehensive active + passive scanning (Recommended)
   - **Nuclei** - Fast template-based vulnerability detection
   - **Nikto** - Web server security checks
   - **Full** - All scanners combined
5. Click "Start Scan"

### Viewing Results

- **Scan Management**: View all scans and their status
- **Vulnerabilities Tab**: See all detected vulnerabilities
- **Scan Details**: Click on a scan to view detailed findings

## Project Structure

```
.
├── backend/
│   ├── routes/          # API endpoints
│   ├── services/        # Scanner integration
│   ├── server.js        # Main server
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   └── components/  # React components
│   └── Dockerfile
├── scanner/
│   └── Dockerfile       # Scanner tools container
├── docker-compose.yml   # Container orchestration
└── README.md
```

## Database Schema

- **users** - User accounts and authentication
- **scans** - Scan records and status
- **vulnerabilities** - Detected security issues
- **reports** - Generated security reports
- **notifications** - User notifications
- **settings** - Application settings
- **pricing** - Subscription plans

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Scans
- `GET /api/scans` - List all scans
- `POST /api/scans` - Create new scan
- `GET /api/scans/:id` - Get scan details
- `DELETE /api/scans/:id` - Delete scan

### Vulnerabilities
- `GET /api/vulnerabilities` - List all vulnerabilities
- `GET /api/scans/:scanId/vulnerabilities` - Get vulnerabilities for a scan
- `GET /api/vulnerabilities/:id` - Get vulnerability details

## Testing with Vulnerable Applications

The project includes test targets:

- **OWASP Juice Shop**: http://localhost:3001
- **DVWA**: http://localhost:8080

Start them with:
```bash
docker start pensive_saha  # Juice Shop
docker start dvwa-target   # DVWA
```

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

### Containers not starting
```bash
docker-compose down
docker-compose up -d --build
```

### Scan shows 0 vulnerabilities
- Ensure target container is running
- Check backend logs: `docker logs security-scanner-backend`
- Verify ZAP is running: `docker ps | grep zap`

### Database connection issues
```bash
docker-compose restart postgres
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is for educational purposes (Final Year Project).

## Acknowledgments

- OWASP ZAP Team
- ProjectDiscovery (Nuclei)
- OWASP Juice Shop (Test target)

## Authors

- Your Name - Final Year Project

## Screenshots

[Add screenshots of your dashboard, scan results, and vulnerability details]

## Future Enhancements

- Real-time scan progress tracking
- PDF report generation
- Email notifications
- Scheduled scans
- Multi-user support with roles
- Integration with CI/CD pipelines
