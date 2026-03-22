const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test_pro() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyA-sGShBLMbHex9fcqVpCBcc3VhDwo36QE');
        console.log("Trying gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("hello");
        console.log('SUCCESS:', result.response.text());
    } catch (e) {
        console.error('ERROR MESSAGE:', e.message);
        console.error('ERROR STATUS:', e.status);
    }
}
test_pro();
