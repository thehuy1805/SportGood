import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2 } from 'lucide-react';
import API_BASE_URL from '../../config';
import './GearFinder.css';

const quickQuestions = [
    { id: 1, text: 'I want to start home gym', icon: '🏋️' },
    { id: 2, text: 'Best gear for marathon training', icon: '🏃' },
    { id: 3, text: 'Need outfit for yoga classes', icon: '🧘' },
    { id: 4, text: 'Budget-friendly cardio equipment', icon: '💪' },
];

const GearFinder = ({ products = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hey! I'm your Gear Finder AI. Tell me what you're looking for or choose a quick question below, and I'll recommend the perfect equipment for your needs!",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getAIResponse = async (userMessage) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages
                        .filter(m => m.type === 'user' || m.type === 'bot')
                        .slice(-6)
                        .map(m => ({
                            role: m.type === 'bot' ? 'assistant' : 'user',
                            content: m.text
                        }))
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Gear Finder Error:', error);
            return "I'm having trouble connecting to my AI brain right now. Please make sure the backend server is running!";
        }
    };

    const handleSendMessage = async (message) => {
        if (!message.trim()) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const botResponse = await getAIResponse(message);

        const botMsg = {
            id: Date.now() + 1,
            type: 'bot',
            text: botResponse,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
    };

    const handleQuickQuestion = (question) => {
        handleSendMessage(question.text);
    };

    return (
        <div className={`gear-finder ${isOpen ? 'open' : ''}`}>
            {/* Toggle Button */}
            <button 
                className="gear-finder-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} />}
                {!isOpen && <span className="toggle-label">Gear Finder AI</span>}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="gear-finder-panel">
                    {/* Header */}
                    <div className="panel-header">
                        <div className="header-icon">
                            <Bot size={20} />
                        </div>
                        <div className="header-info">
                            <h3>Gear Finder</h3>
                            <span className="header-status">AI Powered • Powered by Groq</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="panel-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.type}`}>
                                <div className="message-avatar">
                                    {msg.type === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="message-content">
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot">
                                <div className="message-avatar">
                                    <Bot size={16} />
                                </div>
                                <div className="message-content loading">
                                    <Loader2 size={16} className="spinner" />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 2 && (
                        <div className="quick-questions">
                            <span className="quick-label">Quick questions:</span>
                            <div className="quick-btns">
                                {quickQuestions.map((q) => (
                                    <button
                                        key={q.id}
                                        className="quick-btn"
                                        onClick={() => handleQuickQuestion(q)}
                                    >
                                        <span className="quick-icon">{q.icon}</span>
                                        <span>{q.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="panel-input">
                        <input
                            type="text"
                            placeholder="Ask me about equipment..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        />
                        <button 
                            className="send-btn"
                            onClick={() => handleSendMessage(inputValue)}
                            disabled={!inputValue.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GearFinder;
