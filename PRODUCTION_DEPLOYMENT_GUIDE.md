# 🚀 MESMTF Production Deployment Guide

This guide provides comprehensive instructions for deploying the MESMTF Healthcare Management System to production.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **Operating System**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 10GB free space
- **Network**: Stable internet connection for AI services

### Optional Requirements
- **Docker**: For containerized deployment
- **Nginx**: For reverse proxy and load balancing
- **SSL Certificate**: For HTTPS in production

## 🔧 Environment Setup

### 1. Clone and Setup
```bash
git clone <repository-url>
cd mesmft
```

### 2. Environment Variables
Copy the example environment files and configure them:

```bash
# Frontend environment
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env
```

### 3. Configure Environment Variables

#### Frontend (.env)
```env
NODE_ENV=production
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_API_TIMEOUT=10000
```

#### Backend (backend/.env)
```env
NODE_ENV=production
PORT=5001
DATABASE_PATH=./data/healthcare.db
JWT_SECRET=your-super-secure-jwt-secret-here
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGIN=https://your-domain.com
BCRYPT_ROUNDS=12
```

## 🚀 Deployment Methods

### Method 1: Simple Deployment (Recommended for small setups)

1. **Run the deployment script:**
```bash
chmod +x deploy.sh
./deploy.sh
```

2. **Verify deployment:**
```bash
curl http://localhost:5001/health
```

### Method 2: Docker Deployment (Recommended for production)

1. **Build and start services:**
```bash
docker-compose up -d
```

2. **Check service status:**
```bash
docker-compose ps
docker-compose logs -f
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Health Check: http://localhost:5001/health

### Method 3: Manual Deployment

1. **Install dependencies:**
```bash
# Frontend
npm ci --production=false

# Backend
cd backend
npm ci --production=false
cd ..
```

2. **Run database migrations:**
```bash
cd backend
npm run migrate
npm run backup
cd ..
```

3. **Build frontend:**
```bash
npm run build:prod
```

4. **Start backend:**
```bash
cd backend
npm run prod
```

## 🔒 Security Configuration

### 1. SSL/HTTPS Setup
For production, always use HTTPS:

```bash
# Generate SSL certificate (Let's Encrypt example)
sudo certbot --nginx -d your-domain.com
```

### 2. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. Environment Security
- Use strong, unique passwords
- Rotate JWT secrets regularly
- Keep API keys secure
- Enable database encryption if needed

## 📊 Monitoring and Maintenance

### 1. Health Checks
The system provides several health check endpoints:

- **Application Health**: `GET /health`
- **API Status**: `GET /api/v1/status`
- **Database Status**: Included in health check

### 2. Logging
Logs are stored in:
- **Backend logs**: `backend/logs/`
- **Deployment logs**: `deploy.log`
- **Nginx logs**: `/var/log/nginx/` (if using Nginx)

### 3. Database Backups
Automated backups are configured:

```bash
# Manual backup
cd backend
npm run backup

# Restore from backup
cp backups/healthcare-backup-YYYY-MM-DD.db healthcare.db
```

### 4. Updates and Maintenance
```bash
# Update dependencies
npm update
cd backend && npm update

# Rebuild and redeploy
./deploy.sh
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
# Find and kill process using port 5001
lsof -ti:5001 | xargs kill -9
```

2. **Database connection errors:**
```bash
# Check database file permissions
ls -la backend/healthcare.db
chmod 644 backend/healthcare.db
```

3. **Frontend build errors:**
```bash
# Clear cache and rebuild
npm run clean
npm ci
npm run build:prod
```

4. **API connection errors:**
- Check CORS configuration
- Verify API base URL in frontend
- Check network connectivity

### Performance Optimization

1. **Enable Gzip compression** (handled by Nginx)
2. **Use CDN** for static assets
3. **Database optimization**:
```bash
# Analyze database
sqlite3 backend/healthcare.db "ANALYZE;"
```

4. **Monitor resource usage**:
```bash
# Check memory and CPU usage
htop
df -h
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use shared database or database clustering

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Use caching (Redis, Memcached)

## 🔄 CI/CD Pipeline

For automated deployments, consider setting up:

1. **GitHub Actions** or **GitLab CI**
2. **Automated testing** before deployment
3. **Blue-green deployments** for zero downtime
4. **Rollback procedures** for quick recovery

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- [ ] Weekly database backups verification
- [ ] Monthly security updates
- [ ] Quarterly dependency updates
- [ ] SSL certificate renewal (if using Let's Encrypt)

### Monitoring Checklist
- [ ] Application uptime
- [ ] Database performance
- [ ] API response times
- [ ] Error rates
- [ ] Resource utilization

## 🎉 Post-Deployment Verification

After deployment, verify:

1. **Frontend loads correctly**
2. **All user roles can login**
3. **API endpoints respond**
4. **Database operations work**
5. **AI services function**
6. **File uploads work**
7. **Email notifications send** (if configured)

## 📚 Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Docker Production Guide](https://docs.docker.com/config/containers/start-containers-automatically/)
- [SSL/TLS Best Practices](https://wiki.mozilla.org/Security/Server_Side_TLS)

---

**🏥 MESMTF Healthcare System is now ready for production use!**

For support, please check the documentation or contact the development team.
