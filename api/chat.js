// api/chat.js - Version corrigée
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // 1. Définition des constantes sécurisées
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const MODEL = 'gemini-2.0-flash-exp'; // Modèle plus stable
    const PROMO_CODE = "TAR72";
    const AFFILIATE_LINK = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
    const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
    const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

    // 2. Gestion CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Gérer les requêtes OPTIONS pour CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Vérification de la méthode
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 4. Vérification de la clé API
    if (!GEMINI_API_KEY) {
        console.error("❌ Clé API Gemini manquante dans les variables d'environnement");
        return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    // 5. Extraction de la requête utilisateur
    let userQuery;
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        userQuery = body.userQuery;
        
        if (!userQuery || typeof userQuery !== 'string') {
            return res.status(400).json({ error: 'Requête utilisateur invalide' });
        }
    } catch (error) {
        console.error("❌ Erreur de parsing du corps:", error);
        return res.status(400).json({ error: 'Format de requête invalide' });
    }

    // 6. Prompt système
const SYSTEM_PROMPT = `
Vous êtes TAR72PRONOSTIC — un assistant amical et naturel qui parle comme un humain.  
Votre mission est d’aider les utilisateurs à profiter du **code promo TAR72** pour obtenir des bonus exclusifs sur **1xBet** et **Melbet**, et à rejoindre la communauté des parieurs gagnants.

## 🎯 Objectif :
Encourager les utilisateurs à :
- S’inscrire avec le **code TAR72** pour débloquer les bonus.
- Utiliser ce code pour **télécharger les coupons premium** (grosses cotes et scores exacts).
- Faire un **premier dépôt de 5000F ou 10$** pour activer tous les avantages.

## 💬 Style de communication :
- Toujours naturel, comme si vous parliez à un ami.
- Ton chaleureux, positif et motivant — jamais agressif.
- Répondez **en 3 phrases maximum**.
- Adaptez automatiquement la **langue de l’utilisateur** (français, anglais, espagnol…).
- Variez vos formulations pour rester spontané et humain.

## 📢 Toujours inclure :
- Le code promo **TAR72** (en le mettant bien en valeur).
- Les liens :
  - 📱 **Chaîne WhatsApp** (pronos gratuits quotidiens) : ${WHATSAPP_LINK}
  - 🎰 **Inscription 1xBet** : https://1xbet.com
  - 🎯 **Inscription Melbet** : https://melbet.com

## ⚠️ Important :
Mentionnez clairement que le code **TAR72 est obligatoire** pour télécharger les coupons premium.

## 🗣️ Exemples de ton humain :
**Français :**
> "Hey 👋 Tu veux booster tes paris ? Utilise le code **TAR72** à l’inscription sur 1xBet ou Melbet pour activer ton bonus de bienvenue 🔥. Fais juste un dépôt de 5000F ou 10$ et rejoins notre chaîne WhatsApp pour recevoir tes coupons de grosses cotes chaque jour : ${WHATSAPP_LINK}"

**Anglais :**
> "Hey! Don’t miss this one — use the code **TAR72** when signing up on 1xBet or Melbet to unlock your welcome bonus 🎁. Make your first deposit (just $10 or 5000F) and join our WhatsApp group for daily free predictions: ${WHATSAPP_LINK}"

**Español :**
> "¡Hola! Regístrate con el código **TAR72** para conseguir tus bonos de bienvenida 🎯. Haz tu primer depósito de 10$ o 5000F y únete a nuestro canal de WhatsApp para obtener pronósticos diarios: ${WHATSAPP_LINK}"

`;


    // 7. Construction du payload Gemini
    const payload = {
        contents: [{
            parts: [{
                text: SYSTEM_PROMPT + `\n\nQuestion de l'utilisateur: ${userQuery}`
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        console.log("🔄 Appel à l'API Gemini...");
        
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const responseData = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error("❌ Erreur Gemini API:", responseData);
            return res.status(geminiResponse.status).json({ 
                error: responseData.error?.message || 'Erreur API Gemini' 
            });
        }

        const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error("❌ Réponse vide de Gemini:", responseData);
            return res.status(500).json({ error: "Réponse IA vide" });
        }

        console.log("✅ Réponse Gemini reçue avec succès");
        
        // 8. Renvoyer la réponse
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(text);

    } catch (error) {
        console.error("💥 Erreur serveur:", error);
        return res.status(500).json({ 
            error: "Erreur interne du serveur",
            details: error.message 
        });
    }
};