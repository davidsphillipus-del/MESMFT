import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatProps {
  mode: 'diagnosis' | 'education'
  title?: string
}

const AIChat: React.FC<AIChatProps> = ({ mode, title }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: mode === 'diagnosis'
        ? `Hello! I'm Dr. MESMTF, your friendly medical AI assistant! 🩺

I specialize in helping with TYPHOID FEVER and THYROID DISEASE diagnosis and treatment. I'm here to chat with you just like ChatGPT, but focused on these specific medical conditions.

Feel free to:
- Describe any symptoms you're experiencing
- Ask questions about these conditions
- Discuss treatment options
- Get information about prevention

What's on your mind today? How can I help you? 😊

⚠️ Remember: I provide medical information for educational purposes. Always consult healthcare professionals for proper medical care.`
        : `Hello! I'm Professor MESMTF, your friendly medical education AI! 📚

I'm here to teach you about TYPHOID FEVER and THYROID DISEASE in a conversational way, just like chatting with ChatGPT!

I can help you learn about:
- 🦠 Typhoid Fever: symptoms, causes, prevention, treatment
- 🦋 Thyroid Disease: hypothyroidism, hyperthyroidism, diagnosis, management
- 📖 Medical concepts explained in simple terms
- 🎯 Practical healthcare knowledge

What would you like to explore today? Ask me anything about these conditions! 🤔

📖 This is for EDUCATIONAL PURPOSES ONLY - always consult healthcare professionals for medical advice.`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [mode])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const endpoint = mode === 'diagnosis' ? '/api/v1/ai/diagnosis' : '/api/v1/ai/education'
      const payload = {
        message: inputMessage.trim(),
        userRole: user?.role || 'Patient',
        messages: messages.filter(m => m.id !== 'welcome' && m.id !== 'welcome-new').map(m => ({
          role: m.role,
          content: m.content
        }))
      }

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.message || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('AI Chat Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mode === 'diagnosis'
          ? 'I apologize, Dr. MESMTF is having some technical difficulties right now. Please try again in a moment, or consult with a healthcare professional if you need immediate medical attention. 🩺'
          : 'I apologize, Professor MESMTF is experiencing some technical issues right now. Please try again in a moment! 📚',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    // Re-add welcome message
    const welcomeMessage: Message = {
      id: 'welcome-new',
      role: 'assistant',
      content: mode === 'diagnosis'
        ? `Hi again! I'm Dr. MESMTF. 🩺 Ready for a fresh conversation about Typhoid Fever or Thyroid Disease? What's on your mind?`
        : `Hello again! I'm Professor MESMTF. 📚 Ready to learn something new about Typhoid Fever or Thyroid Disease? What would you like to explore?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {title || (mode === 'diagnosis' ? '🩺 Dr. MESMTF - AI Diagnosis Chat' : '📚 Professor MESMTF - AI Education Chat')}
          </h3>
          <p className="text-sm text-gray-600">
            {mode === 'diagnosis'
              ? 'Chat naturally about Typhoid Fever & Thyroid Disease diagnosis'
              : 'Learn about Typhoid Fever & Thyroid Disease through conversation'
            }
          </p>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-gray-600">
                  {mode === 'diagnosis' ? 'Dr. MESMTF is thinking...' : 'Professor MESMTF is thinking...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              mode === 'diagnosis'
                ? 'Chat with Dr. MESMTF about your symptoms or medical questions...'
                : 'Chat with Professor MESMTF about typhoid fever, thyroid disease, or ask any questions...'
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-2 text-xs text-gray-500">
          {mode === 'diagnosis' 
            ? '⚠️ This AI analysis is for informational purposes only. Always consult healthcare professionals for proper diagnosis and treatment.'
            : '📖 This content is for educational purposes only. Consult healthcare professionals for medical advice.'
          }
        </div>
      </div>
    </div>
  )
}

export default AIChat
