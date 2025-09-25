import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Bell, X, AlertCircle, Info, CheckCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  source?: string
}

interface NotificationCenterProps {
  userRole: string
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Mock notifications based on user role
    const baseNotifications: Notification[] = []
    
    if (userRole === 'patient') {
      baseNotifications.push(
        {
          id: 'n1',
          type: 'info',
          title: 'Appointment Reminder',
          message: 'Your follow-up appointment is scheduled for tomorrow at 2:00 PM',
          timestamp: '2025-09-25T10:00',
          read: false,
          source: 'Reception'
        },
        {
          id: 'n2',
          type: 'success',
          title: 'Lab Results Available',
          message: 'Your recent blood test results are now available in your medical records',
          timestamp: '2025-09-24T16:30',
          read: false,
          source: 'Laboratory'
        }
      )
    } else if (userRole === 'doctor') {
      baseNotifications.push(
        {
          id: 'n3',
          type: 'warning',
          title: 'Patient Alert',
          message: 'Patient Nangula K. reported adverse reaction to prescribed medication',
          timestamp: '2025-09-25T09:15',
          read: false,
          source: 'Pharmacy'
        },
        {
          id: 'n4',
          type: 'info',
          title: 'New Consultation Request',
          message: 'Nurse Tamara has requested consultation for patient in Ward 2',
          timestamp: '2025-09-25T08:45',
          read: false,
          source: 'Nursing'
        }
      )
    } else if (userRole === 'nurse') {
      baseNotifications.push(
        {
          id: 'n5',
          type: 'error',
          title: 'Critical Alert',
          message: 'Patient in Room 205 requires immediate attention - vital signs abnormal',
          timestamp: '2025-09-25T11:30',
          read: false,
          source: 'Monitoring System'
        },
        {
          id: 'n6',
          type: 'info',
          title: 'Medication Schedule',
          message: 'Reminder: Patient Amos N. due for next dose at 2:00 PM',
          timestamp: '2025-09-25T13:45',
          read: false,
          source: 'Pharmacy'
        }
      )
    }
    
    return baseNotifications
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle style={{ width: '16px', height: '16px', color: 'var(--yellow-600)' }} />
      case 'success':
        return <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--green-600)' }} />
      case 'error':
        return <AlertCircle style={{ width: '16px', height: '16px', color: 'var(--red-600)' }} />
      default:
        return <Info style={{ width: '16px', height: '16px', color: 'var(--blue-600)' }} />
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative' }}
      >
        <Bell style={{ width: '16px', height: '16px' }} />
        {unreadCount > 0 && (
          <Badge 
            variant="danger" 
            style={{ 
              position: 'absolute', 
              top: '-8px', 
              right: '-8px', 
              minWidth: '20px',
              height: '20px',
              borderRadius: '10px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          zIndex: 1000,
          width: '350px',
          maxHeight: '400px',
          marginTop: 'var(--spacing-2)'
        }}>
          <Card style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}>
            <CardContent style={{ padding: '0' }}>
              <div style={{ 
                padding: 'var(--spacing-4)', 
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Notifications
                </h4>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  {unreadCount > 0 && (
                    <Button variant="outline" size="xs" onClick={markAllAsRead}>
                      Mark All Read
                    </Button>
                  )}
                  <Button variant="outline" size="xs" onClick={() => setIsOpen(false)}>
                    <X style={{ width: '12px', height: '12px' }} />
                  </Button>
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ 
                    padding: 'var(--spacing-6)', 
                    textAlign: 'center', 
                    color: 'var(--text-secondary)' 
                  }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      style={{
                        padding: 'var(--spacing-4)',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: notification.read ? 'white' : 'var(--blue-50)',
                        cursor: 'pointer'
                      }}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flex: 1 }}>
                          {getIcon(notification.type)}
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: 'var(--font-size-sm)', 
                              fontWeight: 'var(--font-weight-medium)',
                              marginBottom: 'var(--spacing-1)'
                            }}>
                              {notification.title}
                            </div>
                            <div style={{ 
                              fontSize: 'var(--font-size-xs)', 
                              color: 'var(--text-secondary)',
                              marginBottom: 'var(--spacing-1)'
                            }}>
                              {notification.message}
                            </div>
                            <div style={{ 
                              fontSize: 'var(--font-size-xs)', 
                              color: 'var(--text-muted)',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}>
                              <span>{new Date(notification.timestamp).toLocaleString()}</span>
                              {notification.source && <span>From: {notification.source}</span>}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                          style={{ marginLeft: 'var(--spacing-2)' }}
                        >
                          <X style={{ width: '10px', height: '10px' }} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
