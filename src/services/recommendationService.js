import { GoogleGenAI, Type } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export async function getBookRecommendations(purchasedBooks, allAvailableBooks) {
    if (purchasedBooks.length === 0)
        return allAvailableBooks.slice(0, 4);
    const prompt = `
    Based on these books I previously purchased:
    ${purchasedBooks.map(b => `- ${b.title} by ${b.author} (Genre: ${b.genre})`).join('\n')}

    Choose up to 4 most relevant book IDs from this list:
    ${allAvailableBooks.map(b => `- ID: ${b.id} | Title: ${b.title} | Author: ${b.author} | Genre: ${b.genre}`).join('\n')}

    Return only the IDs as a JSON array of strings.
  `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const recommendedIds = JSON.parse(response.text || '[]');
        return allAvailableBooks.filter(b => recommendedIds.includes(b.id));
    }
    catch (error) {
        console.error("AI Recommendation failed", error);
        return allAvailableBooks.slice(0, 4);
    }
}
