import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../contexts/AuthContext'
import {
  Brain,
  Send,
  ArrowLeft,
  User,
  Bot,
  BookOpen,
  Lightbulb,
  Heart,
  Shield
} from 'lucide-react'
import styles from '../styles/layout.module.css'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  topic?: string
}

const EDUCATION_TOPICS = [
  { id: 'malaria', name: 'Malaria', icon: <Shield />, description: 'Learn about malaria prevention, symptoms, and treatment' },
  { id: 'typhoid', name: 'Typhoid Fever', icon: <Heart />, description: 'Understanding typhoid fever causes, symptoms, and management' },
  { id: 'prevention', name: 'Disease Prevention', icon: <Shield />, description: 'General health practices and disease prevention strategies' },
  { id: 'nutrition', name: 'Nutrition & Health', icon: <Heart />, description: 'Healthy eating habits and nutritional guidance' },
  { id: 'hygiene', name: 'Personal Hygiene', icon: <BookOpen />, description: 'Best practices for personal and environmental hygiene' },
  { id: 'medication', name: 'Medication Safety', icon: <Lightbulb />, description: 'Safe medication use and adherence guidelines' }
]

const SAMPLE_RESPONSES = {
  malaria: {
    symptoms: "Malaria symptoms typically include:\n\n• High fever (often cyclical)\n• Severe chills and sweating\n• Headache and body aches\n• Nausea and vomiting\n• Fatigue and weakness\n• Abdominal pain\n\nSymptoms usually appear 10-15 days after being bitten by an infected mosquito. If you experience these symptoms, especially after traveling to a malaria-endemic area, seek medical attention immediately.",
    prevention: "Malaria prevention strategies include:\n\n🦟 **Vector Control:**\n• Use insecticide-treated bed nets\n• Apply mosquito repellent (DEET-based)\n• Wear long-sleeved clothing at dusk/dawn\n• Use indoor residual spraying\n\n💊 **Chemoprevention:**\n• Take antimalarial prophylaxis when traveling\n• Follow prescribed dosing schedules\n\n🏠 **Environmental Management:**\n• Eliminate standing water around homes\n• Keep windows and doors screened\n• Use air conditioning when available",
    treatment: "Malaria treatment depends on the type and severity:\n\n**Uncomplicated Malaria:**\n• Artemisinin-based Combination Therapy (ACT)\n• Complete the full course as prescribed\n• Monitor for treatment response\n\n**Severe Malaria:**\n• Immediate hospitalization required\n• Intravenous artesunate\n• Supportive care for complications\n\n⚠️ **Important:** Never self-medicate. Always seek professional medical care for suspected malaria."
  },
  typhoid: {
    symptoms: "Typhoid fever symptoms develop gradually:\n\n**Week 1:**\n• Sustained high fever (39-40°C)\n• Headache and malaise\n• Abdominal pain\n• Loss of appetite\n\n**Week 2-3:**\n• Rose-colored spots on chest/abdomen\n• Enlarged spleen\n• Diarrhea or constipation\n• Delirium in severe cases\n\nSeek immediate medical attention if you suspect typhoid fever.",
    prevention: "Typhoid prevention focuses on hygiene:\n\n🧼 **Personal Hygiene:**\n• Wash hands frequently with soap\n• Use alcohol-based sanitizer\n• Avoid touching face with unwashed hands\n\n🥤 **Food & Water Safety:**\n• Drink only bottled or boiled water\n• Avoid ice cubes and raw vegetables\n• Eat thoroughly cooked, hot food\n• Avoid street food and unpasteurized dairy\n\n💉 **Vaccination:**\n• Get typhoid vaccine before travel\n• Follow booster schedule as recommended",
    treatment: "Typhoid treatment requires antibiotics:\n\n**First-line Treatment:**\n• Ciprofloxacin or Azithromycin\n• Complete full antibiotic course\n• Maintain hydration and nutrition\n\n**Complications Management:**\n• Monitor for intestinal bleeding\n• Watch for perforation signs\n• Supportive care for severe cases\n\n⚠️ **Critical:** Early treatment prevents complications. Never delay seeking medical care."
  }
}

const EducationBot: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your Health Education Assistant. I'm here to help you learn about diseases, prevention strategies, and healthy living practices. What would you like to learn about today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    // Malaria-related responses
    if (message.includes('malaria')) {
      if (message.includes('symptom')) return SAMPLE_RESPONSES.malaria.symptoms
      if (message.includes('prevent') || message.includes('avoid')) return SAMPLE_RESPONSES.malaria.prevention
      if (message.includes('treat') || message.includes('cure')) return SAMPLE_RESPONSES.malaria.treatment
      return "Malaria is a serious mosquito-borne disease. I can help you learn about malaria symptoms, prevention, or treatment. What specific aspect would you like to know about?"
    }
    
    // Typhoid-related responses
    if (message.includes('typhoid')) {
      if (message.includes('symptom')) return SAMPLE_RESPONSES.typhoid.symptoms
      if (message.includes('prevent') || message.includes('avoid')) return SAMPLE_RESPONSES.typhoid.prevention
      if (message.includes('treat') || message.includes('cure')) return SAMPLE_RESPONSES.typhoid.treatment
      return "Typhoid fever is a bacterial infection spread through contaminated food and water. I can explain symptoms, prevention, or treatment. What would you like to learn?"
    }
    
    // General health topics
    if (message.includes('prevent') || message.includes('avoid')) {
      return "Disease prevention is key to staying healthy! Here are some general principles:\n\n🧼 **Hygiene:** Regular handwashing, clean environment\n🥗 **Nutrition:** Balanced diet, safe food practices\n💧 **Hydration:** Clean, safe drinking water\n🏃 **Exercise:** Regular physical activity\n😴 **Rest:** Adequate sleep and stress management\n💉 **Vaccination:** Stay up-to-date with immunizations\n\nWhich area would you like to explore in more detail?"
    }
    
    if (message.includes('symptom')) {
      return "I can help you understand symptoms of various conditions. Are you asking about:\n\n• Malaria symptoms\n• Typhoid fever symptoms\n• General warning signs to watch for\n• When to seek medical care\n\nPlease let me know which specific condition interests you!"
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm excited to help you learn about health and wellness. I can provide information about:\n\n• Disease prevention and symptoms\n• Healthy lifestyle practices\n• Medication safety\n• Nutrition and hygiene\n\nWhat health topic interests you most today?"
    }
    
    // Default response
    return "That's an interesting question! I specialize in health education covering topics like:\n\n• Malaria and typhoid fever\n• Disease prevention strategies\n• Healthy lifestyle practices\n• Medication safety\n• Nutrition and hygiene\n\nCould you rephrase your question or choose one of these topics to explore?"
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
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(inputMessage),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleTopicClick = (topic: typeof EDUCATION_TOPICS[0]) => {
    const topicMessage = `Tell me about ${topic.name.toLowerCase()}`
    setInputMessage(topicMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Header
        title="🧠 Education Bot"
        subtitle="Your Health Learning Assistant"
        userInfo={user?.name}
        userRole={user?.role?.toLowerCase()}
        showBackButton={true}
        showHomeButton={true}
      />

      <main style={{ padding: 'var(--spacing-6) 0' }}>
        <div className={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-6)' }}>
            {/* Sidebar - Topics */}
            <div>
              <Card>
                <CardContent style={{ padding: 'var(--spacing-6)' }}>
                  <h3 style={{ 
                    fontSize: 'var(--font-size-lg)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--spacing-4)'
                  }}>
                    Learning Topics
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
                    {EDUCATION_TOPICS.map((topic) => (
                      <Button
                        key={topic.id}
                        variant="outline"
                        onClick={() => handleTopicClick(topic)}
                        style={{ 
                          justifyContent: 'flex-start',
                          padding: 'var(--spacing-3)',
                          height: 'auto',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                          {topic.icon}
                          <div>
                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              {topic.name}
                            </div>
                            <div style={{ 
                              fontSize: 'var(--font-size-xs)', 
                              color: 'var(--text-secondary)',
                              marginTop: 'var(--spacing-1)'
                            }}>
                              {topic.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card style={{ marginTop: 'var(--spacing-4)' }}>
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <h4 style={{ 
                    fontSize: 'var(--font-size-md)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--spacing-3)'
                  }}>
                    💡 Quick Tips
                  </h4>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <p style={{ marginBottom: 'var(--spacing-2)' }}>
                      Ask specific questions like "How to prevent malaria?" or "What are typhoid symptoms?"
                    </p>
                    <p>
                      I provide evidence-based health information for educational purposes only.
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
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start',
                      gap: 'var(--spacing-2)'
                    }}
                  >
                    {message.type === 'bot' && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--secondary-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Bot style={{ width: '16px', height: '16px', color: 'var(--secondary-600)' }} />
                      </div>
                    )}
                    
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: 'var(--spacing-3) var(--spacing-4)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: message.type === 'user' ? 'var(--primary-600)' : 'var(--bg-secondary)',
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
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--secondary-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Bot style={{ width: '16px', height: '16px', color: 'var(--secondary-600)' }} />
                    </div>
                    <div style={{
                      padding: 'var(--spacing-3) var(--spacing-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      Thinking...
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
                  placeholder="Ask me about health topics..."
                  disabled={isTyping}
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  variant="primary"
                >
                  <Send style={{ width: '16px', height: '16px' }} />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Disclaimer */}
      <div style={{ 
        backgroundColor: 'var(--yellow-50)', 
        borderTop: '1px solid var(--yellow-200)',
        padding: 'var(--spacing-4)'
      }}>
        <div className={styles.container}>
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--yellow-800)',
            textAlign: 'center'
          }}>
            ⚠️ <strong>Educational Purpose Only:</strong> This information is for educational purposes and should not replace professional medical advice. 
            Always consult healthcare providers for medical concerns.
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default EducationBot
