import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User } from 'lucide-react';
import type { Product } from '../types/Product';
import { aiApi } from '../api/aiApi';

interface AIAgentProps {
  products: Product[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const AIAgent = ({ products }: AIAgentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi! I'm your AI Agent. I'm connected to your Spring Boot Backend Grok AI. What would you like to know about your inventory?"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
    
    setIsTyping(true);
    
    try {
      // Build an embedded prompt containing inventory context + user's question
      const contextSummary = `Here is my current inventory data for context: ${products.length} total items. Value: $${products.reduce((a,b)=>a+(b.price*b.quantity),0)}. User question: `;
      const fullQuestion = contextSummary + userMsg;
      
      const aiResponse = await aiApi.ask(fullQuestion);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponse }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: "Sorry, the backend Spring Boot app refused the connection or the xAI call failed inside the backend." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="btn-ai"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 999,
          padding: 0,
          cursor: 'pointer',
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          opacity: isOpen ? 0 : 1,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={() => setIsOpen(true)}
      >
        <Bot size={28} color="white" />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-surface)' }} />
      </button>

      {/* Chat Window */}
      <div 
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '380px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg), 0 0 30px rgba(139, 92, 246, 0.2)',
          zIndex: 1000,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          borderRadius: '16px',
          border: '1px solid var(--border-focus)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ai-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Spring AI Agent</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                Online & Synced
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', WebkitOverflowScrolling: 'touch' }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                maxWidth: '85%'
              }}
            >
              <div style={{ 
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: msg.sender === 'user' ? 'var(--text-secondary)' : 'var(--ai-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.sender === 'user' ? <User size={16} color="var(--bg-dark)" /> : <Sparkles size={16} color="white" />}
              </div>
              <div style={{ 
                background: msg.sender === 'user' ? 'var(--border-focus)' : 'rgba(139, 92, 246, 0.15)',
                color: 'var(--text-secondary)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                borderTopRightRadius: msg.sender === 'user' ? '0' : '12px',
                borderTopLeftRadius: msg.sender === 'ai' ? '0' : '12px',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {renderMessageText(msg.text)}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--ai-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="white" />
              </div>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.75rem 1rem', borderRadius: '12px', borderTopLeftRadius: '0', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ai-primary)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ai-primary)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ai-primary)', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`}</style>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-dark)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your inventory..."
              className="form-control"
              style={{ border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', flex: 1 }}
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isTyping || !inputValue.trim()}
              style={{ width: 44, height: 44, padding: 0, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
