import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AppointmentBooking from '../appointments/AppointmentBooking'
import AppointmentList from '../appointments/AppointmentList'
import PatientSearch from '../search/PatientSearch'
import MedicalRecordForm from '../medical/MedicalRecordForm'
import PrescriptionForm from '../prescriptions/PrescriptionForm'
import VitalSignsForm from '../vitals/VitalSignsForm'
import AIChat from '../chat/AIChat'

interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
}

const InteractiveDashboard: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<'appointment' | 'medical-record' | 'prescription' | 'vital-signs' | null>(null)

  const openModal = (content: 'appointment' | 'medical-record' | 'prescription' | 'vital-signs') => {
    setModalContent(content)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalContent(null)
  }

  const handleSuccess = () => {
    closeModal()
    // Refresh data if needed
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'records', label: 'Medical Records', icon: '📋' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'vitals', label: 'Vital Signs', icon: '❤️' },
    { id: 'ai-diagnosis', label: 'AI Diagnosis', icon: '🩺' },
    { id: 'ai-education', label: 'AI Education', icon: '📚' }
  ]

  const quickActions = [
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      icon: '📅',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => openModal('appointment'),
      roles: ['PATIENT', 'RECEPTIONIST', 'DOCTOR', 'NURSE']
    },
    {
      id: 'add-medical-record',
      label: 'Add Medical Record',
      icon: '📋',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        if (!selectedPatient) {
          alert('Please select a patient first')
          return
        }
        openModal('medical-record')
      },
      roles: ['DOCTOR', 'NURSE']
    },
    {
      id: 'create-prescription',
      label: 'Create Prescription',
      icon: '💊',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => {
        if (!selectedPatient) {
          alert('Please select a patient first')
          return
        }
        openModal('prescription')
      },
      roles: ['DOCTOR']
    },
    {
      id: 'record-vitals',
      label: 'Record Vital Signs',
      icon: '❤️',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => {
        if (!selectedPatient) {
          alert('Please select a patient first')
          return
        }
        openModal('vital-signs')
      },
      roles: ['DOCTOR', 'NURSE']
    },
    {
      id: 'ai-diagnosis',
      label: 'AI Diagnosis Chat',
      icon: '🩺',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: () => setActiveTab('ai-diagnosis'),
      roles: ['DOCTOR', 'NURSE', 'PATIENT']
    },
    {
      id: 'ai-education',
      label: 'AI Health Education',
      icon: '📚',
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => setActiveTab('ai-education'),
      roles: ['DOCTOR', 'NURSE', 'PATIENT', 'RECEPTIONIST', 'PHARMACIST', 'ADMIN']
    }
  ]

  const availableActions = quickActions.filter(action => 
    action.roles.includes(user?.role || '')
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Healthcare Dashboard
            </h1>
            <div className="text-sm text-gray-600">
              Welcome, {user?.firstName} {user?.lastName} ({user?.role})
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        {activeTab === 'overview' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`${action.color} text-white p-4 rounded-lg shadow-md transition-colors flex items-center space-x-3`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Patient Info */}
        {selectedPatient && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Selected Patient</h3>
            <div className="text-blue-700">
              <strong>{selectedPatient.firstName} {selectedPatient.lastName}</strong>
              <br />
              📧 {selectedPatient.email}
              {selectedPatient.phone && (
                <>
                  <br />
                  📞 {selectedPatient.phone}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeTab === 'overview' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>New appointment booked for tomorrow</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Medical record updated</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Prescription dispensed</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Backend API</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI Services</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'patients' && (
            <div className="lg:col-span-2">
              <PatientSearch onSelectPatient={setSelectedPatient} />
            </div>
          )}

          {activeTab === 'appointments' && (
            <>
              <div className="lg:col-span-1">
                <AppointmentBooking onSuccess={handleSuccess} />
              </div>
              <div className="lg:col-span-1">
                <AppointmentList
                  patientId={user?.role === 'PATIENT' ? user.id : undefined}
                  doctorId={user?.role === 'DOCTOR' ? user.id : undefined}
                />
              </div>
            </>
          )}

          {activeTab === 'records' && selectedPatient && (
            <div className="lg:col-span-2">
              <MedicalRecordForm 
                patientId={selectedPatient.id} 
                onSuccess={handleSuccess} 
              />
            </div>
          )}

          {activeTab === 'prescriptions' && selectedPatient && (
            <div className="lg:col-span-2">
              <PrescriptionForm
                patientId={selectedPatient.id}
                onSuccess={handleSuccess}
              />
            </div>
          )}

          {activeTab === 'vitals' && selectedPatient && (
            <div className="lg:col-span-2">
              <VitalSignsForm
                patientId={selectedPatient.id}
                onSuccess={handleSuccess}
              />
            </div>
          )}

          {activeTab === 'ai-diagnosis' && (
            <div className="lg:col-span-2">
              <AIChat mode="diagnosis" />
            </div>
          )}

          {activeTab === 'ai-education' && (
            <div className="lg:col-span-2">
              <AIChat mode="education" />
            </div>
          )}

          {(activeTab === 'records' || activeTab === 'prescriptions' || activeTab === 'vitals') && !selectedPatient && (
            <div className="lg:col-span-2 text-center py-12">
              <div className="text-gray-500">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium mb-2">No Patient Selected</h3>
                <p>Please select a patient from the Patients tab first.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {modalContent === 'appointment' && 'Book Appointment'}
                  {modalContent === 'medical-record' && 'Add Medical Record'}
                  {modalContent === 'prescription' && 'Create Prescription'}
                  {modalContent === 'vital-signs' && 'Record Vital Signs'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {modalContent === 'appointment' && (
                <AppointmentBooking onSuccess={handleSuccess} onCancel={closeModal} />
              )}
              {modalContent === 'medical-record' && selectedPatient && (
                <MedicalRecordForm 
                  patientId={selectedPatient.id} 
                  onSuccess={handleSuccess} 
                  onCancel={closeModal} 
                />
              )}
              {modalContent === 'prescription' && selectedPatient && (
                <PrescriptionForm
                  patientId={selectedPatient.id}
                  onSuccess={handleSuccess}
                  onCancel={closeModal}
                />
              )}
              {modalContent === 'vital-signs' && selectedPatient && (
                <VitalSignsForm
                  patientId={selectedPatient.id}
                  onSuccess={handleSuccess}
                  onCancel={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveDashboard
