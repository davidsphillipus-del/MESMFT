import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface Doctor {
  id: number
  firstName: string
  lastName: string
  email: string
  specialization?: string
}

interface AppointmentBookingProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/doctors', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
      const data = await response.json()

      if (data.success) {
        setDoctors(data.data)
      }
    } catch (error) {
      console.error('Failed to load doctors:', error)
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const appointmentData = {
        patientId: user?.id,
        doctorId: parseInt(selectedDoctor),
        date: appointmentDate,
        time: appointmentTime,
        notes: notes || ''
      }

      console.log('📅 Booking appointment:', appointmentData)

      const response = await fetch('http://localhost:5001/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(appointmentData)
      })

      const data = await response.json()
      console.log('📅 Appointment response:', data)

      if (data.success) {
        // Success feedback
        alert(`✅ Appointment booked successfully!\n\nAppointment ID: ${data.data.id}\nDate: ${appointmentDate}\nTime: ${appointmentTime}`)

        // Reset form
        setSelectedDoctor('')
        setAppointmentDate('')
        setAppointmentTime('')
        setNotes('')

        // Trigger refresh of appointment list
        if (onSuccess) {
          onSuccess()
        }
      } else {
        alert(`❌ Failed to book appointment: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to book appointment:', error)
      alert('❌ Failed to book appointment. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Book New Appointment</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Doctor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Doctor
          </label>
          {isLoadingDoctors ? (
            <div className="text-gray-500">Loading doctors...</div>
          ) : (
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                  {doctor.specialization && ` - ${doctor.specialization}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Date
          </label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            min={getMinDate()}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Time
          </label>
          <select
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select time...</option>
            {getTimeSlots().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any specific concerns or notes for the doctor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Booking...' : 'Book Appointment'}
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

export default AppointmentBooking
