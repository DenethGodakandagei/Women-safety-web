const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyA-sGShBLMbHex9fcqVpCBcc3VhDwo36QE');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // using 1.5 since I suspect 2.5 is a typo

async function test() {
    try {
        const result = await model.generateContent("hello");
        console.log('SUCCESS:', result.response.text());
    } catch (e) {
        console.error('ERROR:', e.message);
        if (e.status) console.error('STATUS:', e.status);
    }
}
test();
