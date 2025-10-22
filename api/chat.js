// api/chat.js
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  // --- CONFIGURATION SÉCURISÉE ---
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const MODEL = "gemini-2.0-flash-exp";
  const PROMO_CODE = "TAR72";

  const AFFILIATE_1XBET = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
  const AFFILIATE_MELBET = "https://melbet.com";
  const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
  const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

  // --- CORS ---
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!GEMINI_API_KEY) {
    console.error("❌ Clé API Gemini manquante !");
    return res.status(500).json({ error: "Configuration serveur incomplète" });
  }

  // --- LECTURE DE LA REQUÊTE UTILISATEUR ---
  let userQuery;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    userQuery = body.userQuery?.trim();
    if (!userQuery) {
      return res.status(400).json({ error: "Requête invalide" });
    }
  } catch (err) {
    console.error("❌ Erreur de parsing:", err);
    return res.status(400).json({ error: "Format JSON invalide" });
  }

  // --- PROMPT IA PRINCIPAL ---
  const SYSTEM_PROMPT = `
Vous êtes un assistant amical appelé TAR72-BOT. 
Votre mission est d’aider les utilisateurs à profiter du **code promo ${PROMO_CODE}** 
pour obtenir des bonus exclusifs sur **1xBet** et **Melbet**.

⚙️ **Règles :**
- Répondez toujours en **3 phrases maximum**.
- Utilisez la **langue de l'utilisateur automatiquement** (français, anglais, espagnol, etc.).
- Soyez **naturel, amical, motivant mais crédible**.
- Mentionnez toujours :
  - Le code promo **${PROMO_CODE}** (obligatoire pour activer les bonus).
  - L’importance du premier dépôt de **5000F ou 10$**.
  - Les liens suivants :
    - 📱 Chaîne WhatsApp : ${WHATSAPP_LINK}
    - 📢 Canal Telegram : ${TELEGRAM_LINK}
    - 🎰 1xBet : ${AFFILIATE_1XBET}
    - 🎯 Melbet : ${AFFILIATE_MELBET}

🔑 Détail important :
Le code **${PROMO_CODE}** est **obligatoire** pour télécharger les coupons premium (grosses cotes et scores exacts).

Répondez de manière **courte, fluide et humaine**, comme un ami qui aide un autre à profiter d’un bon plan.
`;

  // --- CORPS DE LA REQUÊTE GEMINI ---
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nQuestion de l'utilisateur : ${userQuery}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
    },
  };

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    console.log("🔄 Appel Gemini API...");
    const geminiResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("❌ Erreur Gemini:", responseData);
      return res.status(geminiResponse.status).json({
        error: responseData.error?.message || "Erreur API Gemini",
      });
    }

    const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("⚠️ Réponse vide de Gemini:", responseData);
      return res.status(500).json({ error: "Réponse IA vide" });
    }

    console.log("✅ Réponse Gemini OK");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(text);
  } catch (error) {
    console.error("💥 Erreur serveur:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message,
    });
  }
};
