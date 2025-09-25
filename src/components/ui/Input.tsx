import React from 'react'
import styles from '../../styles/components.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  label?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  error = false,
  label,
  helperText,
  className = '',
  ...props
}) => {
  const inputClass = `${styles.input} ${error ? styles.inputError : ''} ${className}`.trim()

  return (
    <div className={styles.formGroup}>
      {label && (
        <label className={styles.formLabel}>
          {label}
        </label>
      )}
      <input className={inputClass} {...props} />
      {helperText && (
        <div className={error ? styles.formError : styles.textSecondary}>
          {helperText}
        </div>
      )}
    </div>
  )
}
