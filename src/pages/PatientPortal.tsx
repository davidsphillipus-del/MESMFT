import React, { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { TopProfile } from '../components/layout/TopProfile'
import { SectionCard } from '../components/layout/SectionCard'
import { Navigation } from '../components/layout/Navigation'
import { StatsGrid } from '../components/layout/StatsGrid'
import { QuickBotAccess } from '../components/layout/QuickBotAccess'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import { patientAPI, appointmentAPI } from '../services/api'
import PatientQuickActions from '../components/patient/PatientQuickActions'
import DoctorSearch from '../components/search/DoctorSearch'
import {
  Calendar,
  FileText,
  Activity,
  Heart,
  Brain,
  Stethoscope,
  Search,
  Download,
  Clock,
  User,
  Plus
} from 'lucide-react'
import styles from '../styles/layout.module.css'

const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', icon: <User /> },
  { id: 'interactive', label: 'Quick Actions', icon: <Activity /> },
  { id: 'episodes', label: 'Medical Episodes', icon: <FileText /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar /> },
  { id: 'doctors', label: 'Find Doctors', icon: <Search /> },
  { id: 'records', label: 'Medical Records', icon: <Heart /> },
  { id: 'bots', label: 'Health Tools', icon: <Brain /> }
]

const PatientPortal: React.FC = () => {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('home')
  const [episodes, setEpisodes] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
      const loadData = async () => {
        try {
          // Use real API endpoints via service
          const [episodesResponse, appointmentsResponse] = await Promise.all([
            patientAPI.getMedicalRecords(user?.id),
            appointmentAPI.getAppointments({ patientId: user?.id })
          ])
          setEpisodes(episodesResponse.data || [])
          setAppointments(appointmentsResponse.data || [])
        } catch (error) {
          console.error('Failed to load patient data:', error)
          // Optionally show error UI or message here
        } finally {
          setIsLoading(false)
        }
      }

    if (user) {
      loadData()
    }
  }, [user])

  if (!user) return null

  const patientProfile = user.profile || {}
  const profileDetails = [
    `DOB: ${patientProfile.dob || 'Not specified'}`,
    `Gender: ${patientProfile.gender || 'Not specified'}`,
    `Contact: ${patientProfile.contact || user.email}`,
    `Phone: ${patientProfile.phone || 'Not provided'}`
  ]

  const stats = [
    { label: 'Total Episodes', value: episodes.length, color: 'var(--primary-600)' },
    { label: 'Open Episodes', value: episodes.filter(e => e.status === 'Open').length, color: 'var(--yellow-600)' },
    { label: 'Upcoming Appointments', value: appointments.filter(a => a.status === 'Confirmed').length, color: 'var(--green-600)' },
    { label: 'Health Score', value: '85%', color: 'var(--blue-600)' }
  ]

  const renderHomeView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <StatsGrid stats={stats} />
      
      {/* Recent Episodes */}
      <SectionCard
        title="Recent Medical Episodes"
        subtitle="Your latest healthcare interactions"
        icon={<Activity />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('episodes')}>
            View All
          </Button>
        }
      >
        {episodes.slice(0, 3).map((episode) => (
          <Card key={episode.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Episode {episode.id}
                </div>
                <Badge variant={episode.status === 'Open' ? 'warning' : 'success'}>
                  {episode.status}
                </Badge>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                {episode.summary}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-2)' }}>
                <Clock style={{ width: '12px', height: '12px', display: 'inline', marginRight: 'var(--spacing-1)' }} />
                {new Date(episode.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Upcoming Appointments */}
      <SectionCard
        title="Upcoming Appointments"
        subtitle="Your scheduled healthcare visits"
        icon={<Calendar />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('appointments')}>
            View All
          </Button>
        }
      >
        {appointments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-8)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--border-radius-md)',
            border: '1px dashed var(--border-color)'
          }}>
            <Calendar style={{ width: '48px', height: '48px', margin: '0 auto var(--spacing-4)', color: 'var(--text-tertiary)' }} />
            <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
              No upcoming appointments
            </h4>
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
              Schedule your next healthcare visit to stay on top of your health
            </p>
            <Button variant="primary" size="sm" onClick={() => setActiveView('appointments')}>
              Book Appointment
            </Button>
          </div>
        ) : (
          appointments.slice(0, 3).map((appointment) => (
            <Card key={appointment.id} style={{ marginBottom: 'var(--spacing-4)' }}>
              <CardContent style={{ padding: 'var(--spacing-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-3)' }}>
                  <div>
                    <h4 style={{
                      fontSize: 'var(--font-size-md)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-1)',
                      color: 'var(--text-primary)'
                    }}>
                      Dr. {appointment.doctorFirstName} {appointment.doctorLastName}
                    </h4>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)'
                    }}>
                      <Calendar style={{ width: '14px', height: '14px' }} />
                      {new Date(appointment.date + ' ' + appointment.time).toLocaleDateString()} at {appointment.time}
                    </div>
                  </div>
                  <Badge variant={appointment.status === 'scheduled' ? 'success' : 'warning'}>
                    {appointment.status}
                  </Badge>
                </div>
                {appointment.notes && (
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--gray-50)',
                    padding: 'var(--spacing-3)',
                    borderRadius: 'var(--border-radius-sm)',
                    marginTop: 'var(--spacing-2)'
                  }}>
                    <strong>Notes:</strong> {appointment.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </SectionCard>

      {/* Health Tools */}
      <SectionCard
        title="Health & Education Tools"
        subtitle="AI-powered tools for your health journey"
        icon={<Brain />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-5)' }}>
          <Card
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-lg)'
            }}
            onClick={() => setActiveView('bots')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
              e.currentTarget.style.borderColor = 'var(--primary-300)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
              e.currentTarget.style.borderColor = 'var(--border-color)'
            }}
          >
            <CardContent style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--green-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-4)'
              }}>
                <Brain style={{ width: '32px', height: '32px', color: 'var(--green-600)' }} />
              </div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-2)',
                color: 'var(--text-primary)'
              }}>
                Health Education
              </h3>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-4)',
                lineHeight: '1.5'
              }}>
                Learn about malaria prevention, symptoms, and treatment from our AI health educator
              </p>
              <Button variant="success" size="sm" style={{ width: '100%', padding: 'var(--spacing-3) var(--spacing-4)' }}>
                Start Learning
              </Button>
            </CardContent>
          </Card>

          <Card
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-lg)'
            }}
            onClick={() => setActiveView('bots')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
              e.currentTarget.style.borderColor = 'var(--red-300)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
              e.currentTarget.style.borderColor = 'var(--border-color)'
            }}
          >
            <CardContent style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--red-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-4)'
              }}>
                <Stethoscope style={{ width: '32px', height: '32px', color: 'var(--red-600)' }} />
              </div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-2)',
                color: 'var(--text-primary)'
              }}>
                AI Diagnosis Assistant
              </h3>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-4)',
                lineHeight: '1.5'
              }}>
                Get preliminary health assessments and symptom analysis from our AI doctor
              </p>
              <Button variant="danger" size="sm" style={{ width: '100%', padding: 'var(--spacing-3) var(--spacing-4)' }}>
                Check Symptoms
              </Button>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </div>
  )

  const renderEpisodesView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <SectionCard
        title="Medical Episodes"
        subtitle="Complete history of your healthcare interactions"
        icon={<Activity />}
        actions={
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Input placeholder="Search episodes..." style={{ width: '200px' }} />
            <Button variant="outline" size="sm">
              <Search style={{ width: '16px', height: '16px' }} />
            </Button>
          </div>
        }
      >
        {episodes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-12)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px dashed var(--border-color)'
          }}>
            <Activity style={{ width: '64px', height: '64px', margin: '0 auto var(--spacing-4)', color: 'var(--text-tertiary)' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
              No medical episodes yet
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
              Your medical episodes will appear here as you receive care from healthcare providers
            </p>
            <Button variant="primary" size="sm" onClick={() => setActiveView('appointments')}>
              Book Your First Appointment
            </Button>
          </div>
        ) : (
          episodes.map((episode) => (
            <Card key={episode.id} style={{
              marginBottom: 'var(--spacing-5)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-lg)',
              overflow: 'hidden'
            }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-2)',
                      color: 'var(--text-primary)'
                    }}>
                      {episode.title || `Medical Episode #${episode.id}`}
                    </h3>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)'
                    }}>
                      <Clock style={{ width: '14px', height: '14px' }} />
                      {new Date(episode.createdAt).toLocaleDateString()}
                      {episode.priority && (
                        <>
                          <span>•</span>
                          <span style={{ color: episode.priority === 'High' ? 'var(--red-600)' : 'var(--text-secondary)' }}>
                            {episode.priority} Priority
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant={episode.status === 'Open' ? 'warning' : 'success'} size="lg">
                    {episode.status}
                  </Badge>
                </div>

                {episode.description && (
                  <div style={{
                    marginBottom: 'var(--spacing-4)',
                    padding: 'var(--spacing-4)',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <h4 style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--spacing-2)',
                      color: 'var(--text-primary)'
                    }}>
                      Description:
                    </h4>
                    <p style={{
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      margin: 0,
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      {episode.description}
                    </p>
                  </div>
                )}

                {episode.doctorFirstName && (
                  <div style={{ marginBottom: 'var(--spacing-4)' }}>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--spacing-2)',
                      color: 'var(--text-primary)'
                    }}>
                      Healthcare Provider:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      <User style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        Dr. {episode.doctorFirstName} {episode.doctorLastName}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-2)',
                  justifyContent: 'flex-end',
                  paddingTop: 'var(--spacing-4)',
                  borderTop: '1px solid var(--gray-200)'
                }}>
                  <Button variant="outline" size="sm">
                    <Download style={{ width: '16px', height: '16px' }} />
                    Download Report
                  </Button>
                  <Button variant="primary" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </SectionCard>
    </div>
  )

  const renderAppointmentsView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <SectionCard
        title="Your Appointments"
        subtitle="Manage your healthcare appointments and schedule new visits"
        icon={<Calendar />}
        actions={
          <Button variant="primary" size="sm" onClick={() => setActiveView('doctors')}>
            <Plus style={{ width: '16px', height: '16px' }} />
            Book New Appointment
          </Button>
        }
      >
        {appointments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-12)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px dashed var(--border-color)'
          }}>
            <Calendar style={{ width: '64px', height: '64px', margin: '0 auto var(--spacing-4)', color: 'var(--text-tertiary)' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
              No appointments scheduled
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
              Book your first appointment to start your healthcare journey
            </p>
            <Button variant="primary" size="sm" onClick={() => setActiveView('doctors')}>
              Find a Doctor
            </Button>
          </div>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} style={{
              marginBottom: 'var(--spacing-5)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-lg)',
              overflow: 'hidden'
            }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-2)',
                      color: 'var(--text-primary)'
                    }}>
                      Dr. {appointment.doctorFirstName} {appointment.doctorLastName}
                    </h3>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      <Clock style={{ width: '14px', height: '14px' }} />
                      {new Date(appointment.date + ' ' + appointment.time).toLocaleDateString()} at {appointment.time}
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)'
                    }}>
                      <User style={{ width: '14px', height: '14px' }} />
                      Appointment ID: {appointment.id}
                    </div>
                  </div>
                  <Badge variant={appointment.status === 'scheduled' ? 'success' : 'warning'} size="lg">
                    {appointment.status}
                  </Badge>
                </div>

                {appointment.notes && (
                  <div style={{
                    marginBottom: 'var(--spacing-4)',
                    padding: 'var(--spacing-4)',
                    backgroundColor: 'var(--blue-50)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--blue-200)'
                  }}>
                    <h4 style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--spacing-2)',
                      color: 'var(--blue-800)'
                    }}>
                      Appointment Notes:
                    </h4>
                    <p style={{
                      color: 'var(--blue-700)',
                      margin: 0,
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      {appointment.notes}
                    </p>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-2)',
                  justifyContent: 'flex-end',
                  paddingTop: 'var(--spacing-4)',
                  borderTop: '1px solid var(--gray-200)'
                }}>
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="danger" size="sm">
                      Cancel Appointment
                    </Button>
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </SectionCard>
      </div>
    )

  const renderDoctorSearchView = () => {
    const handleSelectDoctor = (doctor: any) => {
      // You can add logic here to book appointment or view doctor profile
      console.log('Selected doctor:', doctor)
      // For now, we'll just switch to appointments view
      setActiveView('appointments')
    }

    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
        <SectionCard
          title="Find Doctors"
          subtitle="Search and connect with healthcare professionals"
          icon={<Search />}
        >
          <DoctorSearch
            onSelectDoctor={handleSelectDoctor}
            showBookingButton={true}
          />
        </SectionCard>
      </div>
    )
  }

  const renderMedicalRecordsView = () => {
    const [medicalRecords, setMedicalRecords] = useState<any[]>([])
    const [isLoadingRecords, setIsLoadingRecords] = useState(true)

    useEffect(() => {
      const loadMedicalRecords = async () => {
        try {
          const response = await fetch(`http://localhost:5001/api/v1/patients/${user?.id}/medical-records`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          })
          const data = await response.json()

          if (data.success) {
            setMedicalRecords(data.data)
          }
        } catch (error) {
          console.error('Failed to load medical records:', error)
        } finally {
          setIsLoadingRecords(false)
        }
      }

      if (user?.id) {
        loadMedicalRecords()
      }
    }, [user?.id])

    const handleDownloadRecord = async (recordId: number) => {
      try {
        const response = await fetch(`http://localhost:5001/api/v1/medical-records/${recordId}/download`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `medical_record_${recordId}.txt`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          alert('Failed to download medical record')
        }
      } catch (error) {
        console.error('Failed to download record:', error)
        alert('Failed to download medical record')
      }
    }

    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
        <SectionCard
          title="Medical Records"
          subtitle="Your complete medical history and test results"
          icon={<FileText />}
          actions={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="outline" size="sm">
                <Download style={{ width: '16px', height: '16px' }} />
                Export Records
              </Button>
              <Button variant="primary" size="sm">
                Request Records
              </Button>
            </div>
          }
        >
          {isLoadingRecords ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              Loading medical records...
            </div>
          ) : medicalRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--text-secondary)' }}>
              No medical records found. Your records will appear here once they are created by your healthcare providers.
            </div>
          ) : (
            medicalRecords.map((record) => (
              <Card key={record.id} style={{ marginBottom: 'var(--spacing-4)' }}>
                <CardContent style={{ padding: 'var(--spacing-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Medical Record #{record.id}
                      </h3>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {new Date(record.createdAt).toLocaleDateString()} • Dr. {record.doctorFirstName} {record.doctorLastName}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                      <Badge variant="info">
                        Medical Record
                      </Badge>
                      <Badge variant="success">
                        Complete
                      </Badge>
                    </div>
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-4)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-2)' }}>
                      <strong>Diagnosis:</strong> {record.diagnosis || 'Not specified'}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-2)' }}>
                      <strong>Symptoms:</strong> {record.symptoms || 'Not specified'}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-2)' }}>
                      <strong>Treatment:</strong> {record.treatment || 'Not specified'}
                    </div>
                    {record.medications && (
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-2)' }}>
                        <strong>Medications:</strong> {record.medications}
                      </div>
                    )}
                    {record.notes && (
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                        <strong>Notes:</strong> {record.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadRecord(record.id)}
                    >
                      <Download style={{ width: '16px', height: '16px' }} />
                      Download
                    </Button>
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                    <Button variant="success" size="sm">
                      Share with Doctor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </SectionCard>
      </div>
    )
  }

  const renderHealthToolsView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <SectionCard
        title="Health Tools & AI Assistants"
        subtitle="Interactive tools to support your health journey"
        icon={<Brain />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-4)' }}>
          {/* Education Bot */}
          <Card style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
            <CardContent>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <Brain style={{ width: '48px', height: '48px', color: 'var(--primary-600)', margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                Health Education Bot
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                Learn about diseases, prevention strategies, and healthy living through interactive conversations.
              </p>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Badge variant="info">Malaria</Badge>
                  <Badge variant="info">Typhoid</Badge>
                  <Badge variant="info">Prevention</Badge>
                  <Badge variant="info">Nutrition</Badge>
                </div>
              </div>
              <Button
                variant="primary"
                style={{ width: '100%' }}
                onClick={() => window.open('/education-bot', '_blank')}
              >
                Start Learning
              </Button>
            </CardContent>
          </Card>

          {/* Diagnosis Bot */}
          <Card style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
            <CardContent>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <Stethoscope style={{ width: '48px', height: '48px', color: 'var(--secondary-600)', margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                AI Diagnosis Assistant
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                Get preliminary health assessments based on your symptoms. For educational and support purposes only.
              </p>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Badge variant="warning">Symptom Analysis</Badge>
                  <Badge variant="warning">Risk Assessment</Badge>
                  <Badge variant="warning">Recommendations</Badge>
                </div>
              </div>
              <Button
                variant="success"
                style={{ width: '100%' }}
                onClick={() => window.open('/diagnosis-bot', '_blank')}
              >
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </SectionCard>

      {/* Health Tracking Tools */}
      <SectionCard
        title="Health Tracking"
        subtitle="Monitor your health metrics and progress"
        icon={<Activity />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
          <Card style={{ padding: 'var(--spacing-4)' }}>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
                <Heart style={{ width: '24px', height: '24px', color: 'var(--red-600)' }} />
                <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Vital Signs Log
                </h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-3)' }}>
                Track blood pressure, temperature, heart rate, and other vital signs.
              </p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                View Vitals History
              </Button>
            </CardContent>
          </Card>

          <Card style={{ padding: 'var(--spacing-4)' }}>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
                <Activity style={{ width: '24px', height: '24px', color: 'var(--green-600)' }} />
                <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Symptom Tracker
                </h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-3)' }}>
                Log symptoms and track patterns over time to share with your healthcare team.
              </p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                Log Symptoms
              </Button>
            </CardContent>
          </Card>

          <Card style={{ padding: 'var(--spacing-4)' }}>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
                <Calendar style={{ width: '24px', height: '24px', color: 'var(--blue-600)' }} />
                <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Medication Reminders
                </h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-3)' }}>
                Set up reminders for medications and track adherence to treatment plans.
              </p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                Manage Reminders
              </Button>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </div>
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div>Loading your health information...</div>
        </div>
      )
    }

    switch (activeView) {
      case 'home':
        return renderHomeView()
      case 'interactive':
        return <PatientQuickActions onNavigate={setActiveView} />
      case 'episodes':
        return renderEpisodesView()
      case 'appointments':
        return renderAppointmentsView()
      case 'doctors':
        return renderDoctorSearchView()
      case 'records':
        return renderMedicalRecordsView()
      case 'bots':
        return renderHealthToolsView()
      default:
        return renderHomeView()
    }
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Patient Portal"
        subtitle="Your Personal Health Dashboard"
        userInfo={user.name}
        userRole="patient"
        showBackButton={activeView !== 'home'}
        showHomeButton={activeView !== 'home'}
        onBack={() => setActiveView('home')}
      />

      <main style={{ padding: 'var(--spacing-6) 0' }}>
        <div className={styles.portalContainer}>
          <div className={styles.portalGrid}>
            {/* Sidebar */}
            <div className={styles.portalSidebar}>
              <TopProfile
                name={user.name}
                id={user.id}
                details={profileDetails}
              />
              <Navigation
                items={NAVIGATION_ITEMS}
                activeItem={activeView}
                onItemClick={setActiveView}
              />
              <QuickBotAccess />
            </div>

            {/* Main Content */}
            <div className={styles.portalContent}>
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PatientPortal
