const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9876;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service';

// Authorization token from your registration
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5ODc4OTI0LCJpYXQiOjE3NDk4Nzg2MjQsImlzcyI6IkFmZm9yZG1lZCIsInN1YiI6ImlybjIyaXMxOTEubW9rc2hhbkBybnNpdC5hYy5pbiJ9LCJjb21wYW55TmFtZSI6IlJOUyBJbnN0aXR1dGUgT2YgVGVjaG5vbG9neSIsImNsaWVudElEIjoiODBhMTFmYjQtOTBhNC00OWIyLWIwYTQtMDZjMTc0NzJkYTQzIiwiY2xpZW50U2VjcmV0IjoibXNlYUNjdFJkakZmeVF2aCIsIm93bmVyTmFtZSI6Im1va3NoIGEgbiIsIm93bmVyRW1haWwiOiJpcm4yMmlzMTkxLm1va3NoYW5Acm5zaXQuYWMuaW4iLCJyb2xsTm8iOiIxcm4yMmlzMTkxIn0.pmVsEhVBBhHFJgLGXBdXTQHtmseaCctRdjFfyQvh';

// In-memory storage for the sliding window
let numbersWindow = [];

// Number type mappings
const NUMBER_TYPES = {
    'p': 'primes',
    'f': 'fibo',
    'e': 'even',
    'r': 'rand'
};

/**
 * Fetch numbers from the test server with timeout
 */
async function fetchNumbersFromServer(numberType) {
    try {
        const endpoint = `${TEST_SERVER_BASE_URL}/numbers/${numberType}`;
        
        const response = await axios.get(endpoint, {
            timeout: TIMEOUT_MS,
            headers: {
                'Authorization': AUTH_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        return response.data.numbers || [];
    } catch (error) {
        console.log(`Failed to fetch ${numberType} numbers:`, error.message);
        return [];
    }
}

/**
 * Add unique numbers to the sliding window
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
 * Calculate average of numbers in the window
 */
function calculateAverage() {
    if (numbersWindow.length === 0) {
        return 0.00;
    }
    
    const sum = numbersWindow.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbersWindow.length).toFixed(2));
}

/**
 * Main endpoint handler
 */
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    
    // Validate number ID
    if (!NUMBER_TYPES[numberid]) {
        return res.status(400).json({
            error: 'Invalid number ID. Use p (prime), f (fibonacci), e (even), or r (random)'
        });
    }
    
    try {
        // Fetch numbers from the test server
        const fetchedNumbers = await fetchNumbersFromServer(NUMBER_TYPES[numberid]);
        
        // Update the sliding window
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
        
        console.log(`Request for ${numberid} (${NUMBER_TYPES[numberid]}):`, {
            fetched: fetchedNumbers.length,
            unique: windowUpdate.newNumbers.length,
            windowSize: windowUpdate.currentState.length,
            average
        });
        
        res.json(response);
        
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            error: 'Internal server error',
            windowPrevState: [...numbersWindow],
            windowCurrState: [...numbersWindow],
            numbers: [],
            avg: calculateAverage()
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        windowSize: numbersWindow.length,
        maxWindowSize: WINDOW_SIZE,
        currentNumbers: [...numbersWindow]
    });
});

/**
 * Reset window endpoint (for testing)
 */
app.post('/reset', (req, res) => {
    numbersWindow = [];
    res.json({
        message: 'Window reset successfully',
        windowSize: 0
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Average Calculator Microservice running on port ${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  GET /numbers/p - Prime numbers`);
    console.log(`  GET /numbers/f - Fibonacci numbers`);
    console.log(`  GET /numbers/e - Even numbers`);
    console.log(`  GET /numbers/r - Random numbers`);
    console.log(`  GET /health - Health check`);
    console.log(`  POST /reset - Reset window (for testing)`);
    console.log(`Window size: ${WINDOW_SIZE}, Timeout: ${TIMEOUT_MS}ms`);
});

module.exports = app;