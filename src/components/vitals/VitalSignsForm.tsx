import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface VitalSignsFormProps {
  patientId: number
  onSuccess?: () => void
  onCancel?: () => void
}

const VitalSignsForm: React.FC<VitalSignsFormProps> = ({ patientId, onSuccess, onCancel }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
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
    setIsLoading(true)

    try {
      // Convert string values to numbers where appropriate
      const vitalData = {
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
        oxygenSaturation: formData.oxygenSaturation ? parseFloat(formData.oxygenSaturation) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        notes: formData.notes
      }

      const response = await fetch(`http://localhost:5001/api/v1/patients/${patientId}/vital-signs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(vitalData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Vital signs recorded successfully!')
        setFormData({
          temperature: '',
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          heartRate: '',
          respiratoryRate: '',
          oxygenSaturation: '',
          weight: '',
          height: '',
          notes: ''
        })
        onSuccess?.()
      } else {
        alert(`Failed to record vital signs: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to record vital signs:', error)
      alert('Failed to record vital signs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getVitalStatus = (vital: string, value: string) => {
    if (!value) return ''
    
    const numValue = parseFloat(value)
    
    switch (vital) {
      case 'temperature':
        if (numValue < 36.1) return 'text-blue-600 (Low)'
        if (numValue > 37.2) return 'text-red-600 (High)'
        return 'text-green-600 (Normal)'
      
      case 'heartRate':
        if (numValue < 60) return 'text-blue-600 (Low)'
        if (numValue > 100) return 'text-red-600 (High)'
        return 'text-green-600 (Normal)'
      
      case 'oxygenSaturation':
        if (numValue < 95) return 'text-red-600 (Low)'
        return 'text-green-600 (Normal)'
      
      default:
        return ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Record Vital Signs</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temperature and Heart Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°C)
            </label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              step="0.1"
              min="30"
              max="45"
              placeholder="36.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className={`text-xs mt-1 ${getVitalStatus('temperature', formData.temperature)}`}>
              {getVitalStatus('temperature', formData.temperature)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              name="heartRate"
              value={formData.heartRate}
              onChange={handleChange}
              min="30"
              max="200"
              placeholder="72"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className={`text-xs mt-1 ${getVitalStatus('heartRate', formData.heartRate)}`}>
              {getVitalStatus('heartRate', formData.heartRate)}
            </div>
          </div>
        </div>

        {/* Blood Pressure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Pressure (mmHg)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="bloodPressureSystolic"
              value={formData.bloodPressureSystolic}
              onChange={handleChange}
              min="70"
              max="250"
              placeholder="120 (Systolic)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="bloodPressureDiastolic"
              value={formData.bloodPressureDiastolic}
              onChange={handleChange}
              min="40"
              max="150"
              placeholder="80 (Diastolic)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formData.bloodPressureSystolic && formData.bloodPressureDiastolic && 
              `${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic} mmHg`
            }
          </div>
        </div>

        {/* Respiratory Rate and Oxygen Saturation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respiratory Rate (breaths/min)
            </label>
            <input
              type="number"
              name="respiratoryRate"
              value={formData.respiratoryRate}
              onChange={handleChange}
              min="8"
              max="40"
              placeholder="16"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Oxygen Saturation (%)
            </label>
            <input
              type="number"
              name="oxygenSaturation"
              value={formData.oxygenSaturation}
              onChange={handleChange}
              step="0.1"
              min="70"
              max="100"
              placeholder="98.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className={`text-xs mt-1 ${getVitalStatus('oxygenSaturation', formData.oxygenSaturation)}`}>
              {getVitalStatus('oxygenSaturation', formData.oxygenSaturation)}
            </div>
          </div>
        </div>

        {/* Weight and Height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              step="0.1"
              min="1"
              max="300"
              placeholder="70.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              step="0.1"
              min="50"
              max="250"
              placeholder="175"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
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
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Recording...' : 'Record Vital Signs'}
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

export default VitalSignsForm
