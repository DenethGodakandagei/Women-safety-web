const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyA-sGShBLMbHex9fcqVpCBcc3VhDwo36QE');
        console.log("Trying gemini-1.5-flash with v1...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
        const result = await model.generateContent("hello");
        console.log('SUCCESS:', result.response.text());
    } catch (e) {
        console.error('ERROR:', e.message);
        if (e.status) console.error('STATUS:', e.status);
    }
}
test();
