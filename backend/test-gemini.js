require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log('Testing Gemini with key:', process.env.GEMINI_API_KEY.substring(0, 10), '...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log('Response:', result.response.text());
    } catch (e) {
        console.error('Gemini Error Status:', e.status);
        console.error('Gemini Error Message:', e.message);
        console.error('Gemini Error Details:', JSON.stringify(e, null, 2));
    }
}


testGemini();
