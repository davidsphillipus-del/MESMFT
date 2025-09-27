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
import { api, mockData } from '../services/mockApi'
import { 
  Heart, 
  Activity, 
  Users, 
  FileText, 
  Thermometer,
  Search,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import styles from '../styles/layout.module.css'

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Heart /> },
  { id: 'patients', label: 'Patient Care', icon: <Users /> },
  { id: 'vitals', label: 'Vital Signs', icon: <Thermometer /> },
  { id: 'protocols', label: 'Clinical Protocols', icon: <FileText /> },
  { id: 'episodes', label: 'Episodes', icon: <Activity /> }
]

const NursePortal: React.FC = () => {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')
  const [episodes, setEpisodes] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use real API endpoints
        const [episodesResponse, patientsResponse] = await Promise.all([
          fetch('http://localhost:5001/api/v1/episodes', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          }),
          fetch('http://localhost:5001/api/v1/patients', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          })
        ])

        const episodesData = await episodesResponse.json()
        const patientsData = await patientsResponse.json()

        setEpisodes(episodesData.data || [])
        setPatients(patientsData.data || [])
      } catch (error) {
        console.error('Failed to load nurse data:', error)
        // Fallback to mock data if API fails
        setEpisodes(mockData.episodes || [])
        setPatients(mockData.patients || [])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  if (!user) return null

  const nurseProfile = user.profile || {}
  const profileDetails = [
    `Specialty: ${nurseProfile.specialty || 'General Nursing'}`,
    `Experience: ${nurseProfile.years || 'N/A'} years`,
    `Location: ${nurseProfile.location || 'Not specified'}`,
    `License: ${nurseProfile.license || 'Not provided'}`
  ]

  const stats = [
    { label: 'Patients Today', value: '12', color: 'var(--primary-600)' },
    { label: 'Vitals Recorded', value: '28', color: 'var(--blue-600)' },
    { label: 'Active Episodes', value: episodes.filter(e => e.status === 'Open').length, color: 'var(--green-600)' },
    { label: 'Protocols Followed', value: '15', color: 'var(--purple-600)' }
  ]

  const mockVitals = [
    { patientName: 'Nangula K.', temp: '38.9°C', bp: '120/80', pulse: '98', time: '08:30', status: 'abnormal' },
    { patientName: 'Amos N.', temp: '37.2°C', bp: '110/70', pulse: '72', time: '09:15', status: 'normal' },
    { patientName: 'Helena M.', temp: '36.8°C', bp: '125/85', pulse: '88', time: '10:00', status: 'normal' }
  ]

  const mockProtocols = [
    { id: 1, name: 'Malaria Assessment Protocol', category: 'Infectious Disease', lastUsed: '2025-09-20', status: 'active' },
    { id: 2, name: 'Typhoid Fever Management', category: 'Infectious Disease', lastUsed: '2025-09-18', status: 'active' },
    { id: 3, name: 'Vital Signs Monitoring', category: 'General Care', lastUsed: '2025-09-25', status: 'active' },
    { id: 4, name: 'Patient Education Guidelines', category: 'Education', lastUsed: '2025-09-22', status: 'active' }
  ]

  const renderDashboardView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <StatsGrid stats={stats} />
      
      {/* Today's Vital Signs */}
      <SectionCard
        title="Today's Vital Signs"
        subtitle="Recent vital sign recordings and assessments"
        icon={<Thermometer />}
        actions={
          <Button variant="primary" size="sm" onClick={() => setActiveView('vitals')}>
            Record New Vitals
          </Button>
        }
      >
        {mockVitals.map((vital, index) => (
          <Card key={index} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {vital.patientName}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Recorded at {vital.time}
                  </div>
                </div>
                <Badge variant={vital.status === 'normal' ? 'success' : 'warning'}>
                  {vital.status === 'normal' ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <AlertCircle style={{ width: '12px', height: '12px' }} />}
                  {vital.status}
                </Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
                <div>Temp: <strong>{vital.temp}</strong></div>
                <div>BP: <strong>{vital.bp}</strong></div>
                <div>Pulse: <strong>{vital.pulse}</strong></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Active Patient Episodes */}
      <SectionCard
        title="Active Patient Episodes"
        subtitle="Episodes requiring nursing care and monitoring"
        icon={<Activity />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('episodes')}>
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
                <Button variant="primary" size="sm">
                  Add Nursing Note
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Clinical Protocols */}
      <SectionCard
        title="Clinical Protocols"
        subtitle="Evidence-based nursing protocols and guidelines"
        icon={<FileText />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('protocols')}>
            View All Protocols
          </Button>
        }
      >
        {mockProtocols.slice(0, 3).map((protocol) => (
          <Card key={protocol.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {protocol.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {protocol.category} | Last used: {protocol.lastUsed}
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm">
                  View Protocol
                </Button>
                <Button variant="primary" size="sm">
                  Apply to Patient
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>
    </div>
  )

  const renderPatientsView = () => (
    <SectionCard
      title="Patient Care"
      subtitle="Manage nursing care for assigned patients"
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
                Last Visit: {patient.lastVisit}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                <Thermometer style={{ width: '16px', height: '16px' }} />
                Record Vitals
              </Button>
              <Button variant="primary" size="sm">
                <FileText style={{ width: '16px', height: '16px' }} />
                Nursing Notes
              </Button>
              <Button variant="success" size="sm">
                Care Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderVitalsView = () => (
    <SectionCard
      title="Vital Signs Management"
      subtitle="Record and monitor patient vital signs"
      icon={<Thermometer />}
      actions={
        <Button variant="primary" size="sm">
          <Plus style={{ width: '16px', height: '16px' }} />
          Record New Vitals
        </Button>
      }
    >
      {mockVitals.map((vital, index) => (
        <Card key={index} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {vital.patientName}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Recorded at {vital.time} today
                </div>
              </div>
              <Badge variant={vital.status === 'normal' ? 'success' : 'warning'}>
                {vital.status === 'normal' ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <AlertCircle style={{ width: '12px', height: '12px' }} />}
                {vital.status}
              </Badge>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: 'var(--spacing-4)', 
              marginBottom: 'var(--spacing-4)'
            }}>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Temperature</div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: vital.temp.includes('38') ? 'var(--red-600)' : 'var(--green-600)' }}>
                  {vital.temp}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Blood Pressure</div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--blue-600)' }}>
                  {vital.bp}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Pulse</div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--purple-600)' }}>
                  {vital.pulse}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                View History
              </Button>
              <Button variant="primary" size="sm">
                Update Vitals
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderProtocolsView = () => (
    <SectionCard
      title="Clinical Protocols"
      subtitle="Evidence-based nursing protocols and care guidelines"
      icon={<FileText />}
      actions={
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Input placeholder="Search protocols..." style={{ width: '200px' }} />
          <Button variant="outline" size="sm">
            <Search style={{ width: '16px', height: '16px' }} />
          </Button>
        </div>
      }
    >
      {mockProtocols.map((protocol) => (
        <Card key={protocol.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {protocol.name}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Category: {protocol.category}
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Last used: {protocol.lastUsed}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button variant="primary" size="sm">
                Apply to Patient
              </Button>
              <Button variant="success" size="sm">
                Create Checklist
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderEpisodesView = () => {
    const mockEpisodes = [
      {
        id: 'E-001',
        patientName: 'Nangula K.',
        patientId: 'P-2025-0001',
        diagnosis: 'Malaria Treatment',
        status: 'Active',
        priority: 'High',
        startDate: '2025-09-20',
        assignedDoctor: 'Dr. Asha Mwangi',
        nursingNotes: 'Patient responding well to treatment. Monitor vitals q4h.',
        nextAction: 'Administer medication at 14:00'
      },
      {
        id: 'E-002',
        patientName: 'Amos N.',
        patientId: 'P-2025-0045',
        diagnosis: 'Typhoid Fever',
        status: 'Monitoring',
        priority: 'Medium',
        startDate: '2025-09-18',
        assignedDoctor: 'Dr. Johannes Hamutenya',
        nursingNotes: 'Temperature stable. Patient eating well.',
        nextAction: 'Vital signs check at 16:00'
      },
      {
        id: 'E-003',
        patientName: 'Helena M.',
        patientId: 'P-2025-0089',
        diagnosis: 'Post-operative Care',
        status: 'Recovery',
        priority: 'Low',
        startDate: '2025-09-15',
        assignedDoctor: 'Dr. Asha Mwangi',
        nursingNotes: 'Wound healing well. Patient mobile.',
        nextAction: 'Dressing change tomorrow'
      }
    ]

    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
        <SectionCard
          title="Patient Episodes"
          subtitle="Manage ongoing patient care episodes and nursing interventions"
          icon={<Activity />}
          actions={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Input placeholder="Search episodes..." style={{ width: '200px' }} />
              <Button variant="outline" size="sm">
                <Search style={{ width: '16px', height: '16px' }} />
              </Button>
              <Button variant="primary" size="sm">
                New Episode
              </Button>
            </div>
          }
        >
          {mockEpisodes.map((episode) => (
            <Card key={episode.id} style={{ marginBottom: 'var(--spacing-4)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {episode.patientName} - {episode.diagnosis}
                    </h3>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Episode {episode.id} • Started: {new Date(episode.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                    <Badge variant={
                      episode.priority === 'High' ? 'danger' :
                      episode.priority === 'Medium' ? 'warning' : 'info'
                    }>
                      {episode.priority} Priority
                    </Badge>
                    <Badge variant={
                      episode.status === 'Active' ? 'success' :
                      episode.status === 'Monitoring' ? 'warning' : 'info'
                    }>
                      {episode.status}
                    </Badge>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>
                    <strong>Assigned Doctor:</strong> {episode.assignedDoctor}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>
                    <strong>Nursing Notes:</strong> {episode.nursingNotes}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    <strong>Next Action:</strong> {episode.nextAction}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="sm">
                    View Timeline
                  </Button>
                  <Button variant="primary" size="sm">
                    Add Note
                  </Button>
                  <Button variant="success" size="sm">
                    Update Status
                  </Button>
                  <Button variant="info" size="sm">
                    Contact Doctor
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
          <div>Loading nursing dashboard...</div>
        </div>
      )
    }

    switch (activeView) {
      case 'dashboard':
        return renderDashboardView()
      case 'patients':
        return renderPatientsView()
      case 'vitals':
        return renderVitalsView()
      case 'protocols':
        return renderProtocolsView()
      case 'episodes':
        return renderEpisodesView()
      default:
        return renderDashboardView()
    }
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Nurse Portal"
        subtitle="Patient Care & Clinical Protocols"
        userInfo={user.name}
        userRole="nurse"
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

export default NursePortal
