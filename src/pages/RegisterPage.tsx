import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      console.log('🔐 Registering user:', formData)

      const response = await fetch('http://localhost:5001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Registration successful! Redirecting to login...')
        console.log('✅ Registration successful:', data)

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "#fff", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ color: "#1a73e8", margin: 0 }}>MESMTF</h1>
        <nav>
          <Link to="/" style={{ marginRight: "20px", textDecoration: "none", color: "#333" }}>Home</Link>
          <Link to="/login" style={{ textDecoration: "none", color: "#333" }}>Login</Link>
        </nav>
      </header>

      {/* Form Section */}
      <section style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", background: "#f8f9fa", padding: "40px" }}>
        <div style={{ background: "#fff", padding: "32px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}>
          <h2 style={{ marginBottom: "20px", color: "#1a73e8" }}>Create an Account</h2>

          {error && (
            <div style={{
              background: "#fee",
              color: "#c33",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "16px",
              border: "1px solid #fcc"
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: "#efe",
              color: "#363",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "16px",
              border: "1px solid #cfc"
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                opacity: isLoading ? 0.6 : 1
              }}
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                opacity: isLoading ? 0.6 : 1
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                opacity: isLoading ? 0.6 : 1
              }}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                opacity: isLoading ? 0.6 : 1
              }}
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <option value="">Select Role</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="RECEPTIONIST">Medical Receptionist</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="PATIENT">Patient</option>
              <option value="ADMIN">Admin</option>
            </select>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "12px",
                background: isLoading ? "#ccc" : "#1a73e8",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer"
              }}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <span style={{ color: "#666" }}>Already have an account? </span>
            <Link to="/login" style={{ color: "#1a73e8", textDecoration: "none" }}>
              Login here
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "16px", textAlign: "center", background: "#f1f1f1", color: "#777", fontSize: "0.9rem" }}>
        © 2025 MESMTF | Secure Healthcare Platform
      </footer>
    </div>
  )
}

export default RegisterPage