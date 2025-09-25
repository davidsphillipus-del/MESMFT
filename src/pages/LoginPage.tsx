import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import styles from '../styles/layout.module.css'

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login, isAuthenticated, isLoading, error, clearError, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes = {
        patient: '/patient',
        doctor: '/doctor',
        nurse: '/nurse',
        receptionist: '/receptionist',
        pharmacist: '/pharmacist'
      }
      const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/'
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Clear error when component mounts or form changes
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      return
    }

    setIsSubmitting(true)
    try {
      await login(formData)
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, var(--primary-50), white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-4)'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Back to Home */}
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <Link 
            to="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-2)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back to Home
          </Link>
        </div>

        <Card style={{ boxShadow: 'var(--shadow-xl)' }}>
          <CardContent style={{ padding: 'var(--spacing-8)' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
              <h1 style={{ 
                fontSize: 'var(--font-size-2xl)', 
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--primary-700)',
                marginBottom: 'var(--spacing-2)'
              }}>
                MESMTF
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                Sign in to your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: 'var(--red-50)',
                color: 'var(--red-700)',
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-6)',
                fontSize: 'var(--font-size-sm)',
                border: '1px solid var(--red-200)'
              }}>
                {error}
              </div>
            )}

            {/* Demo Credentials */}
            <div style={{
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-6)',
              fontSize: 'var(--font-size-sm)',
              border: '1px solid var(--primary-200)'
            }}>
              <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
                Demo Credentials:
              </div>
              <div>Email: Any user email (e.g., nangula@example.com)</div>
              <div>Password: password123</div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ position: 'relative' }}>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    disabled={isSubmitting || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 'var(--spacing-3)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      padding: 'var(--spacing-1)'
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: '16px', height: '16px' }} />
                    ) : (
                      <Eye style={{ width: '16px', height: '16px' }} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isLoading || !formData.email || !formData.password}
                style={{ width: '100%', marginBottom: 'var(--spacing-6)' }}
              >
                {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Register Link */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: 'var(--primary-600)', 
                    textDecoration: 'none',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--spacing-6)',
          color: 'var(--text-tertiary)',
          fontSize: 'var(--font-size-sm)'
        }}>
          <p>
            Medical Expert System for Malaria & Typhoid Fever
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
