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
import { api, mockData } from '../services/mockApi'
import InteractiveDashboard from '../components/dashboard/InteractiveDashboard'
import { 
  Users, 
  Activity, 
  Calendar, 
  FileText, 
  Stethoscope,
  Search,
  Plus,
  Clock,
  User,
  Brain
} from 'lucide-react'
import styles from '../styles/layout.module.css'

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Stethoscope /> },
  { id: 'interactive', label: 'Interactive Tools', icon: <Activity /> },
  { id: 'episodes', label: 'Treatment Episodes', icon: <FileText /> },
  { id: 'patients', label: 'My Patients', icon: <Users /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar /> },
  { id: 'tools', label: 'Clinical Tools', icon: <Brain /> }
]

const DoctorPortal: React.FC = () => {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')
  const [episodes, setEpisodes] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use real API endpoints
        const [episodesResponse, patientsResponse, appointmentsResponse] = await Promise.all([
          fetch('http://localhost:5001/api/v1/episodes', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          }),
          fetch('http://localhost:5001/api/v1/patients', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          }),
          fetch('http://localhost:5001/api/v1/appointments', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          })
        ])

        const episodesData = await episodesResponse.json()
        const patientsData = await patientsResponse.json()
        const appointmentsData = await appointmentsResponse.json()

        setEpisodes(episodesData.data || [])
        setPatients(patientsData.data || [])
        setAppointments(appointmentsData.data || [])
      } catch (error) {
        console.error('Failed to load doctor data:', error)
        // Fallback to mock data if API fails
        setEpisodes(mockData.episodes || [])
        setPatients(mockData.patients || [])
        setAppointments(mockData.appointments || [])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  if (!user) return null

  const doctorProfile = user.profile || {}
  const profileDetails = [
    `Specialty: ${doctorProfile.specialty || 'General Practice'}`,
    `Experience: ${doctorProfile.years || 'N/A'} years`,
    `Location: ${doctorProfile.location || 'Not specified'}`,
    `License: ${doctorProfile.license || 'Not provided'}`
  ]

  const stats = [
    { label: 'Active Episodes', value: episodes.filter(e => e.status === 'Open').length, color: 'var(--primary-600)' },
    { label: 'Total Patients', value: patients.length, color: 'var(--blue-600)' },
    { label: 'Today\'s Appointments', value: appointments.filter(a => new Date(a.datetime).toDateString() === new Date().toDateString()).length, color: 'var(--green-600)' },
    { label: 'Completed Episodes', value: episodes.filter(e => e.status === 'Closed').length, color: 'var(--gray-600)' }
  ]

  const renderDashboardView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <StatsGrid stats={stats} />
      
      {/* Active Episodes */}
      <SectionCard
        title="Active Treatment Episodes"
        subtitle="Ongoing patient cases requiring attention"
        icon={<Activity />}
        variant="green"
        actions={
          <Button variant="success" size="sm" onClick={() => setActiveView('episodes')}>
            View All Episodes
          </Button>
        }
      >
        {episodes.filter(e => e.status === 'Open').slice(0, 3).map((episode) => (
          <Card key={episode.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {episode.patientName} - Episode {episode.id}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Started: {new Date(episode.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="warning">Open</Badge>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-3)' }}>
                {episode.summary}
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="success" size="sm">
                  Update Episode
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Today's Appointments */}
      <SectionCard
        title="Today's Schedule"
        subtitle="Your appointments for today"
        icon={<Calendar />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('appointments')}>
            View Full Schedule
          </Button>
        }
      >
        {appointments
          .filter(a => new Date(a.datetime).toDateString() === new Date().toDateString())
          .slice(0, 3)
          .map((appointment) => (
            <Card key={appointment.id} style={{ marginBottom: 'var(--spacing-3)' }}>
              <CardContent style={{ padding: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {appointment.patientName}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {appointment.type} - {new Date(appointment.datetime).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge variant={appointment.status === 'Confirmed' ? 'success' : 'warning'}>
                    {appointment.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
      </SectionCard>

      {/* Recent Patients */}
      <SectionCard
        title="Recent Patients"
        subtitle="Patients you've seen recently"
        icon={<Users />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('patients')}>
            View All Patients
          </Button>
        }
      >
        {patients.slice(0, 3).map((patient) => (
          <Card key={patient.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {patient.name} ({patient.id})
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    DOB: {patient.dob} | Last visit: {patient.lastVisit}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>
    </div>
  )

  const renderEpisodesView = () => (
    <SectionCard
      title="Treatment Episodes"
      subtitle="Manage patient treatment episodes and clinical workflows"
      icon={<Activity />}
      variant="green"
      actions={
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Input placeholder="Search episodes..." style={{ width: '200px' }} />
          <Button variant="outline" size="sm">
            <Search style={{ width: '16px', height: '16px' }} />
          </Button>
          <Button variant="success" size="sm">
            <Plus style={{ width: '16px', height: '16px' }} />
            New Episode
          </Button>
        </div>
      }
    >
      {episodes.map((episode) => (
        <Card key={episode.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {episode.patientName} - Episode {episode.id}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Started: {new Date(episode.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Badge variant={episode.status === 'Open' ? 'warning' : 'success'}>
                {episode.status}
              </Badge>
            </div>
            
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                {episode.summary}
              </p>
            </div>

            {episode.participants && episode.participants.length > 0 && (
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
                  Healthcare Team:
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                  {episode.participants.map((participant: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {participant.name} ({participant.role})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                View Timeline
              </Button>
              <Button variant="success" size="sm">
                Update Episode
              </Button>
              {episode.status === 'Open' && (
                <Button variant="primary" size="sm">
                  Close Episode
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderPatientsView = () => (
    <SectionCard
      title="My Patients"
      subtitle="Manage your patient roster and medical records"
      icon={<Users />}
      actions={
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Input placeholder="Search patients..." style={{ width: '200px' }} />
          <Button variant="outline" size="sm">
            <Search style={{ width: '16px', height: '16px' }} />
          </Button>
        </div>
      }
    >
      {patients.map((patient) => (
        <Card key={patient.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {patient.name}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  ID: {patient.id} | DOB: {patient.dob}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Contact: {patient.contact} | Phone: {patient.phone}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Address: {patient.address}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Last Visit: {patient.lastVisit}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                View History
              </Button>
              <Button variant="primary" size="sm">
                New Episode
              </Button>
              <Button variant="success" size="sm">
                Schedule Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderAppointmentsView = () => {
    const mockAppointments = [
      {
        id: 'A-001',
        patientName: 'Nangula K.',
        patientId: 'P-2025-0001',
        datetime: '2025-09-25T10:30',
        type: 'Follow-up',
        status: 'Confirmed',
        duration: '30 minutes',
        notes: 'Malaria treatment follow-up'
      },
      {
        id: 'A-002',
        patientName: 'Amos N.',
        patientId: 'P-2025-0045',
        datetime: '2025-09-25T14:00',
        type: 'Consultation',
        status: 'Pending',
        duration: '45 minutes',
        notes: 'New patient consultation'
      },
      {
        id: 'A-003',
        patientName: 'Helena M.',
        patientId: 'P-2025-0089',
        datetime: '2025-09-26T09:00',
        type: 'Check-up',
        status: 'Confirmed',
        duration: '30 minutes',
        notes: 'Routine health check'
      }
    ]

    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
        <SectionCard
          title="Appointment Management"
          subtitle="Manage your patient appointments and schedule"
          icon={<Calendar />}
          actions={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="outline" size="sm">
                View Calendar
              </Button>
              <Button variant="primary" size="sm">
                New Appointment
              </Button>
            </div>
          }
        >
          {mockAppointments.map((appointment) => (
            <Card key={appointment.id} style={{ marginBottom: 'var(--spacing-4)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {appointment.patientName}
                    </h3>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {appointment.type} • {new Date(appointment.datetime).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                    <Badge variant={appointment.status === 'Confirmed' ? 'success' : 'warning'}>
                      {appointment.status}
                    </Badge>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Patient ID: {appointment.patientId}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Duration: {appointment.duration}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Notes: {appointment.notes}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="sm">
                    View Patient
                  </Button>
                  <Button variant="primary" size="sm">
                    Start Consultation
                  </Button>
                  <Button variant="success" size="sm">
                    Reschedule
                  </Button>
                  {appointment.status === 'Pending' && (
                    <Button variant="danger" size="sm">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </SectionCard>
      </div>
    )
  }

  const renderClinicalToolsView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <SectionCard
        title="Clinical Decision Support Tools"
        subtitle="AI-powered tools to assist in diagnosis and treatment"
        icon={<Stethoscope />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-4)' }}>
          {/* Diagnosis Assistant */}
          <Card style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
            <CardContent>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <Brain style={{ width: '48px', height: '48px', color: 'var(--primary-600)', margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                AI Diagnosis Assistant
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                Advanced symptom analysis and differential diagnosis support with confidence scoring.
              </p>
              <Button
                variant="primary"
                style={{ width: '100%' }}
                onClick={() => window.open('/diagnosis-bot', '_blank')}
              >
                Launch Tool
              </Button>
            </CardContent>
          </Card>

          {/* Drug Interaction Checker */}
          <Card style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
            <CardContent>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <Activity style={{ width: '48px', height: '48px', color: 'var(--secondary-600)', margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                Drug Interaction Checker
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                Check for potential drug interactions and contraindications before prescribing.
              </p>
              <Button variant="success" style={{ width: '100%' }}>
                Check Interactions
              </Button>
            </CardContent>
          </Card>

          {/* Clinical Guidelines */}
          <Card style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
            <CardContent>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <FileText style={{ width: '48px', height: '48px', color: 'var(--blue-600)', margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                Clinical Guidelines
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                Access evidence-based treatment protocols and clinical practice guidelines.
              </p>
              <Button variant="outline" style={{ width: '100%' }}>
                Browse Guidelines
              </Button>
            </CardContent>
          </Card>
        </div>
      </SectionCard>

      {/* Quick Clinical Calculators */}
      <SectionCard
        title="Clinical Calculators"
        subtitle="Essential medical calculators and scoring systems"
        icon={<Activity />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
          <Card style={{ padding: 'var(--spacing-4)' }}>
            <CardContent>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                BMI Calculator
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-3)' }}>
                Calculate Body Mass Index and assess weight status.
              </p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                Calculate BMI
              </Button>
            </CardContent>
          </Card>

          <Card style={{ padding: 'var(--spacing-4)' }}>
            <CardContent>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                Dosage Calculator
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-3)' }}>
                Calculate medication dosages based on patient weight and age.
              </p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                Calculate Dose
              </Button>
            </CardContent>
          </Card>

          <Card style={{ padding: 'var(--spacing-4)' }}>
            <CardContent>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                Risk Assessment
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-3)' }}>
                Assess cardiovascular and other health risks using validated scores.
              </p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                Assess Risk
              </Button>
            </CardContent>
          </Card>

          <Card style={{ padding: 'var(--spacing-4)' }}>
            <CardContent>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                Lab Values Reference
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-3)' }}>
                Quick reference for normal laboratory values and ranges.
              </p>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                View Reference
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
          <div>Loading clinical dashboard...</div>
        </div>
      )
    }

    switch (activeView) {
      case 'dashboard':
        return renderDashboardView()
      case 'interactive':
        return <InteractiveDashboard />
      case 'episodes':
        return renderEpisodesView()
      case 'patients':
        return renderPatientsView()
      case 'appointments':
        return renderAppointmentsView()
      case 'tools':
        return renderClinicalToolsView()
      default:
        return renderDashboardView()
    }
  }

  return (
    <div className={styles.pageContainerGreen}>
      <Header
        title="Doctor Portal"
        subtitle="Clinical Dashboard & Patient Management"
        userInfo={user.name}
        userRole="doctor"
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
                variant="green"
              />
              <Navigation
                items={NAVIGATION_ITEMS}
                activeItem={activeView}
                onItemClick={setActiveView}
                variant="green"
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

export default DoctorPortal
