// Manual test to verify the third-party API connection
const axios = require('axios');

const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5ODc4OTI0LCJpYXQiOjE3NDk4Nzg2MjQsImlzcyI6IkFmZm9yZG1lZCIsInN1YiI6ImlybjIyaXMxOTEubW9rc2hhbkBybnNpdC5hYy5pbiJ9LCJjb21wYW55TmFtZSI6IlJOUyBJbnN0aXR1dGUgT2YgVGVjaG5vbG9neSIsImNsaWVudElEIjoiODBhMTFmYjQtOTBhNC00OWIyLWIwYTQtMDZjMTc0NzJkYTQzIiwiY2xpZW50U2VjcmV0IjoibXNlYUNjdFJkakZmeVF2aCIsIm93bmVyTmFtZSI6Im1va3NoIGEgbiIsIm93bmVyRW1haWwiOiJpcm4yMmlzMTkxLm1va3NoYW5Acm5zaXQuYWMuaW4iLCJyb2xsTm8iOiIxcm4yMmlzMTkxIn0.pmVsEhVBBhHFJgLGXBdXTQHtmseaCctRdjFfyQvh';

async function testThirdPartyAPI() {
    const endpoints = ['primes', 'fibo', 'even', 'rand'];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting ${endpoint}...`);
            const response = await axios.get(`${TEST_SERVER_BASE_URL}/numbers/${endpoint}`, {
                timeout: 500,
                headers: {
                    'Authorization': AUTH_TOKEN,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✓ ${endpoint}: ${JSON.stringify(response.data)}`);
        } catch (error) {
            console.log(`✗ ${endpoint}: ${error.message}`);
            if (error.response) {
                console.log(`  Status: ${error.response.status}`);
                console.log(`  Data: ${JSON.stringify(error.response.data)}`);
            }
        }
    }
}

testThirdPartyAPI();