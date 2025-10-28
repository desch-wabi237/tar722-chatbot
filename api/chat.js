// api/chat.js — version améliorée (réponses plus humaines)
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const MODEL = 'gemini-2.0-flash'; // modèle stable
    const PROMO_CODE = "TAR72";
    const AFFILIATE_LINK = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
    const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
    const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    if (!GEMINI_API_KEY) return res.status(500).json({ error: "Clé API manquante" });

    let userQuery;
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        userQuery = body.userQuery?.trim();
        if (!userQuery) return res.status(400).json({ error: 'Requête vide' });
    } catch {
        return res.status(400).json({ error: 'Format invalide' });
    }

    // 💬 Nouveau prompt humain et adaptatif
    const SYSTEM_PROMPT = `
Tu es **TAR72PRONOSTIC**, un assistant humain, naturel et sympathique.  
Ta mission est d’aider les utilisateurs à gagner plus sur **1xBet** et **Melbet** en utilisant le **code promo TAR72**.  
Réponds de manière courte (2 à 3 phrases), naturelle et vivante — comme un ami expert en paris sportifs.  
Tu adaptes ta langue automatiquement (français, anglais, espagnol…) selon la question.  
Si la question n’a rien à voir avec les paris, répond gentiment et ramène subtilement vers ton rôle principal (aider avec le code TAR72).

### 🎯 Objectifs :
1. Promouvoir le code **TAR72** pour activer les bonus.
2. Encourager à s’inscrire sur **1xBet** ou **Melbet**.
3. Inviter à rejoindre le canal WhatsApp : ${WHATSAPP_LINK}

### ⚡ Style :
- Parle comme un vrai humain, chaleureux, motivant, mais jamais insistant.
- Varie tes tournures de phrases à chaque réponse.
- Utilise des émojis (1 à 2 max) selon le ton.
- Ne répète pas toujours les mêmes phrases.

### 📢 Toujours inclure :
- Le code promo **TAR72**.
- Un lien vers WhatsApp, 1xBet ou Melbet (selon le contexte).

### 🧠 Exemples :
**Français :**
> "Hey 👋 Si tu veux booster tes paris, utilise le code **TAR72** à l’inscription sur 1xBet ou Melbet 🎯. Tu auras ton bonus et des coupons premium chaque jour ici : ${WHATSAPP_LINK}"

> "Pas de souci 😄, pour commencer c’est simple : inscris-toi sur 1xBet ou Melbet avec le code **TAR72** et rejoins notre WhatsApp, tu vas adorer les pronos !"

**Anglais :**
> "Hey! Wanna win big? Use the code **TAR72** when you sign up on 1xBet or Melbet 🎁. Join our WhatsApp for free tips: ${WHATSAPP_LINK}"

**Español :**
> "¡Hola! Usa el código **TAR72** en tu registro en 1xBet o Melbet 🎯. Únete a nuestro canal WhatsApp para recibir pronósticos diarios: ${WHATSAPP_LINK}"
`;

    const payload = {
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUtilisateur: ${userQuery}` }] }],
        generationConfig: {
            temperature: 0.85,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
        },
    };

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        console.log("🧠 Envoi de la requête à Gemini...");
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("❌ Erreur API Gemini:", data);
            return res.status(500).json({ error: data.error?.message || "Erreur API Gemini" });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) return res.status(500).json({ error: "Réponse vide de Gemini" });

        console.log("✅ Réponse réussie");
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(text);

    } catch (error) {
        console.error("💥 Erreur serveur:", error);
        return res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
    }
};
