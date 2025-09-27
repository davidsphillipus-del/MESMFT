import React, { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { TopProfile } from '../components/layout/TopProfile'
import { SectionCard } from '../components/layout/SectionCard'
import { Navigation } from '../components/layout/Navigation'
import { StatsGrid } from '../components/layout/StatsGrid'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import { prescriptionAPI, medicationAPI } from '../services/api'
import { 
  Pill, 
  Package, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Plus,
  Clock,
  User,
  ShoppingCart
} from 'lucide-react'
import styles from '../styles/layout.module.css'

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Pill /> },
  { id: 'prescriptions', label: 'Prescriptions', icon: <FileText /> },
  { id: 'inventory', label: 'Inventory', icon: <Package /> },
  { id: 'dispensing', label: 'Dispensing Queue', icon: <ShoppingCart /> },
  { id: 'consultations', label: 'Patient Consultations', icon: <User /> }
]

const PharmacistPortal: React.FC = () => {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])

  useEffect(() => {
      const loadData = async () => {
        try {
          // Use real API endpoints
          const [prescriptionsResponse, inventoryResponse] = await Promise.all([
            prescriptionAPI.getPrescriptions(),
            medicationAPI.getMedications()
          ])
          setPrescriptions(prescriptionsResponse.data || [])
          setInventory(inventoryResponse.data || [])
        } catch (error) {
          console.error('Failed to load pharmacist data:', error)
          // Optionally show error UI or message here
        } finally {
          setIsLoading(false)
        }
      }

    if (user) {
      loadData()
    }
  }, [user])

  if (!user) return null

  const pharmacistProfile = user.profile || {}
  const profileDetails = [
    `License: ${pharmacistProfile.license || 'Not provided'}`,
    `Location: ${pharmacistProfile.location || 'Not specified'}`,
    `Certifications: ${pharmacistProfile.certifications?.join(', ') || 'None listed'}`,
    `Contact: ${pharmacistProfile.contact || user.email}`
  ]

  const stats = [
    { label: 'Pending Prescriptions', value: '12', color: 'var(--primary-600)' },
    { label: 'Dispensed Today', value: '28', color: 'var(--green-600)' },
    { label: 'Low Stock Items', value: '5', color: 'var(--red-600)' },
    { label: 'Patient Consultations', value: '8', color: 'var(--blue-600)' }
  ]

  const mockPrescriptions = [
    {
      id: 'RX-001',
      patientName: 'Nangula K.',
      patientId: 'P-2025-0001',
      doctor: 'Dr. Asha Mwangi',
      medication: 'Artemether-Lumefantrine (ACT)',
      dosage: '20mg/120mg tablets',
      quantity: '24 tablets',
      instructions: 'Take 4 tablets at once, then 4 tablets after 8 hours, then 4 tablets twice daily for 2 days',
      status: 'pending',
      priority: 'high',
      prescribed: '2025-09-25T09:30'
    },
    {
      id: 'RX-002',
      patientName: 'Amos N.',
      patientId: 'P-2025-0045',
      doctor: 'Dr. Johannes Hamutenya',
      medication: 'Ciprofloxacin',
      dosage: '500mg tablets',
      quantity: '14 tablets',
      instructions: 'Take 1 tablet twice daily for 7 days',
      status: 'ready',
      priority: 'normal',
      prescribed: '2025-09-25T08:15'
    },
    {
      id: 'RX-003',
      patientName: 'Helena M.',
      patientId: 'P-2025-0089',
      doctor: 'Dr. Asha Mwangi',
      medication: 'Paracetamol',
      dosage: '500mg tablets',
      quantity: '20 tablets',
      instructions: 'Take 1-2 tablets every 6 hours as needed for pain/fever',
      status: 'dispensed',
      priority: 'normal',
      prescribed: '2025-09-24T14:20'
    }
  ]

  const mockInventory = [
    { id: 1, name: 'Artemether-Lumefantrine', category: 'Antimalarial', stock: 150, minStock: 50, status: 'adequate', expiry: '2026-03-15' },
    { id: 2, name: 'Ciprofloxacin 500mg', category: 'Antibiotic', stock: 25, minStock: 30, status: 'low', expiry: '2025-12-20' },
    { id: 3, name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, minStock: 100, status: 'adequate', expiry: '2026-08-10' },
    { id: 4, name: 'Oral Rehydration Salts', category: 'Electrolyte', stock: 8, minStock: 20, status: 'critical', expiry: '2027-01-30' },
    { id: 5, name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 80, minStock: 40, status: 'adequate', expiry: '2025-11-05' }
  ]

  const renderDashboardView = () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <StatsGrid stats={stats} />
      
      {/* Pending Prescriptions */}
      <SectionCard
        title="Pending Prescriptions"
        subtitle="Prescriptions awaiting review and dispensing"
        icon={<FileText />}
        actions={
          <Button variant="primary" size="sm" onClick={() => setActiveView('prescriptions')}>
            View All Prescriptions
          </Button>
        }
      >
        {prescriptions.filter(p => p.status === 'pending').map((prescription) => (
          <Card key={prescription.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {prescription.patientName} - {prescription.id}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Prescribed by {prescription.doctor}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                  {prescription.priority === 'high' && (
                    <Badge variant="danger">High Priority</Badge>
                  )}
                  <Badge variant="warning">Pending</Badge>
                </div>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-3)' }}>
                <strong>{prescription.medication}</strong> - {prescription.dosage} × {prescription.quantity}
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm">
                  Review
                </Button>
                <Button variant="primary" size="sm">
                  Prepare
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Low Stock Alerts */}
      <SectionCard
        title="Inventory Alerts"
        subtitle="Items requiring attention"
        icon={<AlertTriangle />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('inventory')}>
            View Full Inventory
          </Button>
        }
      >
        {inventory.filter(item => item.stock < item.minStock).map((item) => (
          <Card key={item.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {item.category} | Stock: {item.stock} | Min: {item.minStock}
                  </div>
                </div>
                <Badge variant={item.status === 'critical' ? 'danger' : 'warning'}>
                  {item.status === 'critical' ? 'Critical' : 'Low Stock'}
                </Badge>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm">
                  Order More
                </Button>
                <Button variant="primary" size="sm">
                  Update Stock
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>

      {/* Ready for Pickup */}
      <SectionCard
        title="Ready for Pickup"
        subtitle="Dispensed medications awaiting patient collection"
        icon={<CheckCircle />}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveView('dispensing')}>
            Manage Dispensing
          </Button>
        }
      >
        {prescriptions.filter(p => p.status === 'ready').map((prescription) => (
          <Card key={prescription.id} style={{ marginBottom: 'var(--spacing-3)' }}>
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {prescription.patientName} - {prescription.id}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {prescription.medication} - {prescription.quantity}
                  </div>
                </div>
                <Badge variant="success">Ready</Badge>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm">
                  Print Label
                </Button>
                <Button variant="success" size="sm">
                  Dispense
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </SectionCard>
    </div>
  )

  const renderPrescriptionsView = () => (
    <SectionCard
      title="Prescription Management"
      subtitle="Review, prepare, and dispense patient prescriptions"
      icon={<FileText />}
      actions={
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Input placeholder="Search prescriptions..." style={{ width: '200px' }} />
          <Button variant="outline" size="sm">
            <Search style={{ width: '16px', height: '16px' }} />
          </Button>
        </div>
      }
    >
      {prescriptions.map((prescription) => (
        <Card key={prescription.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {prescription.patientName} - {prescription.id}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Prescribed by {prescription.doctor} on {new Date(prescription.prescribed).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                {prescription.priority === 'high' && (
                  <Badge variant="danger">High Priority</Badge>
                )}
                <Badge variant={
                  prescription.status === 'pending' ? 'warning' :
                  prescription.status === 'ready' ? 'success' : 'gray'
                }>
                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
                {prescription.medication}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>
                Dosage: {prescription.dosage} | Quantity: {prescription.quantity}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Instructions: {prescription.instructions}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
              {prescription.status === 'pending' && (
                <>
                  <Button variant="primary" size="sm">
                    Prepare
                  </Button>
                  <Button variant="success" size="sm">
                    Mark Ready
                  </Button>
                </>
              )}
              {prescription.status === 'ready' && (
                <Button variant="success" size="sm">
                  Dispense
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderInventoryView = () => (
    <SectionCard
      title="Inventory Management"
      subtitle="Monitor stock levels and manage pharmaceutical inventory"
      icon={<Package />}
      actions={
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Input placeholder="Search inventory..." style={{ width: '200px' }} />
          <Button variant="outline" size="sm">
            <Search style={{ width: '16px', height: '16px' }} />
          </Button>
          <Button variant="primary" size="sm">
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Item
          </Button>
        </div>
      }
    >
      {inventory.map((item) => (
        <Card key={item.id} style={{ marginBottom: 'var(--spacing-4)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {item.name}
                </h3>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Category: {item.category} | Expires: {item.expiry}
                </div>
              </div>
              <Badge variant={
                item.status === 'critical' ? 'danger' :
                item.status === 'low' ? 'warning' : 'success'
              }>
                {item.status === 'critical' ? 'Critical' :
                 item.status === 'low' ? 'Low Stock' : 'Adequate'}
              </Badge>
            </div>

            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Current Stock: <strong>{item.stock}</strong>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Minimum Stock: <strong>{item.minStock}</strong>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--gray-200)',
                borderRadius: '4px',
                marginTop: 'var(--spacing-2)',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min((item.stock / item.minStock) * 100, 100)}%`,
                  height: '100%',
                  backgroundColor: item.status === 'critical' ? 'var(--red-500)' :
                                   item.status === 'low' ? 'var(--yellow-500)' : 'var(--green-500)',
                  transition: 'width 0.3s ease-in-out'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm">
                View History
              </Button>
              <Button variant="primary" size="sm">
                Update Stock
              </Button>
              {(item.status === 'low' || item.status === 'critical') && (
                <Button variant="success" size="sm">
                  Order More
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </SectionCard>
  )

  const renderDispensingQueueView = () => {
    const mockDispensingQueue = [
      {
        id: 'DQ-001',
        prescriptionId: 'RX-001',
        patientName: 'Nangula K.',
        patientId: 'P-2025-0001',
        medication: 'Artemether-Lumefantrine (ACT)',
        quantity: '24 tablets',
        priority: 'high',
        status: 'ready',
        preparedBy: 'Pharmacist Sarah',
        preparedAt: '2025-09-25T10:30',
        waitTime: '5 minutes'
      },
      {
        id: 'DQ-002',
        prescriptionId: 'RX-002',
        patientName: 'Amos N.',
        patientId: 'P-2025-0045',
        medication: 'Ciprofloxacin 500mg',
        quantity: '14 tablets',
        priority: 'normal',
        status: 'preparing',
        preparedBy: 'Pharmacist Sarah',
        preparedAt: null,
        waitTime: '15 minutes'
      },
      {
        id: 'DQ-003',
        prescriptionId: 'RX-003',
        patientName: 'Helena M.',
        patientId: 'P-2025-0089',
        medication: 'Paracetamol 500mg',
        quantity: '20 tablets',
        priority: 'normal',
        status: 'dispensed',
        preparedBy: 'Pharmacist Sarah',
        preparedAt: '2025-09-25T09:45',
        waitTime: '0 minutes'
      }
    ]

    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
        <SectionCard
          title="Dispensing Queue"
          subtitle="Manage prescription dispensing and patient pickup"
          icon={<Clock />}
          actions={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="outline" size="sm">
                Refresh Queue
              </Button>
              <Button variant="primary" size="sm">
                Call Next Patient
              </Button>
            </div>
          }
        >
          {mockDispensingQueue.map((item) => (
            <Card key={item.id} style={{ marginBottom: 'var(--spacing-4)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {item.patientName} - {item.medication}
                    </h3>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Prescription: {item.prescriptionId} • Quantity: {item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                    {item.priority === 'high' && (
                      <Badge variant="danger">High Priority</Badge>
                    )}
                    <Badge variant={
                      item.status === 'ready' ? 'success' :
                      item.status === 'preparing' ? 'warning' : 'info'
                    }>
                      {item.status === 'ready' ? 'Ready for Pickup' :
                       item.status === 'preparing' ? 'Preparing' : 'Dispensed'}
                    </Badge>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Patient ID: {item.patientId}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Prepared by: {item.preparedBy}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Wait time: {item.waitTime}
                  </div>
                  {item.preparedAt && (
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Prepared at: {new Date(item.preparedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="sm">
                    View Prescription
                  </Button>
                  {item.status === 'preparing' && (
                    <Button variant="success" size="sm">
                      Mark Ready
                    </Button>
                  )}
                  {item.status === 'ready' && (
                    <Button variant="primary" size="sm">
                      Dispense
                    </Button>
                  )}
                  <Button variant="info" size="sm">
                    Contact Patient
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </SectionCard>
      </div>
    )
  }

  const renderPatientConsultationsView = () => {
    const mockConsultations = [
      {
        id: 'PC-001',
        patientName: 'Nangula K.',
        patientId: 'P-2025-0001',
        consultationType: 'Medication Review',
        scheduledTime: '2025-09-25T14:00',
        status: 'scheduled',
        medications: ['Artemether-Lumefantrine', 'Paracetamol'],
        concerns: 'Patient experiencing mild nausea with antimalarial treatment',
        notes: 'Discuss timing of medication with meals'
      },
      {
        id: 'PC-002',
        patientName: 'Amos N.',
        patientId: 'P-2025-0045',
        consultationType: 'Drug Interaction Check',
        scheduledTime: '2025-09-25T15:30',
        status: 'in-progress',
        medications: ['Ciprofloxacin', 'Multivitamin'],
        concerns: 'Patient wants to start taking supplements',
        notes: 'Check for interactions with current antibiotic therapy'
      },
      {
        id: 'PC-003',
        patientName: 'Helena M.',
        patientId: 'P-2025-0089',
        consultationType: 'Adherence Counseling',
        scheduledTime: '2025-09-25T11:00',
        status: 'completed',
        medications: ['Metformin', 'Lisinopril'],
        concerns: 'Patient frequently forgets to take evening medications',
        notes: 'Provided pill organizer and reminder app recommendations'
      }
    ]

    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
        <SectionCard
          title="Patient Consultations"
          subtitle="Provide pharmaceutical care and medication counseling"
          icon={<Users />}
          actions={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="outline" size="sm">
                View Calendar
              </Button>
              <Button variant="primary" size="sm">
                Schedule Consultation
              </Button>
            </div>
          }
        >
          {mockConsultations.map((consultation) => (
            <Card key={consultation.id} style={{ marginBottom: 'var(--spacing-4)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {consultation.patientName} - {consultation.consultationType}
                    </h3>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {new Date(consultation.scheduledTime).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={
                    consultation.status === 'completed' ? 'success' :
                    consultation.status === 'in-progress' ? 'warning' : 'info'
                  }>
                    {consultation.status === 'in-progress' ? 'In Progress' :
                     consultation.status === 'completed' ? 'Completed' : 'Scheduled'}
                  </Badge>
                </div>

                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>
                    <strong>Patient ID:</strong> {consultation.patientId}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>
                    <strong>Medications:</strong> {consultation.medications.join(', ')}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>
                    <strong>Patient Concerns:</strong> {consultation.concerns}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    <strong>Notes:</strong> {consultation.notes}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="sm">
                    View Patient History
                  </Button>
                  {consultation.status === 'scheduled' && (
                    <Button variant="primary" size="sm">
                      Start Consultation
                    </Button>
                  )}
                  {consultation.status === 'in-progress' && (
                    <Button variant="success" size="sm">
                      Complete Consultation
                    </Button>
                  )}
                  <Button variant="info" size="sm">
                    Add Notes
                  </Button>
                  <Button variant="secondary" size="sm">
                    Reschedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </SectionCard>
      </div>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div>Loading pharmacy dashboard...</div>
        </div>
      )
    }

    switch (activeView) {
      case 'dashboard':
        return renderDashboardView()
      case 'prescriptions':
        return renderPrescriptionsView()
      case 'inventory':
        return renderInventoryView()
      case 'dispensing':
        return renderDispensingQueueView()
      case 'consultations':
        return renderPatientConsultationsView()
      default:
        return renderDashboardView()
    }
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Pharmacist Portal"
        subtitle="Prescription Management & Pharmaceutical Care"
        userInfo={user.name}
        userRole="pharmacist"
        showBackButton={activeView !== 'dashboard'}
        showHomeButton={activeView !== 'dashboard'}
        onBack={() => setActiveView('dashboard')}
      />

      <main style={{ padding: 'var(--spacing-6) 0' }}>
        <div className={styles.portalContainer}>
          <div className={styles.portalGrid}>
            {/* Sidebar */}
            <div className={styles.portalSidebar}>
              <TopProfile
                name={user.name}
                id={user.id}
                details={profileDetails}
              />
              <Navigation
                items={NAVIGATION_ITEMS}
                activeItem={activeView}
                onItemClick={setActiveView}
              />
            </div>

            {/* Main Content */}
            <div className={styles.portalContent}>
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PharmacistPortal
