import React, { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { TopProfile } from '../components/layout/TopProfile'
import { SectionCard } from '../components/layout/SectionCard'
import { Navigation } from '../components/layout/Navigation'
import { StatsGrid } from '../components/layout/StatsGrid'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import { patientAPI, appointmentAPI } from '../services/api'
import {
  UserCheck,
  Calendar,
  Users,
  Clock,
  Phone,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare
} from 'lucide-react'
import styles from '../styles/layout.module.css'

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <UserCheck /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar /> },
  { id: 'registration', label: 'Patient Registration', icon: <Users /> },
  { id: 'queue', label: 'Patient Queue', icon: <Clock /> },
  { id: 'communications', label: 'Communications', icon: <Phone /> }
]

const ReceptionistPortal: React.FC = () => {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [patientQueue, setPatientQueue] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
      const loadData = async () => {
        try {
          const [appointmentsResponse, patientsResponse] = await Promise.all([
            appointmentAPI.getAppointments(),
            patientAPI.getPatients()
          ])
          setAppointments(appointmentsResponse.data || [])
          setPatients(patientsResponse.data || [])

          // Create patient queue from today's appointments
          const today = new Date().toISOString().split('T')[0]
          const todayAppointments = (appointmentsResponse.data || []).filter(
            (apt: any) => apt.date === today
          )

          // Transform appointments into queue format
          const queue = todayAppointments.map((apt: any, index: number) => ({
            id: apt.id,
            patientName: `${apt.patientFirstName} ${apt.patientLastName}`,
            appointmentTime: apt.time,
            status: apt.status === 'scheduled' ? 'waiting' : apt.status,
            waitTime: `${index * 5} min`,
            priority: 'normal'
          }))

          setPatientQueue(queue)
        } catch (error) {
          console.error('Failed to load receptionist data:', error)
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

  const receptionistProfile = user.profile || {}
  const profileDetails = [
    `Department: ${receptionistProfile.department || 'Front Desk'}`,
    `Location: ${receptionistProfile.location || 'Not specified'}`,
    `Shift: ${receptionistProfile.shift || 'Not specified'}`,
    `Contact: ${receptionistProfile.contact || user.email}`
  ]

  const todayAppointments = appointments.filter(a => 
    new Date(a.datetime).toDateString() === new Date().toDateString()
  )

  const stats = [
    { label: 'Today\'s Appointments', value: todayAppointments.length, color: 'var(--primary-600)' },
    { label: 'Checked In', value: todayAppointments.filter(a => a.status === 'Confirmed').length, color: 'var(--green-600)' },
    { label: 'Waiting', value: '8', color: 'var(--yellow-600)' },
    { label: 'Total Patients', value: patients.length, color: 'var(--blue-600)' }
  ]

  const mockQueue = [
    { id: 1, patientName: 'Nangula K.', appointmentTime: '09:00', status: 'waiting', waitTime: '15 min', priority: 'normal' },
    { id: 2, patientName: 'Amos N.', appointmentTime: '09:30', status: 'in-progress', waitTime: '5 min', priority: 'urgent' },
    { id: 3, patientName: 'Helena M.', appointmentTime: '10:00', status: 'waiting', waitTime: '0 min', priority: 'normal' },
    { id: 4, patientName: 'John D.', appointmentTime: '10:30', status: 'checked-in', waitTime: '0 min', priority: 'normal' }
  ]

  const renderDashboardView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <StatsGrid stats={stats} />
      
      {/* Today's Appointments */}
      <SectionCard
        title="Today's Appointments"
        subtitle="Manage today's patient appointments and check-ins"
        icon={<Calendar />}
        actions={
          <Button variant="primary" size="sm" onClick={() => setActiveView('appointments')}>
            Manage Appointments
          </Button>
        }
      >
        {todayAppointments.slice(0, 4).map((appointment) => (
          <Card key={appointment.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {appointment.patientName}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {appointment.type} with {appointment.doctorName}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    {new Date(appointment.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Badge variant={appointment.status === 'Confirmed' ? 'success' : 'warning'}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm">
                  Check In
                </Button>
                <Button variant="primary" size="sm">
                  Reschedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Patient Queue */}
      <SectionCard
        title="Current Patient Queue"
        subtitle="Patients waiting to be seen"
        icon={<Clock />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('queue')}>
            Manage Queue
          </Button>
        }
      >
        {patientQueue.slice(0, 4).map((patient) => (
          <Card key={patient.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {patient.patientName}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Appointment: {patient.appointmentTime} | Wait: {patient.waitTime}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                  {patient.priority === 'urgent' && (
                    <Badge variant="danger">Urgent</Badge>
                  )}
                  <Badge variant={
                    patient.status === 'waiting' ? 'warning' :
                    patient.status === 'in-progress' ? 'info' : 'success'
                  }>
                    {patient.status === 'in-progress' ? 'In Progress' : 
                     patient.status === 'checked-in' ? 'Checked In' : 'Waiting'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Quick Actions */}
      <SectionCard
        title="Quick Actions"
        subtitle="Common reception desk tasks"
        icon={<UserCheck />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
          <Button variant="primary" style={{ padding: 'var(--spacing-4)', height: 'auto', flexDirection: 'column' }}>
            <Plus style={{ width: '24px', height: '24px', marginBottom: 'var(--spacing-2)' }} />
            Register New Patient
          </Button>
          <Button variant="success" style={{ padding: 'var(--spacing-4)', height: 'auto', flexDirection: 'column' }}>
            <Calendar style={{ width: '24px', height: '24px', marginBottom: 'var(--spacing-2)' }} />
            Schedule Appointment
          </Button>
          <Button variant="info" style={{ padding: 'var(--spacing-4)', height: 'auto', flexDirection: 'column' }}>
            <Phone style={{ width: '24px', height: '24px', marginBottom: 'var(--spacing-2)' }} />
            Patient Communication
          </Button>
          <Button variant="outline" style={{ padding: 'var(--spacing-4)', height: 'auto', flexDirection: 'column' }}>
            <Search style={{ width: '24px', height: '24px', marginBottom: 'var(--spacing-2)' }} />
            Search Records
          </Button>
        </div>
      </SectionCard>
    </div>
  )

  const renderAppointmentsView = () => (
    <SectionCard
      title="Appointment Management"
      subtitle="Schedule, modify, and track patient appointments"
      icon={<Calendar />}
      actions={
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Input placeholder="Search appointments..." style={{ width: '200px' }} />
          <Button variant="outline" size="sm">
            <Search style={{ width: '16px', height: '16px' }} />
          </Button>
          <Button variant="primary" size="sm">
            <Plus style={{ width: '16px', height: '16px' }} />
            New Appointment
          </Button>
        </div>
      }
    >
      {appointments.map((appointment) => (
        <Card key={appointment.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {appointment.patientName}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {appointment.type} with {appointment.doctorName}
                </div>
              </div>
              <Badge variant={appointment.status === 'Confirmed' ? 'success' : 'warning'}>
                {appointment.status}
              </Badge>
            </div>
            
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                <Clock style={{ width: '16px', height: '16px', display: 'inline', marginRight: 'var(--spacing-1)' }} />
                {new Date(appointment.datetime).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                Check In
              </Button>
              <Button variant="primary" size="sm">
                Reschedule
              </Button>
              <Button variant="danger" size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderRegistrationView = () => (
    <SectionCard
      title="Patient Registration"
      subtitle="Register new patients and update existing records"
      icon={<Users />}
      actions={
        <Button variant="primary" size="sm">
          <Plus style={{ width: '16px', height: '16px' }} />
          Register New Patient
        </Button>
      }
    >
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
          <Input placeholder="Patient Name" />
          <Input placeholder="Date of Birth" type="date" />
          <Input placeholder="Contact Number" />
          <Input placeholder="Email Address" type="email" />
        </div>
        <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-2)' }}>
          <Button variant="primary">Register Patient</Button>
          <Button variant="outline">Clear Form</Button>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-3)' }}>
          Recent Registrations
        </h3>
        {patients.slice(0, 5).map((patient) => (
          <Card key={patient.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {patient.name} ({patient.id})
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    DOB: {patient.dob} | Contact: {patient.contact}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionCard>
  )

  const renderQueueView = () => (
    <SectionCard
      title="Patient Queue Management"
      subtitle="Monitor and manage patient waiting times"
      icon={<Clock />}
      actions={
        <Button variant="primary" size="sm">
          Refresh Queue
        </Button>
      }
    >
      {patientQueue.map((patient) => (
        <Card key={patient.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {patient.patientName}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Scheduled: {patient.appointmentTime} | Waiting: {patient.waitTime}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                {patient.priority === 'urgent' && (
                  <Badge variant="danger">
                    <AlertCircle style={{ width: '12px', height: '12px' }} />
                    Urgent
                  </Badge>
                )}
                <Badge variant={
                  patient.status === 'waiting' ? 'warning' :
                  patient.status === 'in-progress' ? 'info' : 'success'
                }>
                  {patient.status === 'in-progress' ? 'In Progress' :
                   patient.status === 'checked-in' ? 'Checked In' : 'Waiting'}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                Call Patient
              </Button>
              <Button variant="primary" size="sm">
                Update Status
              </Button>
              {patient.status === 'waiting' && (
                <Button variant="success" size="sm">
                  <CheckCircle style={{ width: '16px', height: '16px' }} />
                  Check In
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderCommunicationsView = () => {
    const mockMessages = [
      {
        id: 'MSG-001',
        from: 'Dr. Asha Mwangi',
        to: 'Reception',
        subject: 'Patient Nangula K. - Urgent Follow-up',
        message: 'Please schedule follow-up appointment for patient Nangula K. within 3 days. Lab results show improvement.',
        timestamp: '2025-09-25T09:30',
        priority: 'high',
        status: 'unread',
        type: 'staff'
      },
      {
        id: 'MSG-002',
        from: 'Nangula K.',
        to: 'Reception',
        subject: 'Appointment Reschedule Request',
        message: 'Hello, I need to reschedule my appointment on Friday due to work commitments. Please let me know available times.',
        timestamp: '2025-09-25T08:15',
        priority: 'normal',
        status: 'read',
        type: 'patient'
      },
      {
        id: 'MSG-003',
        from: 'Nurse Tamara',
        to: 'Reception',
        subject: 'Supply Request - Urgent',
        message: 'We are running low on thermometer covers and hand sanitizer in Ward 2. Please arrange for immediate restocking.',
        timestamp: '2025-09-24T16:45',
        priority: 'high',
        status: 'read',
        type: 'staff'
      },
      {
        id: 'MSG-004',
        from: 'Amos N.',
        to: 'Reception',
        subject: 'Insurance Verification',
        message: 'I have updated my insurance information. Please verify coverage before my next appointment.',
        timestamp: '2025-09-24T14:20',
        priority: 'normal',
        status: 'unread',
        type: 'patient'
      }
    ]

    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
        <SectionCard
          title="Communications Center"
          subtitle="Manage messages from patients and healthcare staff"
          icon={<MessageSquare />}
          actions={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="outline" size="sm">
                Mark All Read
              </Button>
              <Button variant="primary" size="sm">
                New Message
              </Button>
            </div>
          }
        >
          {[].map((message) => (
            <Card key={message.id} style={{
              marginBottom: 'var(--spacing-4)',
              backgroundColor: message.status === 'unread' ? 'var(--blue-50)' : 'white',
              border: message.status === 'unread' ? '1px solid var(--blue-200)' : '1px solid var(--border-color)'
            }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {message.subject}
                    </h3>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      From: {message.from} • {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                    {message.priority === 'high' && (
                      <Badge variant="danger">
                        <AlertCircle style={{ width: '12px', height: '12px' }} />
                        Urgent
                      </Badge>
                    )}
                    <Badge variant={message.type === 'patient' ? 'info' : 'success'}>
                      {message.type === 'patient' ? 'Patient' : 'Staff'}
                    </Badge>
                    {message.status === 'unread' && (
                      <Badge variant="warning">New</Badge>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <p style={{ color: 'var(--text-primary)', lineHeight: 'var(--line-height-relaxed)' }}>
                    {message.message}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                  <Button variant="primary" size="sm">
                    Forward
                  </Button>
                  {message.status === 'unread' && (
                    <Button variant="success" size="sm">
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="danger" size="sm">
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </SectionCard>
      </div>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div>Loading reception dashboard...</div>
        </div>
      )
    }

    switch (activeView) {
      case 'dashboard':
        return renderDashboardView()
      case 'appointments':
        return renderAppointmentsView()
      case 'registration':
        return renderRegistrationView()
      case 'queue':
        return renderQueueView()
      case 'communications':
        return renderCommunicationsView()
      default:
        return renderDashboardView()
    }
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Receptionist Portal"
        subtitle="Front Desk Operations & Patient Management"
        userInfo={user.name}
        userRole="receptionist"
        showBackButton={activeView !== 'dashboard'}
        showHomeButton={activeView !== 'dashboard'}
        onBack={() => setActiveView('dashboard')}
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

export default ReceptionistPortal
