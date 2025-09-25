import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { 
  ArrowLeft, 
  Target, 
  Users, 
  Globe, 
  Award,
  CheckCircle,
  Heart,
  Shield,
  Zap
} from 'lucide-react'
import styles from '../styles/layout.module.css'

const AboutPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerBrand}>
            <div className={styles.headerTitle}>MESMTF</div>
            <div className={styles.headerSubtitle}>About Us</div>
          </div>
          <div className={styles.headerActions}>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back to Home
              </Button>
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
      <section style={{ padding: 'var(--spacing-20) 0', backgroundColor: 'var(--primary-50)' }}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ 
              fontSize: 'var(--font-size-4xl)', 
              fontWeight: 'var(--font-weight-bold)', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-6)'
            }}>
              About MESMTF
            </h1>
            <p style={{ 
              fontSize: 'var(--font-size-xl)', 
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-height-relaxed)'
            }}>
              Medical Expert System for Malaria & Typhoid Fever is a comprehensive healthcare 
              management platform designed to revolutionize medical care delivery through 
              advanced AI-powered tools and seamless workflow integration.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: 'var(--spacing-20) 0' }}>
        <div className={styles.container}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 'var(--spacing-8)'
          }}>
            <Card style={{ boxShadow: 'var(--shadow-lg)' }}>
              <CardContent style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
                <Target style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: 'var(--primary-600)',
                  marginBottom: 'var(--spacing-4)'
                }} />
                <h2 style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--spacing-4)'
                }}>
                  Our Mission
                </h2>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--line-height-relaxed)'
                }}>
                  To provide healthcare professionals and patients with intelligent, 
                  accessible, and comprehensive medical tools that improve diagnosis accuracy, 
                  streamline treatment workflows, and enhance patient outcomes in the fight 
                  against infectious diseases.
                </p>
              </CardContent>
            </Card>

            <Card style={{ boxShadow: 'var(--shadow-lg)' }}>
              <CardContent style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
                <Globe style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: 'var(--secondary-600)',
                  marginBottom: 'var(--spacing-4)'
                }} />
                <h2 style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--spacing-4)'
                }}>
                  Our Vision
                </h2>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--line-height-relaxed)'
                }}>
                  To become the leading global platform for infectious disease management, 
                  empowering healthcare systems worldwide with AI-driven insights and 
                  fostering a collaborative ecosystem that bridges the gap between 
                  medical expertise and patient care.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section style={{ padding: 'var(--spacing-20) 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-16)' }}>
            <h2 style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-4)'
            }}>
              What Makes MESMTF Special
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)', 
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Comprehensive features designed for modern healthcare delivery
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-6)'
          }}>
            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
              <Zap style={{ 
                width: '40px', 
                height: '40px', 
                color: 'var(--yellow-600)',
                marginBottom: 'var(--spacing-4)'
              }} />
              <h3 style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-3)'
              }}>
                AI-Powered Diagnosis
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-height-relaxed)'
              }}>
                Advanced machine learning algorithms provide intelligent diagnostic support 
                with high accuracy rates for malaria and typhoid fever detection.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
              <Users style={{ 
                width: '40px', 
                height: '40px', 
                color: 'var(--blue-600)',
                marginBottom: 'var(--spacing-4)'
              }} />
              <h3 style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Multi-Role Platform
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-height-relaxed)'
              }}>
                Tailored interfaces for patients, doctors, nurses, receptionists, 
                and pharmacists, ensuring optimal workflow for each healthcare role.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
              <Heart style={{ 
                width: '40px', 
                height: '40px', 
                color: 'var(--red-600)',
                marginBottom: 'var(--spacing-4)'
              }} />
              <h3 style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Patient-Centered Care
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-height-relaxed)'
              }}>
                Comprehensive patient portals with medical history, appointment scheduling, 
                and educational resources for better health outcomes.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
              <Shield style={{ 
                width: '40px', 
                height: '40px', 
                color: 'var(--green-600)',
                marginBottom: 'var(--spacing-4)'
              }} />
              <h3 style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Secure & Compliant
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-height-relaxed)'
              }}>
                Enterprise-grade security with HIPAA compliance, role-based access control, 
                and comprehensive audit trails for data protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section style={{ padding: 'var(--spacing-20) 0' }}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-16)' }}>
            <h2 style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-4)'
            }}>
              Our Impact
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)', 
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Making a difference in healthcare delivery worldwide
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-8)'
          }}>
            <Card style={{ textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--primary-600)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  95%
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-lg)', 
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Diagnostic Accuracy
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  AI-powered diagnosis with clinical validation
                </p>
              </CardContent>
            </Card>

            <Card style={{ textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--secondary-600)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  50%
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-lg)', 
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Faster Diagnosis
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Reduced time from symptoms to treatment
                </p>
              </CardContent>
            </Card>

            <Card style={{ textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--green-600)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  30%
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-lg)', 
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Better Outcomes
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Improved patient recovery rates
                </p>
              </CardContent>
            </Card>

            <Card style={{ textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--red-600)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  24/7
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-lg)', 
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Availability
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Round-the-clock healthcare support
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section style={{ padding: 'var(--spacing-20) 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-16)' }}>
            <h2 style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-4)'
            }}>
              Built with Modern Technology
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)', 
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Leveraging cutting-edge technologies for reliable, scalable healthcare solutions
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-6)',
            textAlign: 'center'
          }}>
            {[
              'React & TypeScript',
              'AI/Machine Learning',
              'Cloud Infrastructure',
              'Real-time Analytics',
              'Mobile Responsive',
              'API Integration'
            ].map((tech, index) => (
              <div key={index} style={{ padding: 'var(--spacing-4)' }}>
                <CheckCircle style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: 'var(--green-600)',
                  marginBottom: 'var(--spacing-2)'
                }} />
                <div style={{ 
                  fontSize: 'var(--font-size-md)', 
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  {tech}
                </div>
              </div>
            ))}
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
              Join the Healthcare Revolution
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-lg)', 
              opacity: 0.9,
              marginBottom: 'var(--spacing-8)',
              maxWidth: '600px',
              margin: '0 auto var(--spacing-8) auto'
            }}>
              Experience the future of medical care with MESMTF's comprehensive 
              healthcare management platform.
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
                  Get Started Today
                </Button>
              </Link>
              <Link to="/diagnosis-bot">
                <Button 
                  variant="outline" 
                  style={{ 
                    padding: 'var(--spacing-4) var(--spacing-8)',
                    borderColor: 'white',
                    color: 'white'
                  }}
                >
                  Try Diagnosis Bot
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
            <p>© 2025 MESMTF. All rights reserved. | Medical Expert System for Healthcare Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AboutPage
