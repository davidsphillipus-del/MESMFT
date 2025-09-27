import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { 
  Brain, 
  Stethoscope, 
  Users, 
  Activity, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import styles from '../styles/layout.module.css'
import componentStyles from '../styles/components.module.css'

const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, var(--primary-50), white)' }}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerBrand}>
            <div className={styles.headerTitle}>MESMTF</div>
            <div className={styles.headerSubtitle}>Medical Expert System</div>
          </div>
          <div className={styles.headerActions}>
            <Link to="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 0' }}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ 
              fontSize: 'var(--font-size-4xl)', 
              fontWeight: 'var(--font-weight-bold)', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-6)',
              lineHeight: 'var(--line-height-tight)'
            }}>
              Advanced Healthcare Management for
              <span style={{ color: 'var(--primary-600)' }}> Malaria & Typhoid Fever</span>
            </h1>
            
            <p style={{ 
              fontSize: 'var(--font-size-xl)', 
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-8)',
              lineHeight: 'var(--line-height-relaxed)'
            }}>
              Comprehensive medical expert system providing AI-assisted diagnosis, patient management, 
              and healthcare coordination for medical professionals and patients.
            </p>

            <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register">
                <Button variant="primary" style={{ padding: 'var(--spacing-4) var(--spacing-8)' }}>
                  Start Your Journey <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Button>
              </Link>
              <Link to="/diagnosis-bot">
                <Button variant="outline" style={{ padding: 'var(--spacing-4) var(--spacing-8)' }}>
                  Try Diagnosis Bot
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section style={{ 
        backgroundColor: 'var(--primary-600)', 
        color: 'white', 
        padding: 'var(--spacing-16) 0' 
      }}>
        <div className={styles.container}>
          <div className={componentStyles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                10,000+
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9 }}>
                Patients Served
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                500+
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9 }}>
                Healthcare Providers
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                95%
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9 }}>
                Diagnostic Accuracy
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                24/7
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9 }}>
                System Availability
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bot Cards Section */}
      <section style={{ padding: 'var(--spacing-20) 0' }}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-16)' }}>
            <h2 style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-4)'
            }}>
              AI-Powered Healthcare Tools
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)', 
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Advanced artificial intelligence tools to support medical professionals and educate patients
            </p>
          </div>

          <div className={componentStyles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
            {/* Education Bot Card */}
            <Card style={{ 
              boxShadow: 'var(--shadow-lg)', 
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            }}>
              <CardContent style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
                <Brain style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: 'var(--secondary-600)', 
                  marginBottom: 'var(--spacing-4)' 
                }} />
                <h3 style={{ 
                  fontSize: 'var(--font-size-xl)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-3)'
                }}>
                  Education Bot
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginBottom: 'var(--spacing-6)',
                  lineHeight: 'var(--line-height-relaxed)'
                }}>
                  Interactive AI tutor providing comprehensive education about diseases, prevention methods, 
                  treatment options, and health management through personalized learning experiences.
                </p>
                <Link to="/education-bot">
                  <Button variant="success" style={{ width: '100%' }}>
                    Start Learning <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Diagnosis Bot Card */}
            <Card style={{ 
              boxShadow: 'var(--shadow-lg)', 
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            }}>
              <CardContent style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
                <Stethoscope style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: 'var(--red-600)', 
                  marginBottom: 'var(--spacing-4)' 
                }} />
                <h3 style={{ 
                  fontSize: 'var(--font-size-xl)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-3)'
                }}>
                  Diagnosis Bot
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginBottom: 'var(--spacing-6)',
                  lineHeight: 'var(--line-height-relaxed)'
                }}>
                  Advanced diagnostic support system providing AI-assisted analysis of symptoms, 
                  differential diagnosis suggestions, and clinical decision support for healthcare professionals.
                </p>
                <Link to="/diagnosis-bot">
                  <Button variant="danger" style={{ width: '100%' }}>
                    Get Diagnosis Support <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-20) 0' }}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-16)' }}>
            <h2 style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-4)'
            }}>
              Comprehensive Healthcare Management
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)', 
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Complete ecosystem supporting all healthcare stakeholders
            </p>
          </div>

          <div className={componentStyles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
              <Users style={{ 
                width: '40px', 
                height: '40px', 
                color: 'var(--primary-600)', 
                marginBottom: 'var(--spacing-4)' 
              }} />
              <h3 style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Multi-Role Support
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                Dedicated portals for patients, doctors, nurses, receptionists, pharmacists, and administrators
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
              <Activity style={{ 
                width: '40px', 
                height: '40px', 
                color: 'var(--primary-600)', 
                marginBottom: 'var(--spacing-4)' 
              }} />
              <h3 style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Real-time Monitoring
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                Live tracking of patient episodes, treatment progress, and healthcare outcomes
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
              <Shield style={{ 
                width: '40px', 
                height: '40px', 
                color: 'var(--primary-600)', 
                marginBottom: 'var(--spacing-4)' 
              }} />
              <h3 style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Secure & Compliant
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                HIPAA-compliant data handling with role-based access control and audit trails
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
              <Clock style={{ 
                width: '40px', 
                height: '40px', 
                color: 'var(--primary-600)', 
                marginBottom: 'var(--spacing-4)' 
              }} />
              <h3 style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-3)'
              }}>
              24/7 Availability
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                Round-the-clock access to diagnostic tools, patient records, and educational resources
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'var(--spacing-20) 0' }}>
        <div className={styles.container}>
          <div style={{ 
            textAlign: 'center', 
            backgroundColor: 'var(--primary-600)', 
            color: 'white',
            padding: 'var(--spacing-16)',
            borderRadius: 'var(--radius-2xl)'
          }}>
            <h2 style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--spacing-4)'
            }}>
              Ready to Transform Healthcare?
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)', 
              opacity: 0.9,
              marginBottom: 'var(--spacing-8)',
              maxWidth: '600px',
              margin: '0 auto var(--spacing-8) auto'
            }}>
              Join thousands of healthcare professionals using MESMTF to improve patient outcomes 
              and streamline medical workflows.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register">
                <Button
                  variant="secondary"
                  style={{
                    padding: 'var(--spacing-4) var(--spacing-8)',
                    backgroundColor: 'white',
                    color: 'var(--primary-600)'
                  }}
                >
                  Get Started Today <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  variant="outline" 
                  style={{ 
                    padding: 'var(--spacing-4) var(--spacing-8)',
                    borderColor: 'white',
                    color: 'white'
                  }}
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--gray-900)', 
        color: 'var(--gray-300)', 
        padding: 'var(--spacing-12) 0' 
      }}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 'var(--font-size-2xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'white',
              marginBottom: 'var(--spacing-4)'
            }}>
              MESMTF
            </div>
            <p style={{ marginBottom: 'var(--spacing-6)' }}>
              Medical Expert System for Malaria & Typhoid Fever
            </p>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-6)', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 'var(--spacing-8)'
            }}>
              <Link to="/about" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>About</Link>
              <Link to="/education-bot" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>Education Bot</Link>
              <Link to="/diagnosis-bot" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>Diagnosis Bot</Link>
              <Link to="/login" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>Register</Link>
            </div>
            <div style={{ 
              borderTop: '1px solid var(--gray-700)', 
              paddingTop: 'var(--spacing-6)',
              fontSize: 'var(--font-size-sm)'
            }}>
              © 2025 MESMTF. All rights reserved. | Medical Expert System for Healthcare Excellence
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
