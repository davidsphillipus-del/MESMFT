import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Home, ArrowLeft } from 'lucide-react'
import styles from '../styles/layout.module.css'

const NotFoundPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: 'var(--spacing-4)'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ 
          fontSize: '120px', 
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--primary-600)',
          lineHeight: '1',
          marginBottom: 'var(--spacing-4)'
        }}>
          404
        </div>
        
        <h1 style={{ 
          fontSize: 'var(--font-size-3xl)', 
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-4)'
        }}>
          Page Not Found
        </h1>
        
        <p style={{ 
          fontSize: 'var(--font-size-lg)', 
          color: 'var(--text-secondary)',
          marginBottom: 'var(--spacing-8)',
          lineHeight: 'var(--line-height-relaxed)'
        }}>
          Sorry, the page you are looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to the homepage.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-4)', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/">
            <Button variant="primary">
              <Home style={{ width: '16px', height: '16px' }} />
              Go Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Go Back
          </Button>
        </div>

        <div style={{ 
          marginTop: 'var(--spacing-12)',
          padding: 'var(--spacing-6)',
          backgroundColor: 'var(--primary-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--primary-200)'
        }}>
          <h3 style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--primary-700)',
            marginBottom: 'var(--spacing-3)'
          }}>
            Quick Links
          </h3>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-4)', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: 'var(--font-size-sm)'
          }}>
            <Link to="/login" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
              Register
            </Link>
            <Link to="/about" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
              About
            </Link>
            <Link to="/education-bot" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
              Education Bot
            </Link>
            <Link to="/diagnosis-bot" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
              Diagnosis Bot
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
