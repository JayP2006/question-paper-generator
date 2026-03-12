const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.extractTopicsFromSyllabus = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = `Extract a list of main topics and keywords from this syllabus text. Return ONLY a valid JSON array of strings. Text: ${text.substring(0, 5000)}`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("AI Extraction Error:", error);
        return ["General"]; // Fallback
    }
};