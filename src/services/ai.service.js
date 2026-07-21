import Anthropic from '@anthropic-ai/sdk';
import env from '../config/env.js';

let anthropic;
if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
    anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
} else {
    console.warn("ANTHROPIC_API_KEY is not set or invalid. AI descriptions will not work.");
}

export const generatePhoneDescription = async (phoneName, specs) => {
    if (!anthropic) {
        console.warn("Skipping AI description generation because API key is missing.");
        return null;
    }

    try {
        const prompt = `
Write a highly detailed, professional, and to-the-point product description for the smartphone "${phoneName}". 
Use the following specifications as a reference:
${JSON.stringify(specs, null, 2)}

The description MUST follow these guidelines:
- Write 3 to 4 well-structured paragraphs.
- Maintain a premium, professional, and objective tone suitable for a top-tier e-commerce platform. Avoid overly fluffy marketing jargon.
- Highlight the standout features (e.g., camera capabilities, processing power, battery endurance, display quality).
- Explicitly deduce and explain extra features or capabilities that are typical for this phone's tier but might not be fully detailed in the raw specs (e.g., AI camera enhancements, gaming performance, software ecosystem benefits, build quality, and real-world usage scenarios).
- Make sure to get straight to the point without generic introductions.
- DO NOT use generic placeholders or mention that you are an AI.
- Format the response in plain text. DO NOT use markdown symbols like *, #, -, or bold/italic formatting.
        `;

        const message = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
        });

        return message.content[0].text;
    } catch (error) {
        console.error("Error generating description from Anthropic:", error);
        return null;
    }
};
