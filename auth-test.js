// Test different authentication methods
const axios = require('axios');

const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service';
const CLIENT_ID = '80a11fb4-90a4-49b2-b0a4-06c17472da43';
const CLIENT_SECRET = 'mseaCctRdjFfyQvh';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5ODc4OTI0LCJpYXQiOjE3NDk4Nzg2MjQsImlzcyI6IkFmZm9yZG1lZCIsInN1YiI6ImlybjIyaXMxOTEubW9rc2hhbkBybnNpdC5hYy5pbiJ9LCJjb21wYW55TmFtZSI6IlJOUyBJbnN0aXR1dGUgT2YgVGVjaG5vbG9neSIsImNsaWVudElEIjoiODBhMTFmYjQtOTBhNC00OWIyLWIwYTQtMDZjMTc0NzJkYTQzIiwiY2xpZW50U2VjcmV0IjoibXNlYUNjdFJkakZmeVF2aCIsIm93bmVyTmFtZSI6Im1va3NoIGEgbiIsIm93bmVyRW1haWwiOiJpcm4yMmlzMTkxLm1va3NoYW5Acm5zaXQuYWMuaW4iLCJyb2xsTm8iOiIxcm4yMmlzMTkxIn0.pmVsEhVBBhHFJgLGXBdXTQHtmseaCctRdjFfyQvh';

async function testAuthMethods() {
    const authMethods = [
        {
            name: 'Bearer Token',
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        },
        {
            name: 'Client Credentials',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        },
        {
            name: 'Custom Headers',
            headers: {
                'X-Client-ID': CLIENT_ID,
                'X-Client-Secret': CLIENT_SECRET,
                'Content-Type': 'application/json'
            }
        },
        {
            name: 'JWT without Bearer',
            headers: {
                'Authorization': JWT_TOKEN,
                'Content-Type': 'application/json'
            }
        }
    ];

    for (const method of authMethods) {
        console.log(`\n--- Testing ${method.name} ---`);
        
        try {
            const response = await axios.get(`${TEST_SERVER_BASE_URL}/primes`, {
                timeout: 1000,
                headers: method.headers
            });
            console.log(`✓ Success: ${JSON.stringify(response.data)}`);
            return method; // Return the working method
        } catch (error) {
            if (error.response) {
                console.log(`✗ Status ${error.response.status}: ${error.message}`);
                if (error.response.data && typeof error.response.data === 'object') {
                    console.log(`  Data: ${JSON.stringify(error.response.data)}`);
                }
            } else {
                console.log(`✗ Error: ${error.message}`);
            }
        }
    }
    
    return null;
}

testAuthMethods().then(workingMethod => {
    if (workingMethod) {
        console.log(`\n🎉 Working authentication method: ${workingMethod.name}`);
    } else {
        console.log('\n❌ No working authentication method found');
    }
});