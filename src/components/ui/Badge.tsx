import React from 'react'
import styles from '../../styles/components.module.css'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = ''
}) => {
  const baseClass = styles.badge
  const variantClass = styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
  
  return (
    <span className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </span>
  )
}
