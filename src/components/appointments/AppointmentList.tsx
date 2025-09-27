import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface Appointment {
  id: number
  patientId: number
  doctorId: number
  date: string
  time: string
  status: string
  notes?: string
  patientFirstName?: string
  patientLastName?: string
  doctorFirstName?: string
  doctorLastName?: string
}

interface AppointmentListProps {
  patientId?: number
  doctorId?: number
  showActions?: boolean
}

const AppointmentList: React.FC<AppointmentListProps> = ({ patientId, doctorId, showActions = true }) => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    loadAppointments()
  }, [patientId, doctorId])

  const loadAppointments = async () => {
    setIsLoading(true)
    try {
      let url = 'http://localhost:5001/api/v1/appointments'
      const params = new URLSearchParams()
      
      if (patientId) params.append('patientId', patientId.toString())
      if (doctorId) params.append('doctorId', doctorId.toString())
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.data)
      }
    } catch (error) {
      console.error('Failed to load appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5001/api/v1/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })

      const data = await response.json()

      if (data.success) {
        alert('Appointment cancelled successfully!')
        loadAppointments() // Refresh the list
      } else {
        alert(`Failed to cancel appointment: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      alert('Failed to cancel appointment. Please try again.')
    }
  }

  const handleUpdateStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/v1/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Appointment marked as ${newStatus}!`)
        loadAppointments() // Refresh the list
      } else {
        alert(`Failed to update appointment: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to update appointment:', error)
      alert('Failed to update appointment. Please try again.')
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true
    return appointment.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isUpcoming = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    return appointmentDateTime > new Date()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Appointments</h3>
        <button
          onClick={loadAppointments}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All' },
          { key: 'scheduled', label: 'Scheduled' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      )}

      {/* Appointments List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found.
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-800">
                        📅 {formatDate(appointment.date)} at {formatTime(appointment.time)}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {isUpcoming(appointment.date, appointment.time) && appointment.status === 'scheduled' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Upcoming
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      {appointment.patientFirstName && (
                        <div>👤 Patient: {appointment.patientFirstName} {appointment.patientLastName}</div>
                      )}
                      {appointment.doctorFirstName && (
                        <div>🩺 Doctor: Dr. {appointment.doctorFirstName} {appointment.doctorLastName}</div>
                      )}
                      {appointment.notes && (
                        <div>📝 Notes: {appointment.notes}</div>
                      )}
                    </div>
                  </div>
                  
                  {showActions && appointment.status === 'scheduled' && (
                    <div className="flex gap-2 ml-4">
                      {user?.role === 'DOCTOR' && (
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary */}
      {!isLoading && appointments.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Summary:</strong> {appointments.length} total appointments
            {appointments.filter(a => a.status === 'scheduled').length > 0 && (
              <> • {appointments.filter(a => a.status === 'scheduled').length} scheduled</>
            )}
            {appointments.filter(a => a.status === 'completed').length > 0 && (
              <> • {appointments.filter(a => a.status === 'completed').length} completed</>
            )}
            {appointments.filter(a => a.status === 'cancelled').length > 0 && (
              <> • {appointments.filter(a => a.status === 'cancelled').length} cancelled</>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentList
