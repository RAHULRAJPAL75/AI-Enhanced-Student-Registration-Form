import { useState, useRef, useEffect } from "react";

export default function AIChatWidget({ currentUser, totalStudents }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. Ask me anything about your dashboard, sprints, or student records!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Check AI status on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/ai/status")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiStatus(data);
        }
      })
      .catch(err => console.error("Failed to check AI status:", err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: {
            studentName: currentUser?.name,
            totalStudents,
          },
        }),
      });

      const data = await res.json();

      if (data.success && data.response) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            isDemo: data.isDemo,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I couldn't process that. Please try again.",
            isDemo: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please check if the backend server is running.",
          isDemo: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button className="ai-chat-fab" onClick={() => setIsOpen(true)} title="AI Assistant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
        </svg>
        {aiStatus && !aiStatus.aiEnabled && <span className="ai-demo-badge">Demo</span>}
      </button>
    );
  }

  return (
    <div className="ai-chat-widget">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          AI Assistant
          {aiStatus && !aiStatus.aiEnabled && <span className="ai-demo-tag">Demo Mode</span>}
        </div>
        <button className="ai-chat-close" onClick={() => setIsOpen(false)} title="Close">
          x
        </button>
      </div>

      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-chat-message ai-chat-${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="ai-message-avatar">AI</div>
            )}
            <div className="ai-message-bubble">
              {msg.content}
              {msg.isDemo && (
                <div className="ai-demo-hint">
                  Add GROQ_API_KEY to backend/.env for full AI features.
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="ai-message-avatar ai-message-avatar-user">
                {(currentUser?.name || "You").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="ai-chat-message ai-chat-assistant">
            <div className="ai-message-avatar">AI</div>
            <div className="ai-message-bubble ai-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input-wrap">
        <input
          className="ai-chat-input"
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button
          className="ai-chat-send"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          title="Send"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      {aiStatus && !aiStatus.aiEnabled && (
        <div className="ai-status-bar">
          Running in demo mode - responses are simulated
        </div>
      )}
    </div>
  );
}
