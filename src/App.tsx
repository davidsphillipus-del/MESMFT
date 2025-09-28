import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg-primary)'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid var(--border-primary)',
      borderTop: '4px solid var(--primary-600)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
)

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const PatientPortal = lazy(() => import('./pages/PatientPortal'))
const DoctorPortal = lazy(() => import('./pages/DoctorPortal'))
const NursePortal = lazy(() => import('./pages/NursePortal'))
const ReceptionistPortal = lazy(() => import('./pages/ReceptionistPortal'))
const PharmacistPortal = lazy(() => import('./pages/PharmacistPortal'))
const AdminPortal = lazy(() => import('./pages/AdminPortal'))
const EducationBot = lazy(() => import('./pages/EducationBot'))
const DiagnosisBot = lazy(() => import('./pages/DiagnosisBot'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* AI Tools - Available to all authenticated users */}
            <Route path="/education-bot" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'ADMIN']}>
                <EducationBot />
              </ProtectedRoute>
            } />
            <Route path="/diagnosis-bot" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'ADMIN']}>
                <DiagnosisBot />
              </ProtectedRoute>
            } />

            {/* Protected routes */}
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientPortal />
              </ProtectedRoute>
            } />
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorPortal />
              </ProtectedRoute>
            } />
            <Route path="/nurse" element={
              <ProtectedRoute allowedRoles={['NURSE']}>
                <NursePortal />
              </ProtectedRoute>
            } />
            <Route path="/receptionist" element={
              <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistPortal />
              </ProtectedRoute>
            } />
            <Route path="/pharmacist" element={
              <ProtectedRoute allowedRoles={['PHARMACIST']}>
                <PharmacistPortal />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPortal />
              </ProtectedRoute>
            } />

            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
