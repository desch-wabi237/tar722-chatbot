import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Définitions et Constantes Globales ---
const PROMO_CODE = "TAR72";
const BOT_NAME = "TAR72-Bot";

// Liens affiliés et sociaux
const AFFILIATE_LINK = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";
const MELBET_LINK = "https://melbet.com";

// La route que le client va appeler (cette route sera gérée par la fonction Serverless)
const API_ROUTE = "/api/chat"; 

// --- LOGIQUE D'INTÉGRATION GEMINI (Via Proxy Serverless) ---
const getAiResponse = async (userQuery, maxRetries = 5) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(API_ROUTE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery }) 
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Erreur Serverless: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();
            
            if (text) {
                return text;
            } else {
                throw new Error("Réponse de l'API vide ou mal formée.");
            }

        } catch (error) {
            console.error("Tentative API échouée:", error);
            if (attempt === maxRetries - 1) {
                return `🚨 Erreur de connexion au service IA : ${error.message}. Si vous êtes en local, assurez-vous que votre fonction Serverless (\`/api/chat.js\`) est lancée. Code promo : **${PROMO_CODE}**.`;
            }
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return `🚨 Erreur interne. Le service IA est temporairement indisponible. Code promo : **${PROMO_CODE}**.`;
};

// --- Composant Principal de l'Application ---
const App = () => {
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: `Bonjour ! Je suis ${BOT_NAME}, votre assistant personnel pour les meilleurs bonus. Mon objectif est simple : vous assurer le **BONUS MAXIMAL** sur 1xBet et Melbet grâce au code **${PROMO_CODE}**. Que puis-je faire pour vous aujourd'hui ?`, 
            sender: 'bot', 
            isTyping: false 
        }
    ]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const formatMessageText = useCallback((text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let parts = text.split(urlRegex);
        const regexBold = /\*\*(.*?)\*\*/g;

        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                const url = part.trim();
                let display = url.length > 50 ? url.substring(0, 50) + '...' : url;
                
                if (url.includes('1xbet') || url.includes('refpa58144')) {
                    display = "🎰 1xBet - Inscription avec Bonus Max 🚀";
                } else if (url.includes('melbet')) {
                    display = "🎲 MelBet - Plateforme de Paris Sportifs 🏆";
                } else if (url.includes('whatsapp')) {
                    display = "💬 Rejoindre notre WhatsApp";
                } else if (url.includes('telegram') || url.includes('t.me')) {
                    display = "📢 Rejoindre notre Telegram";
                }
                
                return (
                    <a 
                        key={index} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link-anchor"
                    >
                        {display}
                    </a>
                );
            }
            
            const textWithBold = part.split(regexBold).map((subPart, i) => {
                if (i % 2 === 1) {
                    return <strong key={i} className="promo-code-bold">{subPart}</strong>;
                }
                return subPart;
            });

            return <span key={index}>{textWithBold}</span>;
        });
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput) return;
        
        const newUserMessage = { 
            id: Date.now(), 
            text: trimmedInput, 
            sender: 'user', 
            isTyping: false 
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        
        setIsBotTyping(true);
        let botResponseText = "";

        try {
            botResponseText = await getAiResponse(trimmedInput);
        } catch (error) {
            console.error("Erreur de traitement:", error);
            botResponseText = "🚨 Une erreur de traitement inattendue est survenue.";
        } finally {
            setIsBotTyping(false);
        }

        setTimeout(() => {
            const newBotMessage = {
                id: Date.now() + 1,
                text: botResponseText,
                sender: 'bot',
                isTyping: false
            };
            setMessages(prev => [...prev, newBotMessage]);
        }, 300); 
    };

    // --- Composant d'une Bulle de Message ---
    const MessageBubble = ({ message }) => {
        const isBot = message.sender === 'bot';
        
        return (
            <div className={`message-row ${isBot ? 'bot-row' : 'user-row'}`}>
                <div 
                    className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}
                >
                    {formatMessageText(message.text)}
                </div>
            </div>
        );
    };

    // --- Rendu de l'interface ---
    return (
        <div className="app-container">
            <style jsx="true">{`
                /* Reset et base mobile-first */
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .app-container {
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                }
                
                .chat-card {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: #1a202c;
                    overflow: hidden;
                    position: relative;
                }

                /* Header sombre */
                .chat-header {
                    padding: 15px 20px;
                    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                    border-bottom: 1px solid #4a5568;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 70px;
                    flex-shrink: 0;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    min-width: 0;
                }

                .status-dot {
                    height: 10px;
                    width: 10px;
                    border-radius: 50%;
                    margin-right: 12px;
                    flex-shrink: 0;
                    background-color: #68d391;
                }

                .status-dot.typing {
                    background-color: #68d391;
                    animation: pulse 1.5s infinite;
                }

                .header-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #e2e8f0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .header-subtitle {
                    font-size: 12px;
                    font-weight: 500;
                    color: #f6e05e;
                    background: rgba(246, 224, 94, 0.15);
                    padding: 4px 8px;
                    border-radius: 6px;
                    margin-left: 8px;
                    white-space: nowrap;
                }

                /* Bannières avec dégradés doux */
                .banner-container {
                    display: flex;
                    gap: 10px;
                    padding: 12px;
                    background: #2d3748;
                    border-bottom: 1px solid #4a5568;
                    flex-shrink: 0;
                }

                .bet-banner {
                    flex: 1;
                    padding: 12px 8px;
                    border-radius: 10px;
                    text-align: center;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.3s ease;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    color: white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                /* Dégradé bleu doux pour 1xBet */
                .bet-banner-1xbet {
                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                }

                .bet-banner-1xbet:hover {
                    background: linear-gradient(135deg, #3da8e8 0%, #2c8fd1 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
                }

                /* Dégradé jaune doux pour MelBet */
                .bet-banner-melbet {
                    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                }

                .bet-banner-melbet:hover {
                    background: linear-gradient(135deg, #f4b142 0%, #eb9532 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
                }

                /* Zone des messages sombre */
                .messages-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: #1a202c;
                    -webkit-overflow-scrolling: touch;
                }

                .message-row {
                    display: flex;
                    margin-bottom: 12px;
                }

                .bot-row {
                    justify-content: flex-start;
                }

                .user-row {
                    justify-content: flex-end;
                }

                .message-bubble {
                    max-width: 85%;
                    padding: 14px 16px;
                    border-radius: 16px;
                    font-size: 15px;
                    line-height: 1.4;
                    word-wrap: break-word;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                .bot-bubble {
                    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                    border: 1px solid #4a5568;
                    color: #e2e8f0;
                }

                .user-bubble {
                    background: linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%);
                    color: white;
                }

                .promo-code-bold {
                    font-weight: 700;
                    color: #f6e05e;
                }

                .link-anchor {
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    color: white;
                    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
                    padding: 10px 14px;
                    border-radius: 8px;
                    display: block;
                    margin: 8px 0;
                    text-align: center;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(56, 161, 105, 0.3);
                }

                .link-anchor:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(56, 161, 105, 0.4);
                }

                /* CORRECTION : Input area avec texte visible */
                .input-form {
                    padding: 15px;
                    border-top: 1px solid #4a5568;
                    display: flex;
                    background: #2d3748;
                    gap: 10px;
                    flex-shrink: 0;
                }

                .chat-input {
                    flex: 1;
                    padding: 14px 16px;
                    border-radius: 12px;
                    border: 1px solid #4a5568;
                    background: #ffffff; /* Fond blanc pour voir le texte */
                    color: #2d3748; /* Texte foncé pour contraste */
                    font-size: 16px;
                    min-height: 50px;
                    -webkit-appearance: none;
                    transition: all 0.3s ease;
                }

                .chat-input:focus {
                    outline: none;
                    border-color: #4299e1;
                    background: #ffffff;
                    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
                }

                .chat-input::placeholder {
                    color: #718096; /* Placeholder gris */
                }

                .chat-button {
                    padding: 14px 20px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 16px;
                    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
                    color: white;
                    border: none;
                    min-height: 50px;
                    min-width: 80px;
                    -webkit-appearance: none;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(56, 161, 105, 0.3);
                }

                .chat-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(56, 161, 105, 0.4);
                }

                .chat-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                /* Typing indicator sombre */
                .typing-indicator-container {
                    display: flex;
                    justify-content: flex-start;
                    margin-bottom: 12px;
                }

                .typing-indicator-dots {
                    padding: 12px 16px;
                    border-radius: 16px;
                    background: #2d3748;
                    border: 1px solid #4a5568;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .dot {
                    height: 8px;
                    width: 8px;
                    background: #68d391;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite;
                }

                /* Animations douces */
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                    40% { transform: scale(1.1); opacity: 1; }
                }

                /* Media Queries pour desktop */
                @media (min-width: 769px) {
                    .app-container {
                        padding: 20px;
                        position: relative;
                    }

                    .chat-card {
                        width: 100%;
                        max-width: 800px;
                        height: 90vh;
                        border-radius: 16px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    }

                    .chat-header {
                        padding: 20px;
                        min-height: 80px;
                        border-radius: 16px 16px 0 0;
                        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                    }

                    .header-title {
                        font-size: 20px;
                        font-weight: 600;
                        color: #e2e8f0;
                    }

                    .header-subtitle {
                        font-size: 13px;
                        background: rgba(246, 224, 94, 0.2);
                        color: #f6e05e;
                        padding: 5px 10px;
                        border-radius: 8px;
                        border: 1px solid rgba(246, 224, 94, 0.3);
                    }

                    .banner-container {
                        padding: 15px;
                        gap: 12px;
                        background: #2d3748;
                    }

                    .bet-banner {
                        padding: 14px 12px;
                        font-size: 14px;
                        font-weight: 600;
                        border-radius: 10px;
                    }

                    .bet-banner:hover {
                        transform: translateY(-2px);
                    }

                    .messages-area {
                        padding: 20px;
                        background: #1a202c;
                    }

                    .message-bubble {
                        max-width: 70%;
                        padding: 16px 20px;
                        font-size: 15px;
                        border-radius: 18px;
                    }

                    .input-form {
                        padding: 20px;
                        gap: 12px;
                        background: #2d3748;
                        border-top: 1px solid #4a5568;
                        border-radius: 0 0 16px 16px;
                    }

                    .chat-input {
                        padding: 16px 20px;
                        font-size: 16px;
                        border-radius: 14px;
                        background: #ffffff;
                        color: #2d3748;
                    }

                    .chat-button {
                        padding: 16px 24px;
                        font-size: 16px;
                        border-radius: 14px;
                        min-width: 100px;
                    }

                    .chat-button:hover:not(:disabled) {
                        transform: translateY(-2px);
                    }
                }

                /* Très petits écrans */
                @media (max-width: 360px) {
                    .chat-header {
                        padding: 12px 15px;
                    }

                    .header-title {
                        font-size: 16px;
                    }

                    .header-subtitle {
                        font-size: 11px;
                        margin-left: 6px;
                        padding: 3px 6px;
                    }

                    .banner-container {
                        padding: 10px;
                        gap: 8px;
                        flex-direction: row;
                        overflow-x: auto;
                        flex-wrap: nowrap;
                        justify-content: space-between;
                    }

                    .bet-banner {
                        flex: 1;
                        min-width: 140px;
                        font-size: 12px;
                        padding: 10px 8px;
                        margin: 0;
                    }

                    .messages-area {
                        padding: 12px;
                    }

                    .message-bubble {
                        max-width: 90%;
                        padding: 12px 14px;
                        font-size: 14px;
                    }

                    .input-form {
                        padding: 12px;
                        gap: 8px;
                    }

                    .chat-input {
                        padding: 12px 14px;
                        font-size: 14px;
                        min-height: 46px;
                        background: #ffffff;
                        color: #2d3748;
                    }

                    .chat-button {
                        padding: 12px 16px;
                        font-size: 14px;
                        min-height: 46px;
                        min-width: 70px;
                    }
                }

                /* Correction pour iOS Safari */
                @supports (-webkit-touch-callout: none) {
                    .app-container {
                        min-height: -webkit-fill-available;
                    }
                    
                    .chat-card {
                        height: -webkit-fill-available;
                    }
                }

                /* Scrollbar personnalisée sombre */
                .messages-area::-webkit-scrollbar {
                    width: 4px;
                }

                .messages-area::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }

                .messages-area::-webkit-scrollbar-thumb {
                    background: #4a5568;
                    border-radius: 2px;
                }

                .messages-area::-webkit-scrollbar-thumb:hover {
                    background: #718096;
                }
            `}</style>

            <div className="chat-card">
                
                {/* En-tête du Chatbot */}
                <div className="chat-header">
                    <div className="header-content">
                        <span className={`status-dot ${isBotTyping ? 'typing' : 'idle'}`}></span>
                        <h1 className="header-title">
                            {BOT_NAME} <span className="header-subtitle">Code: {PROMO_CODE}</span>
                        </h1>
                    </div>
                </div>

                {/* Bannières 1xBet et MelBet avec nouveaux dégradés */}
                <div className="banner-container">
                    <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" className="bet-banner bet-banner-1xbet">
                        🎰 1xBet
                    </a>
                    <a href={MELBET_LINK} target="_blank" rel="noopener noreferrer" className="bet-banner bet-banner-melbet">
                        🎲 MelBet
                    </a>
                </div>

                {/* Zone des Messages */}
                <div className="messages-area">
                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                    
                    {/* Indicateur de saisie du bot */}
                    {isBotTyping && (
                        <div className="typing-indicator-container">
                            <div className="typing-indicator-dots">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Zone de Saisie - MAINTENANT VISIBLE */}
                <form onSubmit={handleSend} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="💬 Posez votre question..."
                        disabled={isBotTyping} 
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isBotTyping} 
                        className="chat-button"
                    >
                        {isBotTyping ? '...' : 'Envoyer'}
                    </button>
                </form>

            </div>
            
        </div>
    );
};

export default App;