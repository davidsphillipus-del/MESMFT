import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, ArrowLeft, User, Stethoscope, Heart, UserCheck, Pill } from 'lucide-react'
import styles from '../styles/layout.module.css'

const ROLE_OPTIONS = [
  { 
    value: 'patient', 
    label: 'Patient', 
    description: 'Access medical records, book appointments, and use health tools',
    icon: User
  },
  { 
    value: 'doctor', 
    label: 'Doctor', 
    description: 'Manage patients, episodes, and use diagnostic tools',
    icon: Stethoscope
  },
  { 
    value: 'nurse', 
    label: 'Nurse', 
    description: 'Patient care, episode management, and clinical protocols',
    icon: Heart
  },
  { 
    value: 'receptionist', 
    label: 'Medical Receptionist', 
    description: 'Patient registration, appointments, and front desk operations',
    icon: UserCheck
  },
  { 
    value: 'pharmacist', 
    label: 'Pharmacist', 
    description: 'Prescription management, inventory, and patient consultations',
    icon: Pill
  }
]

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(1) // 1: Role selection, 2: Registration form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    additionalInfo: {}
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const { register, isAuthenticated, isLoading, error, clearError, user } = useAuth()
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

  // Clear error when form changes
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [formData])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.role) {
      errors.role = 'Please select a role'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)

    if (!validateForm()) {
      console.log('Form validation failed:', validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const { confirmPassword, ...registrationData } = formData
      console.log('Attempting registration with:', registrationData)
      await register(registrationData)
      console.log('Registration successful!')
      // Registration successful - user will be redirected by useEffect
    } catch (err) {
      // Error is handled by the auth context
      console.error('Registration failed:', err)
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
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleRoleSelect = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role
    }))
    setStep(2)
  }

  const selectedRole = ROLE_OPTIONS.find(r => r.value === formData.role)

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, var(--primary-50), white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-4)'
    }}>
      <div style={{ width: '100%', maxWidth: step === 1 ? '800px' : '400px' }}>
        {/* Back Navigation */}
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          {step === 1 ? (
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
          ) : (
            <button
              onClick={() => setStep(1)}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Role Selection
            </button>
          )}
        </div>

        {step === 1 ? (
          /* Step 1: Role Selection */
          <Card style={{ boxShadow: 'var(--shadow-xl)' }}>
            <CardContent style={{ padding: 'var(--spacing-8)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
                <h1 style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--primary-700)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Join MESMTF
                </h1>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Select your role to get started
                </p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-4)'
              }}>
                {ROLE_OPTIONS.map((role) => {
                  const IconComponent = role.icon
                  return (
                    <Card 
                      key={role.value}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        border: '2px solid transparent'
                      }}
                      onClick={() => handleRoleSelect(role.value)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary-200)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <CardContent style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
                        <IconComponent style={{ 
                          width: '32px', 
                          height: '32px', 
                          color: 'var(--primary-600)',
                          marginBottom: 'var(--spacing-3)'
                        }} />
                        <h3 style={{ 
                          fontSize: 'var(--font-size-lg)', 
                          fontWeight: 'var(--font-weight-semibold)',
                          marginBottom: 'var(--spacing-2)'
                        }}>
                          {role.label}
                        </h3>
                        <p style={{ 
                          color: 'var(--text-secondary)',
                          fontSize: 'var(--font-size-sm)',
                          lineHeight: 'var(--line-height-relaxed)'
                        }}>
                          {role.description}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div style={{ textAlign: 'center', marginTop: 'var(--spacing-8)' }}>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      color: 'var(--primary-600)', 
                      textDecoration: 'none',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Step 2: Registration Form */
          <Card style={{ boxShadow: 'var(--shadow-xl)' }}>
            <CardContent style={{ padding: 'var(--spacing-8)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
                <h1 style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--primary-700)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Create Account
                </h1>
                {selectedRole && (
                  <p style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    Registering as: <strong>{selectedRole.label}</strong>
                  </p>
                )}
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

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <Input
                    type="text"
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    disabled={isSubmitting || isLoading}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />
                </div>

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
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                  />
                </div>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      label="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a password"
                      disabled={isSubmitting || isLoading}
                      error={!!validationErrors.password}
                      helperText={validationErrors.password}
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

                <div style={{ marginBottom: 'var(--spacing-6)' }}>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      label="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      disabled={isSubmitting || isLoading}
                      error={!!validationErrors.confirmPassword}
                      helperText={validationErrors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      {showConfirmPassword ? (
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
                  disabled={isSubmitting || isLoading}
                  style={{ width: '100%', marginBottom: 'var(--spacing-6)' }}
                >
                  {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div style={{ textAlign: 'center' }}>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      color: 'var(--primary-600)', 
                      textDecoration: 'none',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default RegisterPage
