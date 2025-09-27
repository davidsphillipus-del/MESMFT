import React, { useState, useEffect } from 'react'

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

interface PatientSearchProps {
  onSelectPatient?: (patient: Patient) => void
  showActions?: boolean
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient, showActions = true }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm))
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  const loadPatients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/v1/patients', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setPatients(data.data)
        setFilteredPatients(data.data)
      }
    } catch (error) {
      console.error('Failed to load patients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    onSelectPatient?.(patient)
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient Search</h3>
      
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="text-gray-500">Loading patients...</div>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-3">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
              </div>
              
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {patient.firstName} {patient.lastName}
                      </h4>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <div>📧 {patient.email}</div>
                        {patient.phone && <div>📞 {patient.phone}</div>}
                        {patient.dateOfBirth && (
                          <div>🎂 Age: {calculateAge(patient.dateOfBirth)} years</div>
                        )}
                        {patient.gender && <div>👤 {patient.gender}</div>}
                      </div>
                    </div>
                    
                    {showActions && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle view patient details
                            console.log('View patient:', patient.id)
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle edit patient
                            console.log('Edit patient:', patient.id)
                          }}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Selected Patient Info */}
      {selectedPatient && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Selected Patient</h4>
          <div className="text-sm text-blue-700">
            <strong>{selectedPatient.firstName} {selectedPatient.lastName}</strong>
            <br />
            {selectedPatient.email}
            {selectedPatient.phone && (
              <>
                <br />
                {selectedPatient.phone}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientSearch
