import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2, Maximize2 } from 'lucide-react';

import API_BASE_URL from '../../config';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m the Sportstores AI assistant. How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [language, setLanguage] = useState('vi');
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const detectLanguage = (text) => {
        const vietnamesePattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/i;
        return vietnamesePattern.test(text) ? 'vi' : 'en';
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        setLanguage(detectLanguage(userMessage.content));

        try {
            const history = messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: history
                })
            });

            if (!response.ok) {
                const err = new Error('Chat service error');
                err.status = response.status;
                throw err;
            }

            const data = await response.json();

            const assistantMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const is404 = error.status === 404;
            const errorMessage = language === 'vi'
                ? (is404
                    ? 'Chat API not found (404). Stop the old backend on port 4000 and run: cd backend && npm start. Open http://localhost:4000/api/chat/health to verify.'
                    : 'Sorry, I\'m having trouble responding. Please try again later.')
                : (is404
                    ? 'Chat API not found (404). Stop the old backend on port 4000 and run: cd backend && npm start. Open http://localhost:4000/api/chat/health to verify.'
                    : 'Sorry, I\'m having trouble responding. Please try again later.');

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const quickReplies = language === 'vi' ? [
        { text: 'Show products', query: 'What products do you have?' },
        { text: 'Return policy', query: 'What is your return policy?' },
        { text: 'Payment methods', query: 'What payment methods do you accept?' },
        { text: 'Shipping', query: 'How long does shipping take?' }
    ] : [
        { text: 'Show products', query: 'What products do you have?' },
        { text: 'Return policy', query: 'What is your return policy?' },
        { text: 'Payment methods', query: 'What payment methods do you accept?' },
        { text: 'Shipping', query: 'How long does shipping take?' }
    ];

    const handleQuickReply = (query) => {
        setInputValue(query);
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            <button
                className="chatbot-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open Chat"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                <span className="chatbot-button-badge">
                    <Sparkles size={14} />
                </span>
            </button>

            {isOpen && (
                <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot size={24} />
                            </div>
                            <div className="chatbot-header-text">
                                <h3>Sportstores AI</h3>
                                <span className="chatbot-status">
                                    <span className="status-dot"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                            >
                                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            <div className="chatbot-messages" ref={chatContainerRef}>
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`chatbot-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
                                    >
                                        <div className="message-avatar">
                                            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                        </div>
                                        <div className="message-content">
                                            <p>{msg.content}</p>
                                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="chatbot-message assistant">
                                        <div className="message-avatar">
                                            <Bot size={18} />
                                        </div>
                                        <div className="message-content typing">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chatbot-quick-replies">
                                {quickReplies.map((reply, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickReply(reply.query)}
                                        className="quick-reply-button"
                                    >
                                        {reply.text}
                                    </button>
                                ))}
                            </div>

                            <div className="chatbot-input-container">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={language === 'vi' ? 'Type a message...' : 'Type a message...'}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isLoading}
                                    aria-label="Send"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatBot;
