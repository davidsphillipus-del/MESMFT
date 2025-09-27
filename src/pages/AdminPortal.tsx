import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SectionCard } from '../components/layout/SectionCard'
import { StatsGrid } from '../components/layout/StatsGrid'
import {
  Users,
  Activity,
  Settings,
  BarChart3,
  Shield,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import styles from '../styles/layout.module.css'
import componentStyles from '../styles/components.module.css'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalPatients: number
  totalAppointments: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  uptime: string
}

interface User {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
  isActive: boolean
  lastLogin?: string
}

const AdminPortal: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 12,
    activeUsers: 8,
    totalPatients: 45,
    totalAppointments: 23,
    systemHealth: 'healthy',
    uptime: '99.9%'
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate loading users data
    setLoading(true)
    setTimeout(() => {
      setUsers([
        { id: '1', email: 'admin1@mesmtf.com', role: 'ADMIN', firstName: 'System', lastName: 'Administrator', isActive: true, lastLogin: '2024-01-15 10:30' },
        { id: '2', email: 'doctor1@mesmtf.com', role: 'DOCTOR', firstName: 'Dr. Michael', lastName: 'Smith', isActive: true, lastLogin: '2024-01-15 09:15' },
        { id: '3', email: 'nurse1@mesmtf.com', role: 'NURSE', firstName: 'Lisa', lastName: 'Wilson', isActive: true, lastLogin: '2024-01-15 08:45' },
        { id: '4', email: 'patient1@mesmtf.com', role: 'PATIENT', firstName: 'John', lastName: 'Doe', isActive: false, lastLogin: '2024-01-14 16:20' },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const renderDashboard = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      {/* System Stats */}
      <StatsGrid
        stats={[
          { label: 'Total Users', value: stats.totalUsers.toString(), color: 'var(--primary-600)' },
          { label: 'Active Users', value: stats.activeUsers.toString(), color: 'var(--secondary-600)' },
          { label: 'Total Patients', value: stats.totalPatients.toString(), color: 'var(--blue-600)' },
          { label: 'Total Appointments', value: stats.totalAppointments.toString(), color: 'var(--purple-600)' }
        ]}
      />

      {/* Recent Activity */}
      <SectionCard
        title="Recent System Activity"
        subtitle="Latest system events and user activities"
        icon={<Activity />}
      >
        <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--secondary-600)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>New patient registered: Jane Smith</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>2 hours ago</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <Clock style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Appointment scheduled by Dr. Michael Smith</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>4 hours ago</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <TrendingUp style={{ width: '20px', height: '20px', color: 'var(--purple-600)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>System backup completed successfully</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>6 hours ago</span>
          </div>
        </div>
      </SectionCard>
    </div>
  )

  const renderUserManagement = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <SectionCard
        title="User Management"
        subtitle="Manage system users and their permissions"
        icon={<Users />}
        actions={
          <Button variant="primary">Add New User</Button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Login</th>
                <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--bg-primary)' }}>
              {users.map((user) => (
                <tr key={user.id} style={{ borderTop: '1px solid var(--border-primary)' }}>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{user.firstName} {user.lastName}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{user.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                    <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'DOCTOR' ? 'success' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                    <Badge variant={user.isActive ? 'success' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {user.lastLogin || 'Never'}
                  </td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )

  const renderSystemSettings = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-6)' }}>
        <SectionCard
          title="Security Settings"
          subtitle="System security configuration"
          icon={<Shield />}
        >
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Two-Factor Authentication</span>
              <Badge variant="success">Enabled</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Password Policy</span>
              <Badge variant="success">Strong</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Session Timeout</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>30 minutes</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="System Maintenance"
          subtitle="System health and maintenance status"
          icon={<Database />}
        >
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Last Backup</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>2 hours ago</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Database Size</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>2.4 GB</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>System Uptime</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{stats.uptime}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Admin Portal"
        subtitle="System Administration & Management"
        userInfo={user?.firstName || 'Admin'}
        userRole="admin"
        showBackButton={false}
        showHomeButton={false}
      />

      <main className={styles.mainContent}>
        <div className={componentStyles.container}>
          {/* Welcome Section */}
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Admin Portal</h1>
            <p style={{ marginTop: 'var(--spacing-2)', color: 'var(--text-secondary)' }}>
              Welcome back, {user?.firstName}! Manage your healthcare system from here.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <nav style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'settings', label: 'System Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-2)',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? 'var(--primary-100)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  <tab.icon style={{ width: '16px', height: '16px' }} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'settings' && renderSystemSettings()}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AdminPortal
