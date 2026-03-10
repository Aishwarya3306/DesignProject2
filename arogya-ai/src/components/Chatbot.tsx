'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Chatbot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your ArogyaAI health assistant. Please describe your symptoms, and I can suggest possible causes and lifestyle advice. Remember, I am an AI and this is not a medical diagnosis. Please consult a healthcare professional for proper medical advice.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Connect to the new FastAPI backend endpoint
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg.content, language }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to connect to the AI server.');
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Sorry, I am having trouble connecting to the server. Please try again later.\n\nDisclaimer:\nThis is not a medical diagnosis. Please consult a healthcare professional for proper medical advice.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--zen-sage), #4a7050)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(124, 154, 126, 0.4)',
          cursor: 'pointer',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          zIndex: 9999,
          transition: 'transform 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        🩺
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '380px',
            height: '600px',
            maxHeight: '80vh',
            background: 'var(--zen-warm)',
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 10000,
            border: '1px solid var(--zen-sand)',
          }}
          className="fade-in"
        >
          {/* Header */}
          <div
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, var(--zen-sage), #4a7050)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🌿</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>ArogyaAI Assistant</h3>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Medical Support</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '4px',
                opacity: 0.8,
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '1')}
              onMouseOut={e => (e.currentTarget.style.opacity = '0.8')}
            >
              ×
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    background: msg.role === 'user' ? 'var(--zen-sage)' : 'white',
                    color: msg.role === 'user' ? 'white' : 'var(--zen-dark)',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--zen-muted)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', margin: '0 4px' }}>
                  {msg.role === 'user' ? 'You' : 'ArogyaAI'}
                </span>
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', background: 'white', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <span className="dot-typing" style={{ animationDelay: '0s' }}>•</span>
                <span className="dot-typing" style={{ animationDelay: '0.2s' }}>•</span>
                <span className="dot-typing" style={{ animationDelay: '0.4s' }}>•</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '16px',
              background: 'white',
              borderTop: '1px solid var(--zen-sand)',
              display: 'flex',
              gap: '12px',
              alignItems: 'end',
            }}
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your symptoms here..."
              style={{
                flex: 1,
                border: '1px solid var(--zen-sand)',
                borderRadius: '20px',
                padding: '12px 16px',
                fontSize: '14px',
                resize: 'none',
                height: '44px',
                maxHeight: '120px',
                fontFamily: 'inherit',
                outline: 'none',
                background: 'var(--zen-warm)',
                color: 'var(--zen-dark)',
              }}
              // Auto-expand height functionality
              onInput={e => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '44px';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: inputValue.trim() && !isLoading ? 'var(--zen-sage)' : 'var(--zen-sand)',
                color: 'white',
                border: 'none',
                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes typing {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
        .dot-typing {
          animation: typing 1s infinite;
          color: var(--zen-sage);
        }
      `}</style>
    </>
  );
}
