// api/chat.js - Version optimisée pour réponses naturelles
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const MODEL = 'gemini-2.0-flash-exp';
  const PROMO_CODE = "TAR72";
  const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!GEMINI_API_KEY) {
    console.error("❌ Clé API Gemini manquante");
    return res.status(500).json({ error: "Configuration manquante" });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Requête invalide' });
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Aucun message valide reçu' });
  }

  const SYSTEM_PROMPT = `
Tu es **TAR72PRONOSTIC**, un assistant humain, amical et naturel.
Ta mission : aider les utilisateurs à profiter du **code promo TAR72** pour obtenir des bonus exclusifs sur **1xBet** et **Melbet**.
- Parle comme un humain, en 3 phrases max.
- Sois enthousiaste mais crédible.
- Mentionne toujours le code **TAR72** et le lien WhatsApp : ${WHATSAPP_LINK}.
- Dis clairement que le code TAR72 est obligatoire pour télécharger les coupons premium.
- Adapte-toi automatiquement à la langue de l’utilisateur.
`;

  // Construction du format Gemini (avec contexte clair)
  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
  ];

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 400
    }
  };

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("❌ Erreur Gemini:", data);
      return res.status(geminiResponse.status).json({ error: data.error?.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n’ai pas compris.";

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error("💥 Erreur serveur:", error);
    return res.status(500).json({ error: error.message });
  }
};
