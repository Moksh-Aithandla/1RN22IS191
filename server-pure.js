const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Configuration
const PORT = process.env.PORT || 9876;
const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service';

// Authorization token
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5ODc4OTI0LCJpYXQiOjE3NDk4Nzg2MjQsImlzcyI6IkFmZm9yZG1lZCIsInN1YiI6ImlybjIyaXMxOTEubW9rc2hhbkBybnNpdC5hYy5pbiJ9LCJjb21wYW55TmFtZSI6IlJOUyBJbnN0aXR1dGUgT2YgVGVjaG5vbG9neSIsImNsaWVudElEIjoiODBhMTFmYjQtOTBhNC00OWIyLWIwYTQtMDZjMTc0NzJkYTQzIiwiY2xpZW50U2VjcmV0IjoibXNlYUNjdFJkakZmeVF2aCIsIm93bmVyTmFtZSI6Im1va3NoIGEgbiIsIm93bmVyRW1haWwiOiJpcm4yMmlzMTkxLm1va3NoYW5Acm5zaXQuYWMuaW4iLCJyb2xsTm8iOiIxcm4yMmlzMTkxIn0.pmVsEhVBBhHFJgLGXBdXTQHtmseaCctRdjFfyQvh';

// In-memory storage
let numbersWindow = [];
let requestCount = 0;
let lastRequestTime = null;

// Number type mappings
const NUMBER_TYPES = {
    'p': 'primes',
    'f': 'fibo', 
    'e': 'even',
    'r': 'rand'
};

// Mock data for demonstration (when third-party API fails)
const MOCK_DATA = {
    primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71],
    fibo: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765],
    even: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40],
    rand: [15, 42, 73, 91, 28, 56, 84, 12, 67, 39, 88, 21, 95, 33, 77, 64, 18, 92, 45, 76]
};

/**
 * Generate mock numbers for demonstration
 */
function generateMockNumbers(numberType) {
    const data = MOCK_DATA[numberType] || [];
    const count = Math.floor(Math.random() * 4) + 2; // 2-5 numbers
    const startIndex = Math.floor(Math.random() * (data.length - count));
    return data.slice(startIndex, startIndex + count);
}

/**
 * Make HTTP request with timeout (Pure Node.js)
 */
function makeHttpRequest(requestUrl, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(requestUrl);
        const isHttps = parsedUrl.protocol === 'https:';
        const httpModule = isHttps ? https : http;
        
        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.path,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: options.timeout || TIMEOUT_MS
        };

        const req = httpModule.request(requestOptions, (res) => {
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

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

/**
 * Fetch numbers from test server with fallback to mock data
 */
async function fetchNumbersFromServer(numberType) {
    try {
        const endpoint = `${TEST_SERVER_BASE_URL}/numbers/${numberType}`;
        
        const response = await makeHttpRequest(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': AUTH_TOKEN,
                'Content-Type': 'application/json'
            },
            timeout: TIMEOUT_MS
        });

        if (response.statusCode === 200 && response.data && response.data.numbers) {
            console.log(`✓ Successfully fetched ${numberType} from server:`, response.data.numbers);
            return response.data.numbers;
        } else {
            throw new Error(`Server returned status ${response.statusCode}`);
        }
    } catch (error) {
        console.log(`⚠ Failed to fetch ${numberType} from server (${error.message}), using mock data`);
        
        // Use mock data for demonstration
        const mockNumbers = generateMockNumbers(numberType);
        console.log(`📝 Generated mock ${numberType}:`, mockNumbers);
        return mockNumbers;
    }
}

/**
 * Add unique numbers to sliding window
 */
function addNumbersToWindow(newNumbers) {
    const previousState = [...numbersWindow];
    
    // Filter out duplicates and add new unique numbers
    const uniqueNewNumbers = newNumbers.filter(num => !numbersWindow.includes(num));
    
    // Add new numbers to the window
    numbersWindow.push(...uniqueNewNumbers);
    
    // Maintain window size - remove oldest numbers if exceeding limit
    if (numbersWindow.length > WINDOW_SIZE) {
        const excess = numbersWindow.length - WINDOW_SIZE;
        numbersWindow = numbersWindow.slice(excess);
    }
    
    return {
        previousState,
        currentState: [...numbersWindow],
        newNumbers: uniqueNewNumbers
    };
}

/**
 * Calculate average of numbers in window
 */
function calculateAverage() {
    if (numbersWindow.length === 0) {
        return 0.00;
    }
    
    const sum = numbersWindow.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbersWindow.length).toFixed(2));
}

/**
 * Parse request body
 */
function parseRequestBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                resolve({});
            }
        });
    });
}

/**
 * Send JSON response
 */
function sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data, null, 2));
}

/**
 * Log request details
 */
function logRequest(req, startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    requestCount++;
    lastRequestTime = new Date().toISOString();
    
    console.log(`\n📊 Request #${requestCount}:`);
    console.log(`   Method: ${req.method}`);
    console.log(`   URL: ${req.url}`);
    console.log(`   Time: ${lastRequestTime}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   User-Agent: ${req.headers['user-agent'] || 'Unknown'}`);
}

/**
 * Main request handler
 */
async function handleRequest(req, res) {
    const startTime = Date.now();
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    try {
        // Route: GET /numbers/{numberid}
        if (method === 'GET' && pathname.startsWith('/numbers/')) {
            const numberid = pathname.split('/')[2];
            
            if (!NUMBER_TYPES[numberid]) {
                logRequest(req, startTime);
                return sendJsonResponse(res, 400, {
                    error: 'Invalid number ID. Use p (prime), f (fibonacci), e (even), or r (random)',
                    validIds: Object.keys(NUMBER_TYPES)
                });
            }

            // Fetch numbers from server (with mock fallback)
            const fetchedNumbers = await fetchNumbersFromServer(NUMBER_TYPES[numberid]);
            
            // Update sliding window
            const windowUpdate = addNumbersToWindow(fetchedNumbers);
            
            // Calculate average
            const average = calculateAverage();
            
            // Prepare response
            const response = {
                windowPrevState: windowUpdate.previousState,
                windowCurrState: windowUpdate.currentState,
                numbers: windowUpdate.newNumbers,
                avg: average
            };
            
            console.log(`\n🔄 Processing ${numberid} (${NUMBER_TYPES[numberid]}):`);
            console.log(`   Fetched: ${fetchedNumbers.length} numbers`);
            console.log(`   Unique new: ${windowUpdate.newNumbers.length} numbers`);
            console.log(`   Window size: ${windowUpdate.currentState.length}/${WINDOW_SIZE}`);
            console.log(`   Average: ${average}`);
            
            logRequest(req, startTime);
            return sendJsonResponse(res, 200, response);
        }
        
        // Route: GET /health
        else if (method === 'GET' && pathname === '/health') {
            const response = {
                status: 'healthy',
                service: 'Average Calculator Microservice',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                windowSize: numbersWindow.length,
                maxWindowSize: WINDOW_SIZE,
                currentNumbers: [...numbersWindow],
                requestCount: requestCount,
                lastRequestTime: lastRequestTime,
                memoryUsage: process.memoryUsage()
            };
            
            logRequest(req, startTime);
            return sendJsonResponse(res, 200, response);
        }
        
        // Route: POST /reset
        else if (method === 'POST' && pathname === '/reset') {
            const previousSize = numbersWindow.length;
            const previousNumbers = [...numbersWindow];
            numbersWindow = [];
            
            const response = {
                message: 'Window reset successfully',
                previousSize,
                currentSize: 0,
                previousNumbers,
                resetTime: new Date().toISOString()
            };
            
            console.log(`🔄 Window reset: ${previousSize} → 0 numbers`);
            logRequest(req, startTime);
            return sendJsonResponse(res, 200, response);
        }
        
        // Route: GET /stats
        else if (method === 'GET' && pathname === '/stats') {
            const response = {
                service: 'Average Calculator Microservice Statistics',
                currentWindow: {
                    size: numbersWindow.length,
                    maxSize: WINDOW_SIZE,
                    numbers: [...numbersWindow],
                    average: calculateAverage()
                },
                requests: {
                    total: requestCount,
                    lastRequestTime: lastRequestTime
                },
                system: {
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                    nodeVersion: process.version,
                    platform: process.platform
                },
                configuration: {
                    port: PORT,
                    windowSize: WINDOW_SIZE,
                    timeout: TIMEOUT_MS,
                    testServerUrl: TEST_SERVER_BASE_URL
                }
            };
            
            logRequest(req, startTime);
            return sendJsonResponse(res, 200, response);
        }
        
        // Route: GET / (API Documentation)
        else if (method === 'GET' && pathname === '/') {
            const response = {
                service: 'Average Calculator Microservice',
                version: '1.0.0',
                description: 'A microservice that calculates rolling averages using a sliding window',
                endpoints: {
                    'GET /numbers/p': 'Fetch prime numbers and update window',
                    'GET /numbers/f': 'Fetch fibonacci numbers and update window',
                    'GET /numbers/e': 'Fetch even numbers and update window',
                    'GET /numbers/r': 'Fetch random numbers and update window',
                    'GET /health': 'Service health check',
                    'GET /stats': 'Service statistics',
                    'POST /reset': 'Reset the sliding window',
                    'GET /': 'This API documentation'
                },
                examples: {
                    'Prime numbers': 'GET /numbers/p',
                    'Health check': 'GET /health',
                    'Reset window': 'POST /reset'
                },
                responseFormat: {
                    windowPrevState: 'Array of numbers before update',
                    windowCurrState: 'Array of numbers after update',
                    numbers: 'Array of new unique numbers added',
                    avg: 'Average of all numbers in current window'
                }
            };
            
            logRequest(req, startTime);
            return sendJsonResponse(res, 200, response);
        }
        
        // 404 - Not Found
        else {
            const response = {
                error: 'Endpoint not found',
                method: method,
                path: pathname,
                availableEndpoints: [
                    'GET /numbers/p - Prime numbers',
                    'GET /numbers/f - Fibonacci numbers',
                    'GET /numbers/e - Even numbers',
                    'GET /numbers/r - Random numbers',
                    'GET /health - Health check',
                    'GET /stats - Service statistics',
                    'POST /reset - Reset window',
                    'GET / - API documentation'
                ]
            };
            
            logRequest(req, startTime);
            return sendJsonResponse(res, 404, response);
        }
        
    } catch (error) {
        console.error('Error processing request:', error);
        
        const response = {
            error: 'Internal server error',
            message: error.message,
            windowPrevState: [...numbersWindow],
            windowCurrState: [...numbersWindow],
            numbers: [],
            avg: calculateAverage()
        };
        
        logRequest(req, startTime);
        return sendJsonResponse(res, 500, response);
    }
}

// Create HTTP server
const server = http.createServer(handleRequest);

// Start server
server.listen(PORT, () => {
    console.log(`\n🚀 Average Calculator Microservice (Pure Node.js)`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`\n📋 Available Endpoints:`);
    console.log(`   GET  /              - API Documentation`);
    console.log(`   GET  /numbers/p     - Prime numbers`);
    console.log(`   GET  /numbers/f     - Fibonacci numbers`);
    console.log(`   GET  /numbers/e     - Even numbers`);
    console.log(`   GET  /numbers/r     - Random numbers`);
    console.log(`   GET  /health        - Health check`);
    console.log(`   GET  /stats         - Service statistics`);
    console.log(`   POST /reset         - Reset window`);
    console.log(`\n⚙️  Configuration:`);
    console.log(`   Window size: ${WINDOW_SIZE}`);
    console.log(`   Timeout: ${TIMEOUT_MS}ms`);
    console.log(`   Third-party API: ${TEST_SERVER_BASE_URL}`);
    console.log(`\n💡 Features:`);
    console.log(`   ✓ Pure Node.js (no external dependencies)`);
    console.log(`   ✓ Sliding window algorithm`);
    console.log(`   ✓ Mock data fallback`);
    console.log(`   ✓ CORS enabled`);
    console.log(`   ✓ Request logging`);
    console.log(`   ✓ Error handling`);
    console.log(`\n🧪 Test with: curl http://localhost:${PORT}/health`);
    console.log(`📊 Monitor at: http://localhost:${PORT}/stats\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});

module.exports = server;