const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test_prefix() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyA-sGShBLMbHex9fcqVpCBcc3VhDwo36QE');
        console.log("Trying models/gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log('SUCCESS:', result.response.text());
    } catch (e) {
        console.error('ERROR MESSAGE:', e.message);
    }
}
test_prefix();
