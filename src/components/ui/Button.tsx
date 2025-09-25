import React from 'react'
import styles from '../../styles/components.module.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'success' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClass = styles.button
  const variantClass = styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  }
  
  const combinedClassName = `${baseClass} ${variantClass} ${className}`.trim()

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  )
}
