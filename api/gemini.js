export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key de Gemini no configurada en el entorno.' });
  }

  const { prompt, image } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt.' });
  }

  // Modelo actualizado a Gemini 2.5 Flash Preview 05-20
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-0513-preview:generateContent?key=${apiKey}`;
  const parts = [{ text: prompt }];
  if (image && image.data && image.mimeType) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data
      }
    });
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("Gemini API error:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}
