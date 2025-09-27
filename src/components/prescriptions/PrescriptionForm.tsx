import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface Medication {
  id: number
  name: string
  genericName: string
  category: string
  dosageForm: string
  strength: string
}

interface PrescriptionFormProps {
  patientId: number
  onSuccess?: () => void
  onCancel?: () => void
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ patientId, onSuccess, onCancel }) => {
  const { user } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([])
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMeds, setIsLoadingMeds] = useState(true)

  useEffect(() => {
    loadMedications()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMedications([])
    } else {
      const filtered = medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10) // Limit to 10 results
      setFilteredMedications(filtered)
    }
  }, [searchTerm, medications])

  const loadMedications = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/medications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setMedications(data.data)
      }
    } catch (error) {
      console.error('Failed to load medications:', error)
    } finally {
      setIsLoadingMeds(false)
    }
  }

  const handleMedicationSelect = (medication: Medication) => {
    setSelectedMedication(medication)
    setFormData(prev => ({
      ...prev,
      medicationName: medication.name
    }))
    setSearchTerm(medication.name)
    setFilteredMedications([])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/v1/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          patientId,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Prescription created successfully!')
        setFormData({
          medicationName: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        })
        setSearchTerm('')
        setSelectedMedication(null)
        onSuccess?.()
      } else {
        alert(`Failed to create prescription: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to create prescription:', error)
      alert('Failed to create prescription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Create Prescription</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medication Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medication *
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for medication..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Medication Dropdown */}
            {filteredMedications.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredMedications.map((medication) => (
                  <div
                    key={medication.id}
                    onClick={() => handleMedicationSelect(medication)}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{medication.name}</div>
                    <div className="text-sm text-gray-600">
                      {medication.genericName} - {medication.strength} {medication.dosageForm}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected Medication Info */}
          {selectedMedication && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-800">{selectedMedication.name}</div>
              <div className="text-sm text-blue-600">
                Generic: {selectedMedication.genericName} | 
                Strength: {selectedMedication.strength} | 
                Form: {selectedMedication.dosageForm}
              </div>
            </div>
          )}
        </div>

        {/* Dosage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosage *
          </label>
          <input
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            required
            placeholder="e.g., 500mg, 1 tablet, 5ml"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency *
          </label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select frequency...</option>
            {frequencyOptions.map((freq) => (
              <option key={freq} value={freq}>
                {freq}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 7 days, 2 weeks, 1 month"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={3}
            placeholder="Special instructions for the patient..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.medicationName}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Prescription'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default PrescriptionForm
