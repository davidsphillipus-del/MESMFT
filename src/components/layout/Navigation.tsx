import React from 'react'
import { Card, CardContent } from '../ui/Card'
import styles from '../../styles/layout.module.css'

interface NavigationItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface NavigationProps {
  items: NavigationItem[]
  activeItem: string
  onItemClick: (itemId: string) => void
  variant?: 'default' | 'green'
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  variant = 'default'
}) => {
  const getItemClass = (itemId: string) => {
    const baseClass = styles.navItem
    if (itemId === activeItem) {
      const activeClass = variant === 'green' 
        ? styles.navItemActiveGreen 
        : styles.navItemActive
      return `${baseClass} ${activeClass}`
    }
    return baseClass
  }

  return (
    <Card>
      <CardContent>
        <div className={styles.navMenu}>
          {items.map((item) => (
            <button
              key={item.id}
              className={getItemClass(item.id)}
              onClick={() => onItemClick(item.id)}
            >
              {item.icon && (
                <span style={{ marginRight: '8px' }}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
