import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Search, User, Star, MapPin, Calendar } from 'lucide-react'

interface Doctor {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  specialization?: string
  department?: string
  licenseNumber?: string
}

interface DoctorSearchProps {
  onSelectDoctor?: (doctor: Doctor) => void
  showBookingButton?: boolean
}

const DoctorSearch: React.FC<DoctorSearchProps> = ({ 
  onSelectDoctor, 
  showBookingButton = true 
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [searchQuery, selectedSpecialization, doctors])

  const loadDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/doctors', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setDoctors(data.data)
        setFilteredDoctors(data.data)
      }
    } catch (error) {
      console.error('Failed to load doctors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    if (searchQuery) {
      filtered = filtered.filter(doctor => 
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(doctor => 
        doctor.specialization?.toLowerCase().includes(selectedSpecialization.toLowerCase())
      )
    }

    setFilteredDoctors(filtered)
  }

  const getSpecializations = () => {
    const specializations = doctors
      .map(doctor => doctor.specialization)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
    return specializations
  }

  const handleSelectDoctor = (doctor: Doctor) => {
    onSelectDoctor?.(doctor)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
          <div>Loading doctors...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
      {/* Search and Filter Controls */}
      <Card>
        <CardContent style={{ padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '16px', 
                  height: '16px',
                  color: 'var(--text-secondary)'
                }} 
              />
              <Input
                placeholder="Search doctors by name, specialization, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>

            {/* Specialization Filter */}
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Specializations</option>
              {getSpecializations().map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
        {filteredDoctors.length === 0 ? (
          <Card>
            <CardContent style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                {searchQuery || selectedSpecialization 
                  ? 'No doctors found matching your search criteria.'
                  : 'No doctors available at this time.'
                }
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
                      <User style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
                      {doctor.specialization && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                          <Star style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            {doctor.specialization}
                          </span>
                        </div>
                      )}

                      {doctor.department && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                          <MapPin style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            {doctor.department}
                          </span>
                        </div>
                      )}

                      {doctor.phone && (
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          📞 {doctor.phone}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                      {doctor.specialization && (
                        <Badge variant="info">
                          {doctor.specialization}
                        </Badge>
                      )}
                      <Badge variant="success">
                        Available
                      </Badge>
                    </div>
                  </div>

                  {showBookingButton && (
                    <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSelectDoctor(doctor)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleSelectDoctor(doctor)}
                      >
                        <Calendar style={{ width: '16px', height: '16px' }} />
                        Book Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredDoctors.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--text-secondary)',
          padding: 'var(--spacing-4)'
        }}>
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>
      )}
    </div>
  )
}

export default DoctorSearch
