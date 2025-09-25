# 🏥 MESMTF - Medical Expert System for Malaria & Typhoid Fever

[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive healthcare management system designed to assist medical professionals in diagnosing and treating malaria and typhoid fever. Features role-based access control, AI-powered diagnosis assistance, and complete patient management workflows.

## 🌟 Features

### 👨‍⚕️ **Role-Based Portals**
- **Doctor Portal**: Patient management, diagnosis tools, prescription management
- **Nurse Portal**: Patient care, vital signs tracking, episode management  
- **Pharmacist Portal**: Medication dispensing, inventory management, drug interactions
- **Receptionist Portal**: Appointment scheduling, patient registration, communications
- **Patient Portal**: Medical records access, appointment booking, health education
- **Admin Portal**: System management, user administration, reporting

### 🤖 **AI-Powered Features**
- **Intelligent Diagnosis**: AI-assisted symptom analysis and diagnosis suggestions
- **Educational Content**: Role-based medical education and guidelines
- **Drug Interaction Checker**: Comprehensive medication safety analysis
- **Clinical Decision Support**: Evidence-based treatment recommendations

### 📊 **Healthcare Management**
- **Patient Management**: Complete medical history and demographics
- **Appointment System**: Scheduling and calendar management
- **Episode Tracking**: Clinical episodes and care coordination
- **Prescription Management**: Digital prescribing and dispensing workflow
- **Inventory Control**: Medical supplies and medication tracking
- **Real-time Notifications**: System-wide communication and alerts

## 🚀 Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API communication

### **Backend**
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **JWT Authentication** with refresh tokens
- **OpenAI Integration** for AI features
- **Socket.IO** for real-time features

### **Security & Performance**
- **CORS Protection**
- **Rate Limiting**
- **Input Validation** with Zod
- **Password Hashing** with bcrypt
- **Session Management** with Redis

## 📋 Prerequisites

- **Node.js** (v18.0 or higher)
- **PostgreSQL** (v13 or higher)
- **Redis** (optional, for session management)
- **npm** or **yarn** package manager

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/mesmtf-healthcare-system.git
cd mesmtf-healthcare-system
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Frontend environment
cp .env.example .env

# Backend environment  
cp backend/.env.example backend/.env
```

Edit the environment files with your configuration:
- Database connection string
- JWT secrets
- OpenAI API key (optional)
- Redis URL (optional)

### 4. Database Setup
```bash
cd backend
npx prisma generate
npx prisma db push
cd ..
```

### 5. Start Development Servers

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:5000`

**Frontend** (Terminal 2):
```bash
npm start
```
Frontend will run on: `http://localhost:3000`

## 👥 Test Users

The system comes with pre-configured test users for all roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@mesmtf.com | password123 |
| Doctor | doctor1@mesmtf.com | password123 |
| Nurse | nurse1@mesmtf.com | password123 |
| Receptionist | receptionist1@mesmtf.com | password123 |
| Pharmacist | pharmacist1@mesmtf.com | password123 |
| Patient | patient1@mesmtf.com | password123 |

*Additional users available for each role (admin2, doctor2, etc.)*

## 📁 Project Structure

```
mesmtf-healthcare-system/
├── README.md                          # Project documentation
├── package.json                       # Frontend dependencies
├── .gitignore                        # Git ignore rules
├── src/                              # Frontend source code
│   ├── components/                   # React components
│   ├── pages/                        # Page components
│   ├── services/                     # API services
│   └── contexts/                     # React contexts
├── backend/                          # Backend application
│   ├── src/                          # Backend source code
│   ├── prisma/                       # Database schema
│   └── package.json                  # Backend dependencies
└── docs/                             # Documentation files
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - User logout

### **Patient Management**
- `GET /api/v1/patients` - Get all patients
- `GET /api/v1/patients/:id` - Get patient details
- `PUT /api/v1/patients/:id` - Update patient

### **Appointments**
- `GET /api/v1/appointments` - Get appointments
- `POST /api/v1/appointments` - Create appointment
- `PUT /api/v1/appointments/:id` - Update appointment

### **Prescriptions**
- `GET /api/v1/prescriptions` - Get prescriptions
- `POST /api/v1/prescriptions` - Create prescription
- `POST /api/v1/prescriptions/:id/dispense` - Dispense prescription

## 🛡️ Security Features

- **JWT Authentication** with access and refresh tokens
- **Role-based Access Control** (RBAC)
- **Password Hashing** with bcrypt
- **CORS Protection** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Input Validation** with comprehensive schemas
- **SQL Injection Protection** via Prisma ORM

## 🚀 Deployment

### **Frontend Deployment**
- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Drag and drop build folder or connect repository
- **AWS S3**: Static website hosting with CloudFront

### **Backend Deployment**
- **Heroku**: Easy deployment with PostgreSQL add-on
- **Railway**: Modern deployment platform
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2 with RDS for database

## 📚 Documentation

- [Setup Guide](./GITHUB_PUSH_GUIDE.md) - Complete setup instructions
- [Integration Guide](./FRONTEND_BACKEND_INTEGRATION.md) - Frontend-backend integration
- [API Documentation](./backend/docs/) - Complete API reference
- [User Manual](./docs/USER_MANUAL.md) - End-user documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI-powered diagnostic assistance
- React team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and healthcare professionals who provided feedback

## 📞 Support

For support, email support@mesmtf.com or create an issue in this repository.

---

**Built with ❤️ for healthcare professionals worldwide** 🌍
