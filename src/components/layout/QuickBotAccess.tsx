import React from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { Brain, Stethoscope } from 'lucide-react'

interface QuickBotAccessProps {
  variant?: 'default' | 'compact'
}

export const QuickBotAccess: React.FC<QuickBotAccessProps> = ({ variant = 'default' }) => {
  const openBot = (botType: 'education' | 'diagnosis') => {
    const url = botType === 'education' ? '/education-bot' : '/diagnosis-bot'
    window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
  }

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openBot('education')}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}
        >
          <Brain style={{ width: '16px', height: '16px' }} />
          Education Bot
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openBot('diagnosis')}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}
        >
          <Stethoscope style={{ width: '16px', height: '16px' }} />
          Diagnosis Bot
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardContent style={{ padding: 'var(--spacing-4)' }}>
        <h4 style={{ 
          fontSize: 'var(--font-size-md)', 
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--spacing-3)',
          color: 'var(--text-primary)'
        }}>
          AI Health Assistants
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openBot('education')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-2)',
              justifyContent: 'flex-start',
              width: '100%'
            }}
          >
            <Brain style={{ width: '18px', height: '18px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Education Bot
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                Learn about health topics
              </div>
            </div>
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => openBot('diagnosis')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-2)',
              justifyContent: 'flex-start',
              width: '100%'
            }}
          >
            <Stethoscope style={{ width: '18px', height: '18px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Diagnosis Bot
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                Symptom analysis & assessment
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
