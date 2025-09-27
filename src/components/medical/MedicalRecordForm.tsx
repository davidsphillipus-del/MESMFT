import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface MedicalRecordFormProps {
  patientId: number
  onSuccess?: () => void
  onCancel?: () => void
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ patientId, onSuccess, onCancel }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medications: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.diagnosis || !formData.symptoms) {
      alert('Please fill in at least the diagnosis and symptoms')
      return
    }

    setIsLoading(true)

    try {
      console.log('📋 Adding medical record for patient:', patientId, formData)

      const response = await fetch(`http://localhost:5001/api/v1/patients/${patientId}/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('📋 Medical record response:', data)

      if (data.success) {
        alert(`✅ Medical record added successfully!\n\nRecord ID: ${data.data.id}\nDiagnosis: ${formData.diagnosis}`)

        // Reset form
        setFormData({
          diagnosis: '',
          symptoms: '',
          treatment: '',
          medications: '',
          notes: ''
        })

        // Trigger refresh
        if (onSuccess) {
          onSuccess()
        }
      } else {
        alert(`❌ Failed to add medical record: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to add medical record:', error)
      alert('❌ Failed to add medical record. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Add Medical Record</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diagnosis *
          </label>
          <input
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            placeholder="Primary diagnosis..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms *
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Patient's reported symptoms..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Treatment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Treatment Plan *
          </label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Recommended treatment plan..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Medications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medications
          </label>
          <textarea
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            rows={2}
            placeholder="Prescribed medications and dosages..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional observations or notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Medical Record'}
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

export default MedicalRecordForm
