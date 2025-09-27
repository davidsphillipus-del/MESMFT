import React, { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar, 
  Users, 
  FileText, 
  Activity, 
  Stethoscope,
  Pill,
  Brain,
  Clock,
  User,
  Plus,
  AlertTriangle,
  Heart
} from 'lucide-react'

interface DoctorQuickActionsProps {
  onNavigate: (view: string) => void
  stats?: {
    activeEpisodes: number
    todayAppointments: number
    pendingRecords: number
  }
}

const DoctorQuickActions: React.FC<DoctorQuickActionsProps> = ({ onNavigate, stats }) => {
  const { user } = useAuth()

  const quickActions = [
    {
      id: 'new-episode',
      title: 'New Medical Episode',
      description: 'Start a new treatment episode for a patient',
      icon: <Plus style={{ width: '24px', height: '24px' }} />,
      color: 'var(--green-600)',
      bgColor: 'var(--green-50)',
      action: () => onNavigate('episodes'),
      urgent: false
    },
    {
      id: 'view-appointments',
      title: 'Today\'s Appointments',
      description: `${stats?.todayAppointments || 0} appointments scheduled for today`,
      icon: <Calendar style={{ width: '24px', height: '24px' }} />,
      color: 'var(--blue-600)',
      bgColor: 'var(--blue-50)',
      action: () => onNavigate('appointments'),
      urgent: stats?.todayAppointments ? stats.todayAppointments > 0 : false
    },
    {
      id: 'active-episodes',
      title: 'Active Episodes',
      description: `${stats?.activeEpisodes || 0} episodes requiring attention`,
      icon: <Activity style={{ width: '24px', height: '24px' }} />,
      color: 'var(--orange-600)',
      bgColor: 'var(--orange-50)',
      action: () => onNavigate('episodes'),
      urgent: stats?.activeEpisodes ? stats.activeEpisodes > 5 : false
    },
    {
      id: 'patient-search',
      title: 'Find Patients',
      description: 'Search and manage patient records',
      icon: <Users style={{ width: '24px', height: '24px' }} />,
      color: 'var(--purple-600)',
      bgColor: 'var(--purple-50)',
      action: () => onNavigate('patients'),
      urgent: false
    },
    {
      id: 'ai-diagnosis',
      title: 'AI Diagnosis Assistant',
      description: 'Get AI-powered diagnostic support',
      icon: <Brain style={{ width: '24px', height: '24px' }} />,
      color: 'var(--indigo-600)',
      bgColor: 'var(--indigo-50)',
      action: () => onNavigate('clinical-tools'),
      urgent: false
    },
    {
      id: 'prescriptions',
      title: 'Write Prescription',
      description: 'Create new prescriptions for patients',
      icon: <Pill style={{ width: '24px', height: '24px' }} />,
      color: 'var(--teal-600)',
      bgColor: 'var(--teal-50)',
      action: () => onNavigate('clinical-tools'),
      urgent: false
    }
  ]

  const clinicalAlerts = [
    {
      id: 'critical-patients',
      title: 'Critical Patients',
      message: '2 patients require immediate attention',
      type: 'critical',
      urgent: true
    },
    {
      id: 'lab-results',
      title: 'Lab Results Ready',
      message: '5 lab results pending review',
      type: 'info',
      urgent: false
    },
    {
      id: 'medication-alerts',
      title: 'Drug Interactions',
      message: '1 potential drug interaction detected',
      type: 'warning',
      urgent: true
    }
  ]

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      {/* Welcome Section */}
      <Card>
        <CardContent style={{ padding: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--blue-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope style={{ width: '30px', height: '30px', color: 'var(--blue-600)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
                Welcome, Dr. {user?.firstName}!
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                Ready to provide excellent patient care today
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Alerts */}
      {clinicalAlerts.some(alert => alert.urgent) && (
        <div>
          <h3 style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: 'var(--font-weight-semibold)', 
            marginBottom: 'var(--spacing-4)',
            color: 'var(--red-600)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)'
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px' }} />
            Urgent Alerts
          </h3>
          <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
            {clinicalAlerts.filter(alert => alert.urgent).map((alert) => (
              <Card key={alert.id} style={{ 
                border: '1px solid var(--red-200)',
                backgroundColor: 'var(--red-25)'
              }}>
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--red-500)'
                      }} />
                      <div>
                        <h5 style={{ 
                          fontSize: 'var(--font-size-sm)', 
                          fontWeight: 'var(--font-weight-medium)', 
                          margin: 0,
                          marginBottom: 'var(--spacing-1)'
                        }}>
                          {alert.title}
                        </h5>
                        <p style={{ 
                          fontSize: 'var(--font-size-xs)', 
                          color: 'var(--text-secondary)', 
                          margin: 0
                        }}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <Button variant="danger" size="sm">
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div>
        <h3 style={{ 
          fontSize: 'var(--font-size-lg)', 
          fontWeight: 'var(--font-weight-semibold)', 
          marginBottom: 'var(--spacing-4)',
          color: 'var(--text-primary)'
        }}>
          Quick Actions
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--spacing-4)' 
        }}>
          {quickActions.map((action) => (
            <Card 
              key={action.id} 
              style={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                border: action.urgent ? '2px solid var(--orange-200)' : '1px solid var(--border-color)'
              }}
              onClick={action.action}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent style={{ padding: 'var(--spacing-5)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-4)' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    backgroundColor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.color,
                    flexShrink: 0
                  }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                      <h4 style={{ 
                        fontSize: 'var(--font-size-md)', 
                        fontWeight: 'var(--font-weight-semibold)', 
                        margin: 0,
                        color: 'var(--text-primary)'
                      }}>
                        {action.title}
                      </h4>
                      {action.urgent && (
                        <Badge variant="warning" size="sm">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      color: 'var(--text-secondary)', 
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorQuickActions
