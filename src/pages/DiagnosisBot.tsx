import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../contexts/AuthContext'
import { diagnosisService, DiagnosisResponse } from '../services/diagnosisService'
import {
  Stethoscope,
  Send,
  ArrowLeft,
  User,
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Activity
} from 'lucide-react'
import styles from '../styles/layout.module.css'

interface Message {
  id: string
  type: 'user' | 'bot' | 'system'
  content: string
  timestamp: Date
  diagnosisResults?: DiagnosisResponse
}

const COMMON_SYMPTOMS = [
  'Fever', 'Headache', 'Nausea', 'Vomiting', 'Abdominal Pain', 
  'Diarrhea', 'Fatigue', 'Muscle Aches', 'Chills', 'Cough',
  'Sore Throat', 'Shortness of Breath', 'Chest Pain', 'Rash'
]

const DiagnosisBot: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI Diagnostic Assistant. I can help analyze symptoms and provide preliminary health assessments.\n\n⚠️ **Important:** This is a support tool for healthcare professionals and educational purposes only. Always seek professional medical care for health concerns.\n\nPlease describe your symptoms or select from common symptoms below.",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  const handleAnalyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0 && !inputMessage.trim()) return

    const symptomsToAnalyze = selectedSymptoms.length > 0 
      ? selectedSymptoms 
      : inputMessage.split(',').map(s => s.trim()).filter(s => s)

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `Symptoms: ${symptomsToAnalyze.join(', ')}`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setSelectedSymptoms([])
    setIsAnalyzing(true)

    try {
      const analysisResult = await diagnosisService.analyzeSymptoms(symptomsToAnalyze)
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I've analyzed your symptoms. Here are the preliminary results:",
        timestamp: new Date(),
        diagnosisResults: analysisResult
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: "I'm sorry, there was an error analyzing your symptoms. Please try again or consult with a healthcare professional.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    
    // Extract symptoms from the message and analyze
    const symptomsInMessage = inputMessage.split(',').map(s => s.trim()).filter(s => s)
    setInputMessage('')
    setIsAnalyzing(true)

    try {
      const analysisResult = await diagnosisService.analyzeSymptoms(symptomsInMessage)
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Based on your description, here's my analysis:",
        timestamp: new Date(),
        diagnosisResults: analysisResult
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: "I couldn't analyze those symptoms. Please try describing them more clearly or select from the common symptoms.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'var(--red-600)'
      case 'high': return 'var(--orange-600)'
      case 'medium': return 'var(--yellow-600)'
      case 'low': return 'var(--green-600)'
      default: return 'var(--gray-600)'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle style={{ width: '16px', height: '16px' }} />
      case 'high': return <AlertTriangle style={{ width: '16px', height: '16px' }} />
      case 'medium': return <Clock style={{ width: '16px', height: '16px' }} />
      case 'low': return <CheckCircle style={{ width: '16px', height: '16px' }} />
      default: return <Activity style={{ width: '16px', height: '16px' }} />
    }
  }

  const renderDiagnosisResults = (results: DiagnosisResponse) => (
    <div style={{ marginTop: 'var(--spacing-4)' }}>
      {results.results.length === 0 ? (
        <div style={{ 
          padding: 'var(--spacing-4)', 
          backgroundColor: 'var(--gray-50)', 
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <p>No specific conditions matched your symptoms. Please consult with a healthcare professional for proper evaluation.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
          {results.results.map((result, index) => (
            <Card key={index} style={{ border: `2px solid ${getUrgencyColor(result.condition.urgency)}` }}>
              <CardContent style={{ padding: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                  <h4 style={{ 
                    fontSize: 'var(--font-size-lg)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    color: getUrgencyColor(result.condition.urgency)
                  }}>
                    {result.condition.name}
                  </h4>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                    <Badge 
                      variant={result.confidence > 70 ? 'success' : result.confidence > 40 ? 'warning' : 'secondary'}
                    >
                      {result.confidence}% match
                    </Badge>
                    <Badge 
                      variant={
                        result.condition.urgency === 'critical' ? 'danger' :
                        result.condition.urgency === 'high' ? 'warning' :
                        result.condition.urgency === 'medium' ? 'info' : 'success'
                      }
                    >
                      {getUrgencyIcon(result.condition.urgency)}
                      {result.condition.urgency}
                    </Badge>
                  </div>
                </div>

                <p style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--spacing-3)'
                }}>
                  {result.condition.description}
                </p>

                <div style={{ marginBottom: 'var(--spacing-3)' }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Matched Symptoms:
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-1)', flexWrap: 'wrap' }}>
                    {result.matchedSymptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary">
                        {symptom.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-3)' }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Recommendations:
                  </div>
                  <ul style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--text-secondary)',
                    paddingLeft: 'var(--spacing-4)',
                    margin: 0
                  }}>
                    {result.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: 'var(--spacing-1)' }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ 
        marginTop: 'var(--spacing-4)',
        padding: 'var(--spacing-3)',
        backgroundColor: 'var(--red-50)',
        border: '1px solid var(--red-200)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--red-700)',
        whiteSpace: 'pre-line'
      }}>
        {results.disclaimer}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Header
        title="🩺 Diagnosis Bot"
        subtitle="AI-Powered Symptom Analysis"
        userInfo={user?.name}
        userRole={user?.role?.toLowerCase()}
        showBackButton={true}
        showHomeButton={true}
      />

      <main style={{ padding: 'var(--spacing-6) 0' }}>
        <div className={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-6)' }}>
            {/* Sidebar - Symptom Selector */}
            <div>
              <Card>
                <CardContent style={{ padding: 'var(--spacing-6)' }}>
                  <h3 style={{ 
                    fontSize: 'var(--font-size-lg)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--spacing-4)'
                  }}>
                    Common Symptoms
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                    {COMMON_SYMPTOMS.map((symptom) => (
                      <Button
                        key={symptom}
                        variant={selectedSymptoms.includes(symptom) ? 'primary' : 'outline'}
                        onClick={() => handleSymptomToggle(symptom)}
                        style={{ 
                          justifyContent: 'flex-start',
                          padding: 'var(--spacing-2) var(--spacing-3)',
                          fontSize: 'var(--font-size-sm)'
                        }}
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                  
                  {selectedSymptoms.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-4)' }}>
                      <Button
                        onClick={handleAnalyzeSymptoms}
                        disabled={isAnalyzing}
                        variant="danger"
                        style={{ width: '100%' }}
                      >
                        <Brain style={{ width: '16px', height: '16px' }} />
                        {isAnalyzing ? 'Analyzing...' : `Analyze ${selectedSymptoms.length} Symptoms`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card style={{ marginTop: 'var(--spacing-4)' }}>
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <h4 style={{ 
                    fontSize: 'var(--font-size-md)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--spacing-3)'
                  }}>
                    🩺 How it works
                  </h4>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <p style={{ marginBottom: 'var(--spacing-2)' }}>
                      1. Select symptoms or describe them in text
                    </p>
                    <p style={{ marginBottom: 'var(--spacing-2)' }}>
                      2. AI analyzes symptom patterns
                    </p>
                    <p>
                      3. Get preliminary assessment with recommendations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <Card style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Messages */}
              <div style={{ 
                flex: 1, 
                padding: 'var(--spacing-4)', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-4)'
              }}>
                {messages.map((message) => (
                  <div key={message.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                        gap: 'var(--spacing-2)'
                      }}
                    >
                      {message.type !== 'user' && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: message.type === 'system' ? 'var(--gray-100)' : 'var(--red-100)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {message.type === 'system' ? (
                            <AlertTriangle style={{ width: '16px', height: '16px', color: 'var(--gray-600)' }} />
                          ) : (
                            <Bot style={{ width: '16px', height: '16px', color: 'var(--red-600)' }} />
                          )}
                        </div>
                      )}
                      
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: 'var(--spacing-3) var(--spacing-4)',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 
                            message.type === 'user' ? 'var(--primary-600)' :
                            message.type === 'system' ? 'var(--gray-100)' : 'var(--bg-secondary)',
                          color: message.type === 'user' ? 'white' : 'var(--text-primary)',
                          whiteSpace: 'pre-line',
                          lineHeight: 'var(--line-height-relaxed)'
                        }}
                      >
                        {message.content}
                      </div>

                      {message.type === 'user' && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-100)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <User style={{ width: '16px', height: '16px', color: 'var(--primary-600)' }} />
                        </div>
                      )}
                    </div>

                    {/* Render diagnosis results if present */}
                    {message.diagnosisResults && renderDiagnosisResults(message.diagnosisResults)}
                  </div>
                ))}

                {isAnalyzing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--red-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Bot style={{ width: '16px', height: '16px', color: 'var(--red-600)' }} />
                    </div>
                    <div style={{
                      padding: 'var(--spacing-3) var(--spacing-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      Analyzing symptoms...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ 
                padding: 'var(--spacing-4)', 
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: 'var(--spacing-2)'
              }}>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms (e.g., fever, headache, nausea)..."
                  disabled={isAnalyzing}
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isAnalyzing}
                  variant="danger"
                >
                  <Send style={{ width: '16px', height: '16px' }} />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Critical Disclaimer */}
      <div style={{ 
        backgroundColor: 'var(--red-50)', 
        borderTop: '2px solid var(--red-200)',
        padding: 'var(--spacing-6)'
      }}>
        <div className={styles.container}>
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--red-800)',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
              <AlertTriangle style={{ width: '20px', height: '20px' }} />
              <strong>MEDICAL DISCLAIMER</strong>
            </div>
            <p>
              This diagnostic tool is for educational and informational purposes only. It is NOT a substitute for professional medical advice, 
              diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions regarding medical conditions. 
              In case of emergency, contact emergency services immediately.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default DiagnosisBot
