import React from 'react'
import { Card, CardContent } from '../ui/Card'
import styles from '../../styles/layout.module.css'

interface StatItem {
  label: string
  value: string | number
  color?: string
}

interface StatsGridProps {
  stats: StatItem[]
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <Card key={index} className={styles.statCard}>
          <CardContent style={{ padding: 0 }}>
            <div className={styles.statValue} style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className={styles.statLabel}>
              {stat.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
