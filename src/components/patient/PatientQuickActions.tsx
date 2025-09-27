import React, { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar, 
  Search, 
  FileText, 
  Heart, 
  Brain, 
  Phone, 
  Download,
  Clock,
  User,
  Activity,
  MessageCircle,
  Stethoscope
} from 'lucide-react'

interface PatientQuickActionsProps {
  onNavigate: (view: string) => void
}

const PatientQuickActions: React.FC<PatientQuickActionsProps> = ({ onNavigate }) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const quickActions = [
    {
      id: 'book-appointment',
      title: 'Book Appointment',
      description: 'Schedule a visit with your healthcare provider',
      icon: <Calendar style={{ width: '24px', height: '24px' }} />,
      color: 'var(--primary-600)',
      bgColor: 'var(--primary-50)',
      action: () => onNavigate('appointments'),
      urgent: false
    },
    {
      id: 'find-doctors',
      title: 'Find Doctors',
      description: 'Search and connect with healthcare professionals',
      icon: <Search style={{ width: '24px', height: '24px' }} />,
      color: 'var(--blue-600)',
      bgColor: 'var(--blue-50)',
      action: () => onNavigate('doctors'),
      urgent: false
    },
    {
      id: 'view-records',
      title: 'Medical Records',
      description: 'Access your complete medical history',
      icon: <FileText style={{ width: '24px', height: '24px' }} />,
      color: 'var(--green-600)',
      bgColor: 'var(--green-50)',
      action: () => onNavigate('records'),
      urgent: false
    },
    {
      id: 'ai-diagnosis',
      title: 'AI Health Assistant',
      description: 'Get instant health guidance and symptom analysis',
      icon: <Brain style={{ width: '24px', height: '24px' }} />,
      color: 'var(--purple-600)',
      bgColor: 'var(--purple-50)',
      action: () => onNavigate('bots'),
      urgent: false
    },
    {
      id: 'emergency',
      title: 'Emergency Contact',
      description: 'Quick access to emergency services',
      icon: <Phone style={{ width: '24px', height: '24px' }} />,
      color: 'var(--red-600)',
      bgColor: 'var(--red-50)',
      action: () => {
        alert('Emergency Services: 911\nHospital: +1-555-HOSPITAL\nPoison Control: +1-800-222-1222')
      },
      urgent: true
    },
    {
      id: 'health-tips',
      title: 'Health Education',
      description: 'Learn about malaria prevention and health tips',
      icon: <Stethoscope style={{ width: '24px', height: '24px' }} />,
      color: 'var(--teal-600)',
      bgColor: 'var(--teal-50)',
      action: () => onNavigate('bots'),
      urgent: false
    }
  ]

  const healthReminders = [
    {
      id: 'medication',
      title: 'Medication Reminder',
      message: 'Take your antimalarial medication',
      time: '8:00 AM',
      type: 'medication',
      urgent: true
    },
    {
      id: 'appointment',
      title: 'Upcoming Appointment',
      message: 'Dr. Michael Brown - Tomorrow at 10:30 AM',
      time: 'Tomorrow',
      type: 'appointment',
      urgent: false
    },
    {
      id: 'checkup',
      title: 'Health Checkup Due',
      message: 'Annual physical examination recommended',
      time: 'This month',
      type: 'checkup',
      urgent: false
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
              backgroundColor: 'var(--primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User style={{ width: '30px', height: '30px', color: 'var(--primary-600)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
                Welcome back, {user?.firstName}!
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                Manage your health journey with quick actions below
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                border: action.urgent ? '2px solid var(--red-200)' : '1px solid var(--border-color)'
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
                        <Badge variant="danger" size="sm">
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

      {/* Health Reminders */}
      <div>
        <h3 style={{ 
          fontSize: 'var(--font-size-lg)', 
          fontWeight: 'var(--font-weight-semibold)', 
          marginBottom: 'var(--spacing-4)',
          color: 'var(--text-primary)'
        }}>
          Health Reminders
        </h3>
        <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
          {healthReminders.map((reminder) => (
            <Card key={reminder.id} style={{ 
              border: reminder.urgent ? '1px solid var(--orange-200)' : '1px solid var(--border-color)',
              backgroundColor: reminder.urgent ? 'var(--orange-25)' : 'white'
            }}>
              <CardContent style={{ padding: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: reminder.urgent ? 'var(--orange-500)' : 'var(--blue-500)'
                    }} />
                    <div>
                      <h5 style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: 'var(--font-weight-medium)', 
                        margin: 0,
                        marginBottom: 'var(--spacing-1)'
                      }}>
                        {reminder.title}
                      </h5>
                      <p style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--text-secondary)', 
                        margin: 0
                      }}>
                        {reminder.message}
                      </p>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-1)'
                  }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    {reminder.time}
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

export default PatientQuickActions
