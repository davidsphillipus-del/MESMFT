import React from 'react'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationCenter } from './NotificationCenter'
import { ArrowLeft, Home } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import styles from '../../styles/layout.module.css'

interface HeaderProps {
  title: string
  subtitle?: string
  userInfo?: string
  userRole?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  onBack?: () => void
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  userInfo,
  userRole,
  showBackButton = false,
  showHomeButton = false,
  onBack
}) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1) // Go back to previous page
    }
  }

  const handleHomeClick = () => {
    if (user?.role) {
      // Navigate to appropriate portal based on user role
      const rolePortalMap: { [key: string]: string } = {
        'DOCTOR': '/doctor-portal',
        'PATIENT': '/patient-portal',
        'NURSE': '/nurse-portal',
        'PHARMACIST': '/pharmacist-portal',
        'RECEPTIONIST': '/receptionist-portal',
        'ADMIN': '/admin-portal'
      }
      const portalPath = rolePortalMap[user.role] || '/'
      navigate(portalPath)
    } else {
      navigate('/')
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerBrand}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={handleBack}
                style={{ padding: '8px' }}
              >
                <ArrowLeft style={{ width: '20px', height: '20px' }} />
              </Button>
            )}

            {/* Home Button */}
            {showHomeButton && (
              <Button
                variant="ghost"
                onClick={handleHomeClick}
                style={{ padding: '8px' }}
              >
                <Home style={{ width: '20px', height: '20px' }} />
              </Button>
            )}

            {/* Clickable Title */}
            <div
              onClick={handleHomeClick}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.headerTitle}>MESMTF</div>
              {subtitle && <div className={styles.headerSubtitle}>{subtitle}</div>}
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          {userInfo && (
            <div className={styles.headerUserInfo}>
              Signed in as <strong>{userInfo}</strong>
            </div>
          )}
          {userRole && <NotificationCenter userRole={userRole} />}
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
