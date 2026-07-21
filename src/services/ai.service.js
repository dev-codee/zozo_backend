import Groq from 'groq-sdk';
import env from '../config/env.js';

let ai;
if (env.GROQ_API_KEY && env.GROQ_API_KEY !== 'your_groq_api_key_here') {
    ai = new Groq({ apiKey: env.GROQ_API_KEY });
} else {
    console.warn("GROQ_API_KEY is not set or invalid. AI descriptions will not work.");
}

export const generatePhoneDescription = async (phoneName, specs) => {
    if (!ai) {
        console.warn("Skipping AI description generation because API key is missing.");
        return null;
    }

    try {
        const prompt = `
Write a professional, engaging, and accurate product description for the smartphone "${phoneName}". 
Use the following specifications as a reference to highlight its key features:
${JSON.stringify(specs, null, 2)}

The description should:
- Be 2 to 3 paragraphs long.
- Highlight the best features (e.g., camera, battery, display, or performance).
- Have a professional, objective, and appealing tone suitable for an e-commerce website.
- DO NOT use generic placeholders or mention that you are an AI.
- Format the response in clean markdown or plain text.
        `;

        const chatCompletion = await ai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
        });

        return chatCompletion.choices[0]?.message?.content;
    } catch (error) {
        console.error("Error generating description from Groq:", error);
        return null;
    }
};
