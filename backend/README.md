# MESMTF Healthcare Backend

A simple, working backend for the MESMTF Healthcare Management System.

## Features

- ✅ **Express.js** server with CORS support
- ✅ **SQLite** database (no setup required)
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **User Management** (Register, Login, Profile)
- ✅ **Role-based Access Control** (PATIENT, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ADMIN)
- ✅ **Database Tables** for users, patients, appointments, medical records
- ✅ **Pre-seeded Users** for testing

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Server will run on:** http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users` - Get all users (Admin only)

### Health Check
- `GET /health` - Server health status

## Test Users

All users have password: `healthcare123`

| Role | Email | Name |
|------|-------|------|
| **DOCTOR** | dr.michael.brown@hospital.com | Dr. Michael Brown |
| **DOCTOR** | dr.emily.davis@hospital.com | Dr. Emily Davis |
| **NURSE** | lisa.wilson@hospital.com | Lisa Wilson |
| **NURSE** | james.taylor@hospital.com | James Taylor |
| **RECEPTIONIST** | maria.garcia@hospital.com | Maria Garcia |
| **RECEPTIONIST** | david.martinez@hospital.com | David Martinez |
| **PHARMACIST** | robert.anderson@pharmacy.com | Robert Anderson |
| **PHARMACIST** | jennifer.thomas@pharmacy.com | Jennifer Thomas |
| **PATIENT** | john.smith@email.com | John Smith |
| **PATIENT** | sarah.johnson@email.com | Sarah Johnson |
| **ADMIN** | admin.manager@hospital.com | System Administrator |
| **ADMIN** | it.support@hospital.com | IT Support |

## Database

- **Type:** SQLite
- **File:** `healthcare.db` (created automatically)
- **Tables:** users, patients, appointments, medical_records

## Dependencies

- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `sqlite3` - SQLite database driver

## Environment

- **Node.js:** >= 14.0.0
- **Port:** 5001
- **Database:** SQLite (file-based, no setup required)
