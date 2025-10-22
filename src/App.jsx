import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Définitions et Constantes Globales ---
const PROMO_CODE = "TAR72";
const BOT_NAME = "TAR72PRONOSTIC";

// Liens affiliés et sociaux
const AFFILIATE_LINK = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";
const MELBET_LINK = "https://melbet.com";
const ONEXBET_LINK = "https://1xbet.com";

// La route que le client va appeler
const API_ROUTE = "/api/chat"; 

// --- LOGIQUE D'INTÉGRATION GEMINI (Via Proxy Serverless) ---
const getAiResponse = async (userQuery, maxRetries = 5) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(API_ROUTE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userQuery,
                    // On envoie aussi le code promo et les liens pour que le serveur les utilise
                    promoCode: PROMO_CODE,
                    links: {
                        whatsapp: WHATSAPP_LINK,
                        telegram: TELEGRAM_LINK,
                        onexbet: ONEXBET_LINK,
                        melbet: MELBET_LINK,
                        affiliate: AFFILIATE_LINK
                    }
                }) 
            });

            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.status}`);
            }

            const text = await response.text();
            return text || `Utilise le code ${PROMO_CODE} pour tes inscriptions ! 🎯`;

        } catch (error) {
            console.error("Erreur API:", error);
            if (attempt === maxRetries - 1) {
                return `Rejoins-nous sur WhatsApp pour des pronos gratuits: ${WHATSAPP_LINK} Code: ${PROMO_CODE} 🔥`;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return `Inscris-toi avec le code ${PROMO_CODE} pour des bonus incroyables ! 🎰`;
};

// --- Composant Principal de l'Application ---
const App = () => {
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: `Salut ! Je suis ${BOT_NAME} 👋 Ton assistant pour maximiser tes gains avec le code ${PROMO_CODE} !

🎁 **BONUS EXCLUSIF** : Utilise le code ${PROMO_CODE} pour débloquer des avantages spéciaux sur 1xBet et Melbet !

📱 Rejoins nos communautés :
${WHATSAPP_LINK}
${TELEGRAM_LINK}

Que veux-tu savoir ? 😊`, 
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

    // Fonction améliorée pour formater les liens
    const formatMessageText = useCallback((text) => {
        if (!text) return null;

        // Détection robuste des URLs
        const urlRegex = /(https?:\/\/[^\s<>"]+[^\s<>".,?!])/g;
        let parts = text.split(urlRegex);
        const regexBold = /\*\*(.*?)\*\*/g;

        return parts.map((part, index) => {
            // Vérification URL améliorée
            if (part.match(/^https?:\/\//)) {
                const url = part.trim();
                
                // Identification spécifique des liens
                let display;
                if (url.includes('whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i')) {
                    display = "💬 WhatsApp - Pronos Gratuits Quotidien";
                } else if (url.includes('t.me/+tuopCS5aGEk3ZWZk')) {
                    display = "📢 Telegram - Communauté Exclusive";
                } else if (url.includes('1xbet.com') || url.includes('refpa58144')) {
                    display = "🎰 1xBet - Inscription avec Bonus Max";
                } else if (url.includes('melbet.com')) {
                    display = "🎲 MelBet - Meilleures Cotes";
                } else {
                    display = "🔗 Lien Important";
                }
                
                return (
                    <a 
                        key={index} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link-anchor"
                        style={{ display: 'block', margin: '8px 0' }}
                    >
                        {display}
                    </a>
                );
            }
            
            // Gestion du texte en gras
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
        
        // Message utilisateur
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
            console.error("Erreur:", error);
            // Réponse de secours avec les liens importants
            botResponseText = `Inscris-toi avec le code ${PROMO_CODE} pour des bonus incroyables ! 🎰 Fais ton premier dépôt de 5000F ou 10$ pour activer tous les avantages. Rejoins notre WhatsApp: ${WHATSAPP_LINK}`;
        } finally {
            setIsBotTyping(false);
        }

        // Message bot avec délai pour effet naturel
        setTimeout(() => {
            const newBotMessage = {
                id: Date.now() + 1,
                text: botResponseText,
                sender: 'bot',
                isTyping: false
            };
            setMessages(prev => [...prev, newBotMessage]);
        }, 500);
    };

    // Fonction pour les boutons d'action rapide
    const handleQuickAction = (action) => {
        let question = "";
        switch(action) {
            case 'code':
                question = "Comment utiliser le code promo TAR72 ?";
                break;
            case 'whatsapp':
                question = "Comment rejoindre le WhatsApp ?";
                break;
            case 'inscription':
                question = "Comment m'inscrire sur 1xBet ?";
                break;
            case 'bonus':
                question = "Quels sont les bonus avec TAR72 ?";
                break;
            default:
                question = action;
        }
        
        setInput(question);
        // Déclencher l'envoi automatique après un court délai
        setTimeout(() => {
            document.querySelector('.chat-button')?.click();
        }, 100);
    };

    // Composant de bulle de message
    const MessageBubble = ({ message }) => {
        const isBot = message.sender === 'bot';
        
        return (
            <div className={`message-row ${isBot ? 'bot-row' : 'user-row'}`}>
                <div className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
                    {formatMessageText(message.text)}
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            <style jsx="true">{`
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

                /* Header */
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

                /* Bannières */
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

                .bet-banner-1xbet {
                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                }

                .bet-banner-melbet {
                    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                }

                .bet-banner:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                }

                /* Quick Actions */
                .quick-actions {
                    display: flex;
                    gap: 8px;
                    padding: 12px;
                    background: #2d3748;
                    border-bottom: 1px solid #4a5568;
                    flex-wrap: wrap;
                    flex-shrink: 0;
                }

                .quick-button {
                    padding: 8px 12px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                    border: 1px solid #4a5568;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    flex: 1;
                    min-width: 80px;
                    text-align: center;
                }

                .quick-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                }

                /* Messages */
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
                    padding: 12px 16px;
                    border-radius: 10px;
                    display: block;
                    margin: 8px 0;
                    text-align: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
                    border: 2px solid transparent;
                }

                .link-anchor:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(56, 161, 105, 0.5);
                }

                /* Input */
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
                    background: #ffffff;
                    color: #2d3748;
                    font-size: 16px;
                    min-height: 50px;
                    -webkit-appearance: none;
                }

                .chat-input:focus {
                    outline: none;
                    border-color: #4299e1;
                    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
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
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .chat-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }

                .chat-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Typing */
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

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                    40% { transform: scale(1.1); opacity: 1; }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .chat-header {
                        padding: 12px 15px;
                    }

                    .header-title {
                        font-size: 16px;
                    }

                    .quick-actions {
                        padding: 10px;
                        gap: 6px;
                    }

                    .quick-button {
                        font-size: 11px;
                        padding: 6px 8px;
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
                    }
                }

                @supports (-webkit-touch-callout: none) {
                    .app-container {
                        min-height: -webkit-fill-available;
                    }
                    .chat-card {
                        height: -webkit-fill-available;
                    }
                }
            `}</style>

            <div className="chat-card">
                
                {/* Header */}
                <div className="chat-header">
                    <div className="header-content">
                        <span className={`status-dot ${isBotTyping ? 'typing' : 'idle'}`}></span>
                        <h1 className="header-title">
                            {BOT_NAME} <span className="header-subtitle">Code: {PROMO_CODE}</span>
                        </h1>
                    </div>
                </div>

                {/* Bannières */}
                <div className="banner-container">
                    <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" className="bet-banner bet-banner-1xbet">
                        🎰 1xBet - Bonus {PROMO_CODE}
                    </a>
                    <a href={MELBET_LINK} target="_blank" rel="noopener noreferrer" className="bet-banner bet-banner-melbet">
                        🎲 MelBet - Paris Sportifs
                    </a>
                </div>

                {/* Actions rapides */}
                <div className="quick-actions">
                    <button className="quick-button" onClick={() => handleQuickAction('code')}>
                        📱 Code {PROMO_CODE}
                    </button>
                    <button className="quick-button" onClick={() => handleQuickAction('whatsapp')}>
                        💬 WhatsApp
                    </button>
                    <button className="quick-button" onClick={() => handleQuickAction('inscription')}>
                        🎰 Inscription
                    </button>
                    <button className="quick-button" onClick={() => handleQuickAction('bonus')}>
                        🎁 Bonus
                    </button>
                </div>

                {/* Messages */}
                <div className="messages-area">
                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                    
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

                {/* Input */}
                <form onSubmit={handleSend} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="💬 Pose ta question..."
                        disabled={isBotTyping} 
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isBotTyping} 
                        className="chat-button"
                    >
                        {isBotTyping ? '...' : 'Go'}
                    </button>
                </form>

            </div>
            
        </div>
    );
};

export default App;