import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PatientPortal from './pages/PatientPortal'
import DoctorPortal from './pages/DoctorPortal'
import NursePortal from './pages/NursePortal'
import ReceptionistPortal from './pages/ReceptionistPortal'
import PharmacistPortal from './pages/PharmacistPortal'
import EducationBot from './pages/EducationBot'
import DiagnosisBot from './pages/DiagnosisBot'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/education-bot" element={<EducationBot />} />
          <Route path="/diagnosis-bot" element={<DiagnosisBot />} />

          {/* Protected routes */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientPortal />
            </ProtectedRoute>
          } />
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorPortal />
            </ProtectedRoute>
          } />
          <Route path="/nurse" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NursePortal />
            </ProtectedRoute>
          } />
          <Route path="/receptionist" element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <ReceptionistPortal />
            </ProtectedRoute>
          } />
          <Route path="/pharmacist" element={
            <ProtectedRoute allowedRoles={['pharmacist']}>
              <PharmacistPortal />
            </ProtectedRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
