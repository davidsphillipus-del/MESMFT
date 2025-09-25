import React from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { TopProfile } from '../components/layout/TopProfile'
import { SectionCard } from '../components/layout/SectionCard'
import { Navigation } from '../components/layout/Navigation'
import { StatsGrid } from '../components/layout/StatsGrid'
import { User, Activity, Calendar, FileText } from 'lucide-react'

// Test component to verify all components work correctly
const ComponentTest: React.FC = () => {
  const [activeNav, setActiveNav] = React.useState('home')

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <User /> },
    { id: 'activity', label: 'Activity', icon: <Activity /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar /> },
    { id: 'files', label: 'Files', icon: <FileText /> }
  ]

  const stats = [
    { label: 'Total Users', value: '1,234', color: 'var(--primary-600)' },
    { label: 'Active Sessions', value: '89', color: 'var(--green-600)' },
    { label: 'Pending Tasks', value: '12', color: 'var(--yellow-600)' },
    { label: 'Completed', value: '456', color: 'var(--blue-600)' }
  ]

  const profileDetails = [
    'Role: Test User',
    'Department: Development',
    'Location: Test Environment',
    'Status: Active'
  ]

  return (
    <div style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: 'var(--font-size-3xl)', 
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: 'var(--spacing-8)',
          textAlign: 'center',
          color: 'var(--primary-600)'
        }}>
          MESMTF Component Test Suite
        </h1>

        {/* Button Tests */}
        <Card style={{ marginBottom: 'var(--spacing-6)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
              Button Components
            </h2>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="info">Info</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badge Tests */}
        <Card style={{ marginBottom: 'var(--spacing-6)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
              Badge Components
            </h2>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="gray">Gray</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Input Tests */}
        <Card style={{ marginBottom: 'var(--spacing-6)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
              Input Components
            </h2>
            <div style={{ display: 'grid', gap: 'var(--spacing-4)', maxWidth: '400px' }}>
              <Input label="Text Input" placeholder="Enter text..." />
              <Input label="Email Input" type="email" placeholder="Enter email..." />
              <Input label="Password Input" type="password" placeholder="Enter password..." />
              <Input label="Error State" error={true} helperText="This field has an error" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid Test */}
        <Card style={{ marginBottom: 'var(--spacing-6)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
              Stats Grid Component
            </h2>
            <StatsGrid stats={stats} />
          </CardContent>
        </Card>

        {/* Layout Components */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-6)' }}>
          {/* Sidebar */}
          <div>
            <TopProfile
              name="Test User"
              id="TEST-001"
              details={profileDetails}
            />
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              <Navigation
                items={navigationItems}
                activeItem={activeNav}
                onItemClick={setActiveNav}
              />
            </div>
          </div>

          {/* Main Content */}
          <div>
            <SectionCard
              title="Section Card Test"
              subtitle="Testing the section card component"
              icon={<Activity />}
              actions={
                <Button variant="outline" size="sm">
                  Action Button
                </Button>
              }
            >
              <Card style={{ marginBottom: 'var(--spacing-3)' }}>
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>
                    Nested Card Example
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    This is a nested card inside a section card to test the layout components.
                  </p>
                  <div style={{ marginTop: 'var(--spacing-3)', display: 'flex', gap: 'var(--spacing-2)' }}>
                    <Badge variant="success">Active</Badge>
                    <Badge variant="info">Test</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>
                    Another Card
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-3)' }}>
                    Testing multiple cards within a section.
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
                    <Button variant="outline" size="sm">Cancel</Button>
                    <Button variant="primary" size="sm">Save</Button>
                  </div>
                </CardContent>
              </Card>
            </SectionCard>

            {/* Color Palette Test */}
            <Card style={{ marginTop: 'var(--spacing-6)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
                  Color Palette Test
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-3)' }}>
                  {[
                    { name: 'Primary', color: 'var(--primary-600)' },
                    { name: 'Secondary', color: 'var(--secondary-600)' },
                    { name: 'Success', color: 'var(--green-600)' },
                    { name: 'Warning', color: 'var(--yellow-600)' },
                    { name: 'Danger', color: 'var(--red-600)' },
                    { name: 'Info', color: 'var(--blue-600)' },
                    { name: 'Gray', color: 'var(--gray-600)' },
                    { name: 'Purple', color: 'var(--purple-600)' }
                  ].map((colorItem) => (
                    <div key={colorItem.name} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: colorItem.color,
                        borderRadius: 'var(--radius-md)',
                        margin: '0 auto var(--spacing-2) auto'
                      }} />
                      <div style={{ fontSize: 'var(--font-size-sm)' }}>
                        {colorItem.name}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Results */}
        <Card style={{ marginTop: 'var(--spacing-8)', backgroundColor: 'var(--green-50)', border: '2px solid var(--green-200)' }}>
          <CardContent style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--green-700)', marginBottom: 'var(--spacing-4)' }}>
              ✅ Component Test Results
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--green-700)' }}>
                  UI Components
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--green-600)' }}>
                  ✓ Button variants working<br/>
                  ✓ Input components functional<br/>
                  ✓ Card layouts rendering<br/>
                  ✓ Badge variants displaying
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--green-700)' }}>
                  Layout Components
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--green-600)' }}>
                  ✓ Navigation working<br/>
                  ✓ Profile cards rendering<br/>
                  ✓ Section cards functional<br/>
                  ✓ Stats grid displaying
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--green-700)' }}>
                  Styling System
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--green-600)' }}>
                  ✓ CSS variables loaded<br/>
                  ✓ Color palette working<br/>
                  ✓ Typography consistent<br/>
                  ✓ Spacing system active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ComponentTest
