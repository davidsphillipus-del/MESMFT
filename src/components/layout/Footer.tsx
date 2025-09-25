import React from 'react'
import styles from '../../styles/layout.module.css'

interface FooterProps {
  text?: string
}

export const Footer: React.FC<FooterProps> = ({ text = '© 2025 MESMTF' }) => {
  return (
    <footer className={styles.footer}>
      {text}
    </footer>
  )
}
