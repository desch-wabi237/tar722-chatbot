import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Définitions et Constantes Globales ---
const PROMO_CODE = "TAR72";
const BOT_NAME = "TAR72-Bot";

// Liens affiliés et sociaux
const AFFILIATE_LINK = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

// La route que le client va appeler (cette route sera gérée par la fonction Serverless)
const API_ROUTE = "/api/chat"; 
// Note : La clé API n'est PLUS lue ici. Elle est stockée en toute sécurité sur le serveur.


// --- LOGIQUE D'INTÉGRATION GEMINI (Via Proxy Serverless) ---

/**
 * Appelle la route API Serverless locale pour obtenir la réponse de l'IA.
 */
const getAiResponse = async (userQuery, maxRetries = 5) => {
    
    // Le prompt système sera géré côté serveur pour des raisons de sécurité et de simplicité.
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(API_ROUTE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Nous envoyons simplement la requête de l'utilisateur au serveur
                body: JSON.stringify({ userQuery }) 
            });

            if (!response.ok) {
                // Si le serveur (ou la fonction serverless) renvoie une erreur
                const errorText = await response.text();
                throw new Error(errorText || `Erreur Serverless: ${response.status} ${response.statusText}`);
            }

            // Le serveur doit renvoyer le texte brut de la réponse de l'IA
            const text = await response.text();
            
            if (text) {
                return text;
            } else {
                throw new Error("Réponse de l'API vide ou mal formée.");
            }

        } catch (error) {
            console.error("Tentative API échouée:", error);
            if (attempt === maxRetries - 1) {
                // Message d'erreur standard après échec de toutes les tentatives
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
        let parts = text.split(/(\s(https?:\/\/[^\s]+))/g);
        const regexBold = /\*\*(.*?)\*\*/g;

        return parts.map((part, index) => {
            if (part.startsWith(' https://') || part.startsWith('https://')) {
                const url = part.trim();
                let display = url.length > 50 ? url.substring(0, 50) + '...' : url;
                if (url === AFFILIATE_LINK) display = "Lien d'Inscription 🚀";
                if (url === WHATSAPP_LINK) display = "Chaîne WhatsApp 💬";
                if (url === TELEGRAM_LINK) display = "Canal Telegram 📢";
                
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
            {/* Styles CSS Purs Intégrés */}
            <style jsx="true">{`
                /* Variables de couleurs */
                :root {
                    --color-primary: #f59e0b; /* Jaune/Or */
                    --color-secondary: #10b981; /* Vert */
                    --color-background: #111827; /* Noir/Sombre */
                    --color-card: #1f2937; /* Gris foncé */
                    --color-bot-bubble: #374151; /* Bulle Bot */
                    --color-user-bubble: #2563eb; /* Bulle User (Bleu) */
                    --color-text-light: #f9fafb;
                    --color-promo-code: #facc15; /* Jaune vif pour le code promo */
                    --color-button-text: #111827;
                }

                /* Styles globaux */
                .app-container {
                    min-height: 100vh;
                    background-color: var(--color-background);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    font-family: sans-serif;
                    position: relative;
                }
                
                .chat-card {
                    width: 100%;
                    max-width: 1024px; /* max-w-4xl */
                    height: 90vh;
                    display: flex;
                    flex-direction: column;
                    border-radius: 16px; /* rounded-2xl */
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); /* shadow-2xl */
                    background-color: rgba(31, 41, 55, 0.8); /* bg-gray-800/80 */
                    overflow: hidden;
                    border: 1px solid #374151; /* border-gray-700 */
                }

                /* Header */
                .chat-header {
                    padding: 16px;
                    background-color: var(--color-background);
                    border-bottom: 1px solid #374151;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .status-dot {
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    margin-right: 12px;
                    transition: background-color 0.3s;
                }
                .status-dot.typing {
                    background-color: var(--color-secondary);
                    animation: pulse 1.5s infinite;
                }
                .status-dot.idle {
                    background-color: #6b7280; /* gray-500 */
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .header-title {
                    font-size: 20px;
                    font-weight: bold;
                    color: var(--color-text-light);
                }
                .header-subtitle {
                    font-size: 14px;
                    font-weight: normal;
                    color: var(--color-promo-code);
                    margin-left: 8px;
                }
                .register-button {
                    padding: 4px 12px;
                    font-size: 14px;
                    font-weight: 600;
                    border-radius: 9999px; /* rounded-full */
                    transition: all 0.3s;
                    background-color: var(--color-primary);
                    color: var(--color-button-text);
                    text-decoration: none;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .register-button:hover {
                    background-color: #fcd34d; /* yellow-400 */
                }

                /* Messages Area */
                .messages-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                /* Message Rows */
                .message-row {
                    display: flex;
                    margin-bottom: 16px;
                }
                .bot-row {
                    justify-content: flex-start;
                }
                .user-row {
                    justify-content: flex-end;
                }

                /* Message Bubble */
                .message-bubble {
                    max-width: 80%; /* max-w-xl (adapté au CSS) */
                    padding: 16px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease-out;
                    font-size: 16px;
                    word-wrap: break-word;
                    color: var(--color-text-light);
                }
                
                .bot-bubble {
                    background-color: var(--color-bot-bubble);
                    border-bottom-left-radius: 0;
                }
                
                .user-bubble {
                    background-color: var(--color-user-bubble);
                    border-bottom-right-radius: 0;
                }

                .promo-code-bold {
                    font-weight: 800;
                    color: var(--color-promo-code);
                }
                
                .link-anchor {
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    color: #4ade80; /* green-300 */
                    background-color: rgba(16, 185, 129, 0.3);
                    padding: 4px 8px;
                    border-radius: 4px;
                    display: inline-block;
                    margin: 4px 0;
                    transition: color 0.2s;
                }
                .link-anchor:hover {
                    text-decoration: underline;
                    color: #f59e0b;
                }


                /* Typing Indicator */
                .typing-indicator-container {
                    display: flex;
                    justify-content: flex-start;
                    margin-bottom: 16px;
                }
                .typing-indicator-dots {
                    padding: 12px;
                    border-radius: 12px;
                    background-color: var(--color-bot-bubble);
                    border-bottom-left-radius: 0;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .dot {
                    height: 8px;
                    width: 8px;
                    background-color: var(--color-promo-code);
                    border-radius: 50%;
                    animation: bounce 1.4s infinite;
                }
                .dot:nth-child(2) { animation-delay: 0.1s; }
                .dot:nth-child(3) { animation-delay: 0.2s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                /* Input Area */
                .input-form {
                    padding: 16px;
                    border-top: 1px solid #374151;
                    display: flex;
                    background-color: var(--color-card);
                }
                .chat-input {
                    flex: 1;
                    padding: 12px;
                    margin-right: 12px;
                    border-radius: 12px;
                    border: 1px solid #4b5563; /* gray-600 */
                    background-color: #374151; /* gray-700 */
                    color: var(--color-text-light);
                    font-size: 16px;
                    outline: none;
                    transition: all 0.2s;
                }
                .chat-input:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.5);
                }
                .chat-button {
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    transition: all 0.2s;
                    background-color: var(--color-primary);
                    color: var(--color-button-text);
                    border: none;
                }
                .chat-button:hover:not(:disabled) {
                    background-color: #fcd34d;
                }
                .chat-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Footer (Pied de page) */
                .footer-links {
                    position: absolute;
                    bottom: 8px;
                    right: 16px;
                    font-size: 12px;
                    color: #6b7280;
                    display: flex;
                    gap: 12px;
                }
                .footer-links a {
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .footer-links a:hover {
                    color: var(--color-secondary);
                }
                .footer-links a.telegram:hover {
                    color: #60a5fa; /* blue-400 */
                }
                .footer-links a.whatsapp:hover {
                    color: #10b981; /* green-500 */
                }

                /* Media Queries pour le Responsive Design */
                @media (max-width: 768px) {
                    .chat-card {
                        height: 95vh;
                        border-radius: 0;
                        max-width: 100%;
                    }
                    .message-bubble {
                        max-width: 90%;
                        font-size: 15px;
                    }
                    .chat-header {
                        padding: 12px;
                    }
                    .header-title {
                        font-size: 18px;
                    }
                    .header-subtitle {
                        display: none; /* Cache le sous-titre sur mobile pour gagner de la place */
                    }
                    .register-button {
                        padding: 4px 8px;
                    }
                }
            `}</style>

            <div className="chat-card">
                
                {/* En-tête du Chatbot */}
                <div className="chat-header">
                    <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={`status-dot ${isBotTyping ? 'typing' : 'idle'}`}></span>
                        <h1 className="header-title">
                            {BOT_NAME} <span className="header-subtitle">| Code Promo: {PROMO_CODE}</span>
                        </h1>
                    </div>
                    <a 
                        href={AFFILIATE_LINK} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="register-button"
                    >
                        S'inscrire ({PROMO_CODE})
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
                    
                    <div ref={messagesEndRef} /> {/* Ancre pour le défilement */}
                </div>

                {/* Zone de Saisie */}
                <form onSubmit={handleSend} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question ou demandez le code promo..."
                        disabled={isBotTyping} 
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isBotTyping} 
                        className="chat-button"
                    >
                        Envoyer
                    </button>
                </form>

            </div>
            
            {/* Pied de page informatif et liens sociaux */}
            <div className="footer-links">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="whatsapp">
                    💬 WhatsApp
                </a>
                <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="telegram">
                    📢 Telegram
                </a>
                <span>| Code {PROMO_CODE}</span>
            </div>
            
        </div>
    );
};

export default App;
