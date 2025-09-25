import React from 'react'
import { Card, CardContent } from '../ui/Card'
import styles from '../../styles/layout.module.css'

interface SectionCardProps {
  title: string
  subtitle?: string
  icon: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'green'
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  variant = 'default'
}) => {
  const iconClass = variant === 'green' 
    ? `${styles.sectionCardIcon} ${styles.sectionCardIconGreen}`
    : styles.sectionCardIcon

  return (
    <Card className={styles.sectionCard}>
      <CardContent className={styles.sectionCardContent}>
        <div className={styles.sectionCardHeader}>
          <div className={styles.sectionCardTitle}>
            <div className={iconClass}>
              {icon}
            </div>
            <div>
              <div className={styles.sectionCardTitleText}>{title}</div>
              {subtitle && <div className={styles.sectionCardSubtitle}>{subtitle}</div>}
            </div>
          </div>
          {actions && (
            <div className={styles.sectionCardActions}>
              {actions}
            </div>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
