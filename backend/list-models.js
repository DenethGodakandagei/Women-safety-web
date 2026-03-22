require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
        for (const mName of models) {
            try {
                console.log(`Trying ${mName}...`);
                const model = genAI.getGenerativeModel({ model: mName });
                const result = await model.generateContent("hi");
                console.log(`Success with ${mName}!`);
                return;
            } catch (e) {
                console.log(`Failed ${mName}:`, e.message);
            }
        }
    } catch (err) {
        console.error("Critical Failure:", err);
    }
}

listModels();
