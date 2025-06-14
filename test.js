const axios = require('axios');

const BASE_URL = 'http://localhost:9876';

async function testEndpoint(numberType, description) {
    try {
        console.log(`\n--- Testing ${description} ---`);
        const response = await axios.get(`${BASE_URL}/numbers/${numberType}`);
        
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log(`Previous window size: ${response.data.windowPrevState.length}`);
        console.log(`Current window size: ${response.data.windowCurrState.length}`);
        console.log(`New numbers added: ${response.data.numbers.length}`);
        console.log(`Average: ${response.data.avg}`);
        
    } catch (error) {
        console.error(`Error testing ${description}:`, error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

async function testHealthEndpoint() {
    try {
        console.log('\n--- Testing Health Endpoint ---');
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('Health Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error testing health endpoint:', error.message);
    }
}

async function resetWindow() {
    try {
        console.log('\n--- Resetting Window ---');
        const response = await axios.post(`${BASE_URL}/reset`);
        console.log('Reset Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error resetting window:', error.message);
    }
}

async function runTests() {
    console.log('Starting Average Calculator Microservice Tests');
    console.log('Make sure the server is running on port 9876');
    
    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test health endpoint first
    await testHealthEndpoint();
    
    // Reset window to start fresh
    await resetWindow();
    
    // Test different number types
    await testEndpoint('p', 'Prime Numbers');
    await testEndpoint('f', 'Fibonacci Numbers');
    await testEndpoint('e', 'Even Numbers');
    await testEndpoint('r', 'Random Numbers');
    
    // Test the same type again to see window behavior
    await testEndpoint('p', 'Prime Numbers (Second Call)');
    
    // Test health again to see final state
    await testHealthEndpoint();
    
    console.log('\n--- Tests Completed ---');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testEndpoint, testHealthEndpoint, resetWindow };