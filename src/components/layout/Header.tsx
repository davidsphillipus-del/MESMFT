import React from 'react'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationCenter } from './NotificationCenter'
import styles from '../../styles/layout.module.css'

interface HeaderProps {
  title: string
  subtitle?: string
  userInfo?: string
  userRole?: string
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, userInfo, userRole }) => {
  const { logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerBrand}>
          <div className={styles.headerTitle}>MESMTF</div>
          {subtitle && <div className={styles.headerSubtitle}>{subtitle}</div>}
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
