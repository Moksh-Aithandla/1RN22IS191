const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:9876';
const ENDPOINTS = [
    { method: 'GET', path: '/', name: 'API Documentation' },
    { method: 'GET', path: '/health', name: 'Health Check' },
    { method: 'GET', path: '/stats', name: 'Statistics' },
    { method: 'POST', path: '/reset', name: 'Reset Window' },
    { method: 'GET', path: '/numbers/p', name: 'Prime Numbers' },
    { method: 'GET', path: '/numbers/f', name: 'Fibonacci Numbers' },
    { method: 'GET', path: '/numbers/e', name: 'Even Numbers' },
    { method: 'GET', path: '/numbers/r', name: 'Random Numbers' }
];

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 9876,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

/**
 * Test single endpoint
 */
async function testEndpoint(endpoint) {
    const startTime = Date.now();
    
    try {
        const response = await makeRequest(endpoint.method, endpoint.path);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`\n✓ ${endpoint.name}`);
        console.log(`  ${endpoint.method} ${endpoint.path}`);
        console.log(`  Status: ${response.statusCode}`);
        console.log(`  Response Time: ${duration}ms`);
        
        if (response.statusCode === 200) {
            if (endpoint.path.startsWith('/numbers/')) {
                console.log(`  Window Previous: [${response.data.windowPrevState || []}]`);
                console.log(`  Window Current: [${response.data.windowCurrState || []}]`);
                console.log(`  New Numbers: [${response.data.numbers || []}]`);
                console.log(`  Average: ${response.data.avg || 0}`);
            } else if (endpoint.path === '/health') {
                console.log(`  Service: ${response.data.status}`);
                console.log(`  Window Size: ${response.data.windowSize}/${response.data.maxWindowSize}`);
                console.log(`  Uptime: ${Math.round(response.data.uptime)}s`);
            } else if (endpoint.path === '/reset') {
                console.log(`  Previous Size: ${response.data.previousSize}`);
                console.log(`  Current Size: ${response.data.currentSize}`);
            }
        } else {
            console.log(`  Error: ${response.data.error || 'Unknown error'}`);
        }
        
        return { success: true, duration, statusCode: response.statusCode };
        
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`\n✗ ${endpoint.name}`);
        console.log(`  ${endpoint.method} ${endpoint.path}`);
        console.log(`  Error: ${error.message}`);
        console.log(`  Duration: ${duration}ms`);
        
        return { success: false, duration, error: error.message };
    }
}

/**
 * Run comprehensive test suite
 */
async function runTests() {
    console.log('🧪 Average Calculator Microservice - Test Suite');
    console.log('================================================');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Test Time: ${new Date().toISOString()}\n`);

    const results = [];
    let totalDuration = 0;
    let successCount = 0;

    // Test each endpoint
    for (const endpoint of ENDPOINTS) {
        const result = await testEndpoint(endpoint);
        results.push({ endpoint, result });
        totalDuration += result.duration;
        
        if (result.success) {
            successCount++;
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Test sliding window behavior with multiple requests
    console.log('\n🔄 Testing Sliding Window Behavior');
    console.log('===================================');
    
    const windowTests = [
        { path: '/numbers/p', name: 'Prime #1' },
        { path: '/numbers/f', name: 'Fibonacci #1' },
        { path: '/numbers/e', name: 'Even #1' },
        { path: '/numbers/r', name: 'Random #1' },
        { path: '/numbers/p', name: 'Prime #2' },
        { path: '/numbers/f', name: 'Fibonacci #2' }
    ];

    for (const test of windowTests) {
        const result = await testEndpoint({ method: 'GET', ...test });
        totalDuration += result.duration;
        
        if (result.success) {
            successCount++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Final statistics
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log(`Total Tests: ${results.length + windowTests.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${results.length + windowTests.length - successCount}`);
    console.log(`Success Rate: ${Math.round((successCount / (results.length + windowTests.length)) * 100)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Average Response Time: ${Math.round(totalDuration / (results.length + windowTests.length))}ms`);

    // Final health check
    console.log('\n🏥 Final Health Check');
    console.log('=====================');
    await testEndpoint({ method: 'GET', path: '/health', name: 'Final Health Check' });
    
    console.log('\n✅ Test Suite Completed!');
    
    if (successCount === results.length + windowTests.length) {
        console.log('🎉 All tests passed successfully!');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Check the logs above.');
        process.exit(1);
    }
}

// Check if server is running before starting tests
async function checkServerHealth() {
    try {
        await makeRequest('GET', '/health');
        console.log('✓ Server is running and healthy');
        return true;
    } catch (error) {
        console.log('✗ Server is not running or not responding');
        console.log('Please start the server first: node server-pure.js');
        return false;
    }
}

// Main execution
async function main() {
    const isHealthy = await checkServerHealth();
    
    if (isHealthy) {
        await runTests();
    } else {
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { makeRequest, testEndpoint, runTests };