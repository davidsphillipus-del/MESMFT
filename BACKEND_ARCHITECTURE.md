# MESMTF Backend Architecture

## 🏗️ **Technology Stack**

### **Core Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (primary) + Redis (caching/sessions)
- **ORM**: Prisma (type-safe database access)
- **Authentication**: JWT + bcrypt
- **API Documentation**: Swagger/OpenAPI

### **AI & ML**
- **AI Framework**: OpenAI GPT-4 API for diagnosis and education
- **Medical Knowledge**: Custom medical database + external medical APIs
- **Vector Database**: Pinecone/Weaviate for medical knowledge retrieval
- **ML Libraries**: TensorFlow.js for client-side symptom analysis

### **Infrastructure**
- **File Storage**: AWS S3 or local storage for medical documents
- **Email Service**: SendGrid/Nodemailer for notifications
- **Real-time**: Socket.io for live notifications
- **Monitoring**: Winston logging + health checks

---

## 📊 **Database Schema Design**

### **Core Entities**

#### **Users & Authentication**
```sql
Users (id, email, password_hash, role, created_at, updated_at)
UserProfiles (user_id, first_name, last_name, phone, address, emergency_contact)
UserSessions (id, user_id, token, expires_at, created_at)
```

#### **Patient Management**
```sql
Patients (id, user_id, patient_id, date_of_birth, gender, blood_type, allergies)
MedicalRecords (id, patient_id, record_type, data, created_by, created_at)
VitalSigns (id, patient_id, temperature, blood_pressure, heart_rate, recorded_at)
LabResults (id, patient_id, test_type, results, reference_ranges, ordered_by)
```

#### **Clinical Workflow**
```sql
Episodes (id, patient_id, diagnosis, status, priority, assigned_doctor, start_date)
Appointments (id, patient_id, doctor_id, scheduled_time, status, type, notes)
Prescriptions (id, patient_id, doctor_id, medications, dosage, instructions)
NursingNotes (id, episode_id, nurse_id, notes, timestamp, care_plan)
```

#### **Pharmacy & Inventory**
```sql
Medications (id, name, category, description, contraindications, dosage_forms)
Inventory (id, medication_id, stock_quantity, min_stock, expiry_date, batch_number)
DispensingQueue (id, prescription_id, status, prepared_by, prepared_at, priority)
PharmacyConsultations (id, patient_id, pharmacist_id, type, scheduled_time, notes)
```

#### **Communication & Notifications**
```sql
Messages (id, from_user_id, to_user_id, subject, content, timestamp, read_status)
Notifications (id, user_id, type, title, message, read_status, created_at)
SystemAlerts (id, alert_type, severity, message, affected_users, resolved_at)
```

---

## 🔌 **API Endpoints Structure**

### **Authentication & Users** (`/api/auth`)
```
POST   /api/auth/login           - User login
POST   /api/auth/register        - User registration  
POST   /api/auth/logout          - User logout
GET    /api/auth/me              - Get current user
PUT    /api/auth/profile         - Update user profile
POST   /api/auth/forgot-password - Password reset request
```

### **Patient Management** (`/api/patients`)
```
GET    /api/patients             - List patients (role-based)
POST   /api/patients             - Create new patient
GET    /api/patients/:id         - Get patient details
PUT    /api/patients/:id         - Update patient info
GET    /api/patients/:id/records - Get medical records
POST   /api/patients/:id/records - Add medical record
GET    /api/patients/:id/vitals  - Get vital signs
POST   /api/patients/:id/vitals  - Record vital signs
```

### **Clinical Management** (`/api/clinical`)
```
GET    /api/clinical/episodes    - List episodes
POST   /api/clinical/episodes    - Create episode
PUT    /api/clinical/episodes/:id - Update episode
GET    /api/clinical/appointments - List appointments
POST   /api/clinical/appointments - Schedule appointment
GET    /api/clinical/prescriptions - List prescriptions
POST   /api/clinical/prescriptions - Create prescription
```

### **Pharmacy** (`/api/pharmacy`)
```
GET    /api/pharmacy/inventory   - Get inventory status
PUT    /api/pharmacy/inventory/:id - Update stock
GET    /api/pharmacy/dispensing  - Get dispensing queue
PUT    /api/pharmacy/dispensing/:id - Update dispensing status
GET    /api/pharmacy/consultations - List consultations
POST   /api/pharmacy/consultations - Schedule consultation
```

### **AI Services** (`/api/ai`)
```
POST   /api/ai/diagnosis         - AI diagnosis analysis
POST   /api/ai/education         - AI health education
GET    /api/ai/medical-knowledge - Search medical database
POST   /api/ai/symptom-checker   - Symptom analysis
```

### **Communication** (`/api/communication`)
```
GET    /api/communication/messages - Get messages
POST   /api/communication/messages - Send message
PUT    /api/communication/messages/:id - Mark as read
GET    /api/communication/notifications - Get notifications
POST   /api/communication/notifications - Create notification
```

---

## 🤖 **AI Implementation Strategy**

### **Diagnosis Bot Architecture**
1. **Symptom Collection**: Structured symptom input with severity scoring
2. **Medical Knowledge Base**: Curated database of diseases, symptoms, and treatments
3. **AI Analysis**: GPT-4 integration for differential diagnosis
4. **Confidence Scoring**: Probability-based diagnosis ranking
5. **Safety Protocols**: Always recommend professional medical consultation

### **Education Bot Architecture**
1. **Content Database**: Structured health education content
2. **Personalization**: User role and history-based content delivery
3. **Interactive Learning**: Q&A format with follow-up questions
4. **Progress Tracking**: Learning completion and knowledge retention
5. **Multilingual Support**: Content in local languages

---

## 🔒 **Security & Compliance**

### **Data Protection**
- **Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit
- **HIPAA Compliance**: Audit logs, access controls, data anonymization
- **Role-Based Access**: Granular permissions for different user types
- **API Security**: Rate limiting, input validation, SQL injection prevention

### **Authentication & Authorization**
- **JWT Tokens**: Short-lived access tokens + refresh tokens
- **Multi-Factor Authentication**: Optional 2FA for sensitive operations
- **Session Management**: Secure session handling with Redis
- **Password Policy**: Strong password requirements + bcrypt hashing

---

## 📁 **Project Structure**
```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── models/          # Database models (Prisma)
│   ├── middleware/      # Auth, validation, logging
│   ├── routes/          # API route definitions
│   ├── utils/           # Helper functions
│   ├── ai/              # AI service integrations
│   ├── config/          # Configuration files
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── tests/               # Unit and integration tests
├── docs/                # API documentation
└── scripts/             # Deployment and utility scripts
```

This architecture provides a solid foundation for a production-ready healthcare management system with AI capabilities!
