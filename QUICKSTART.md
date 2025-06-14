# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- npm

## Installation & Running

1. **Clone the repository:**
```bash
git clone https://github.com/Moksh-Aithandla/evaluation.git
cd evaluation
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the server:**
```bash
npm start
```

The server will start on port 9876.

## Testing the API

### Using curl (if available):
```bash
# Test prime numbers
curl http://localhost:9876/numbers/p

# Test fibonacci numbers
curl http://localhost:9876/numbers/f

# Test even numbers
curl http://localhost:9876/numbers/e

# Test random numbers
curl http://localhost:9876/numbers/r

# Check health
curl http://localhost:9876/health
```

### Using PowerShell:
```powershell
# Test prime numbers
Invoke-WebRequest -Uri "http://localhost:9876/numbers/p" -Method GET

# Test fibonacci numbers
Invoke-WebRequest -Uri "http://localhost:9876/numbers/f" -Method GET

# Check health
Invoke-WebRequest -Uri "http://localhost:9876/health" -Method GET
```

### Using the test script:
```bash
node test.js
```

## API Response Format

```json
{
  "windowPrevState": [1, 3, 5],
  "windowCurrState": [1, 3, 5, 7, 11],
  "numbers": [7, 11],
  "avg": 5.40
}
```

## Features Implemented

✅ **REST API Endpoint**: `/numbers/{numberid}` where numberid can be p, f, e, or r  
✅ **Sliding Window**: Maintains up to 10 unique numbers  
✅ **Third-party Integration**: Fetches from http://20.244.56.144/evaluation-service  
✅ **Timeout Handling**: Ignores responses taking more than 500ms  
✅ **Duplicate Filtering**: Only stores unique numbers  
✅ **Average Calculation**: Calculates average of numbers in window  
✅ **State Tracking**: Returns both previous and current window states  
✅ **Error Handling**: Graceful handling of network errors and timeouts  

## Troubleshooting

If you encounter authentication issues with the third-party API, you may need to:
1. Check if your JWT token has expired
2. Re-register to get a new token
3. Update the `AUTH_TOKEN` in `server.js`

## Development

For development with auto-reload:
```bash
npm run dev
```

This requires nodemon to be installed.