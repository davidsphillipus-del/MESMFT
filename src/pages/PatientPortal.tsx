import React, { useState, useEffect } from 'react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
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
  User
} from 'lucide-react'
import styles from '../styles/layout.module.css'

const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', icon: <User /> },
  { id: 'episodes', label: 'Medical Episodes', icon: <Activity /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar /> },
  { id: 'records', label: 'Medical Records', icon: <FileText /> },
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
        const [episodesData, appointmentsData] = await Promise.all([
          api.get('/episodes'),
          api.get('/appointments')
        ])
        
        // Filter data for current patient
        const patientEpisodes = episodesData.filter((ep: any) => ep.patientId === user?.id)
        const patientAppointments = appointmentsData.filter((apt: any) => apt.patientId === user?.id)
        
        setEpisodes(patientEpisodes)
        setAppointments(patientAppointments)
      } catch (error) {
        console.error('Failed to load patient data:', error)
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
        {appointments.slice(0, 3).map((appointment) => (
          <Card key={appointment.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {appointment.doctorName}
                </div>
                <Badge variant={appointment.status === 'Confirmed' ? 'success' : 'warning'}>
                  {appointment.status}
                </Badge>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                {appointment.type} - {new Date(appointment.datetime).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Health Tools */}
      <SectionCard
        title="Health & Education Tools"
        subtitle="AI-powered tools for your health journey"
        icon={<Brain />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
          <Card style={{ cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}>
            <CardContent style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
              <Brain style={{ width: '32px', height: '32px', color: 'var(--secondary-600)', marginBottom: 'var(--spacing-3)' }} />
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                Education Bot
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                Learn about diseases, prevention, and treatment options
              </p>
              <Button variant="success" size="sm" style={{ width: '100%' }}>
                Start Learning
              </Button>
            </CardContent>
          </Card>

          <Card style={{ cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}>
            <CardContent style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
              <Stethoscope style={{ width: '32px', height: '32px', color: 'var(--red-600)', marginBottom: 'var(--spacing-3)' }} />
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>
                Symptom Checker
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                Get preliminary health assessments based on symptoms
              </p>
              <Button variant="danger" size="sm" style={{ width: '100%' }}>
                Check Symptoms
              </Button>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </div>
  )

  const renderEpisodesView = () => (
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
      {episodes.map((episode) => (
        <Card key={episode.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Episode {episode.id}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {new Date(episode.createdAt).toLocaleDateString()}
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
                <Download style={{ width: '16px', height: '16px' }} />
                Download Report
              </Button>
              <Button variant="primary" size="sm">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderAppointmentsView = () => (
    <SectionCard
      title="Appointments"
      subtitle="Manage your healthcare appointments"
      icon={<Calendar />}
      actions={
        <Button variant="primary" size="sm">
          Book New Appointment
        </Button>
      }
    >
      {appointments.map((appointment) => (
        <Card key={appointment.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {appointment.doctorName}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {appointment.type}
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

  const renderMedicalRecordsView = () => {
    const mockMedicalRecords = [
      {
        id: 'MR-001',
        type: 'Lab Results',
        title: 'Blood Culture - Malaria Test',
        date: '2025-09-20',
        doctor: 'Dr. Asha Mwangi',
        status: 'completed',
        results: 'Negative for malaria parasites',
        category: 'laboratory'
      },
      {
        id: 'MR-002',
        type: 'Prescription',
        title: 'Antimalarial Treatment',
        date: '2025-09-18',
        doctor: 'Dr. Asha Mwangi',
        status: 'active',
        results: 'Artemether-Lumefantrine prescribed',
        category: 'medication'
      },
      {
        id: 'MR-003',
        type: 'Vital Signs',
        title: 'Routine Check-up',
        date: '2025-09-15',
        doctor: 'Nurse Tamara',
        status: 'completed',
        results: 'BP: 120/80, Temp: 36.5°C, HR: 72 bpm',
        category: 'vitals'
      },
      {
        id: 'MR-004',
        type: 'Imaging',
        title: 'Chest X-Ray',
        date: '2025-09-10',
        doctor: 'Dr. Johannes Hamutenya',
        status: 'completed',
        results: 'Clear lungs, no abnormalities detected',
        category: 'imaging'
      }
    ]

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
          {mockMedicalRecords.map((record) => (
            <Card key={record.id} style={{ marginBottom: 'var(--spacing-4)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {record.title}
                    </h3>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {record.type} • {new Date(record.date).toLocaleDateString()} • {record.doctor}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                    <Badge variant={
                      record.category === 'laboratory' ? 'info' :
                      record.category === 'medication' ? 'warning' :
                      record.category === 'vitals' ? 'success' : 'default'
                    }>
                      {record.type}
                    </Badge>
                    <Badge variant={record.status === 'completed' ? 'success' : 'warning'}>
                      {record.status}
                    </Badge>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    <strong>Results:</strong> {record.results}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="sm">
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
          ))}
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
      case 'episodes':
        return renderEpisodesView()
      case 'appointments':
        return renderAppointmentsView()
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
