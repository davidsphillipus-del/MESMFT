import React from 'react'
import styles from '../../styles/components.module.css'

export interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div className={`${styles.card} ${className}`} style={style}>
      {children}
    </div>
  )
}

export interface CardContentProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', style }) => {
  return (
    <div className={`${styles.cardContent} ${className}`} style={style}>
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', style }) => {
  return (
    <div className={`${styles.cardHeader} ${className}`} style={style}>
      {children}
    </div>
  )
}

export interface CardFooterProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', style }) => {
  return (
    <div className={`${styles.cardFooter} ${className}`} style={style}>
      {children}
    </div>
  )
}
