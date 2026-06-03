export default async function handler(req, res) {
    // 允許跨域請求 (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { systemPrompt, userText } = req.body;
        
        // 直接由 Vercel 後端伺服器發出請求，100% 繞過瀏覽器 CORS 限制
        const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 977be795-a46a-4201-ab6b-1d289a065346",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "Meta-Llama-3.3-70B-Instruct",
                "messages": [
                    {"role": "system", "content": systemPrompt},
                    {"role": "user", "content": userText}
                ],
                "temperature": 0.1
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`SambaNova Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const resultText = data.choices[0].message.content.trim();
        
        return res.status(200).json({ result: resultText });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
