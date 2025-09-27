import React from 'react'
import { Card, CardContent } from '../ui/Card'
import styles from '../../styles/layout.module.css'

interface TopProfileProps {
  name: string
  id: string
  details: string[]
  variant?: 'default' | 'green'
}

export const TopProfile: React.FC<TopProfileProps> = ({
  name,
  id,
  details,
  variant = 'default'
}) => {
  // Generate initials from name
  const initials = name
    ? name.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
    : '??'

  const avatarClass = variant === 'green'
    ? `${styles.profileAvatar} ${styles.profileAvatarGreen}`
    : styles.profileAvatar

  return (
    <Card className={styles.profileCard}>
      <CardContent className={styles.profileContent}>
        <div className={avatarClass}>
          {initials}
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>{name}</div>
          <div className={styles.profileId}>{id}</div>
          {details.map((detail, index) => (
            <div key={index} className={styles.profileDetails}>
              {detail}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
