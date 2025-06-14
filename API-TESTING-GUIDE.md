# API Testing Guide - Average Calculator Microservice

## 📋 Overview
This guide will help you test the Average Calculator Microservice using API clients like **Postman** or **Insomnia**. Follow the steps below to capture screenshots of API calls with request bodies, responses, and response times.

## 🚀 Getting Started

### Prerequisites
1. **API Client**: Download and install one of the following:
   - [Postman](https://www.postman.com/downloads/) (Recommended)
   - [Insomnia](https://insomnia.rest/download)
   - [Thunder Client](https://www.thunderclient.com/) (VS Code Extension)

2. **Server Running**: Make sure the server is running on `http://localhost:9876`

### Starting the Server
```bash
# Navigate to project directory
cd c:/Users/MCA/Desktop/med

# Start the pure Node.js server
node server-pure.js
```

## 🧪 API Endpoints to Test

### Base URL: `http://localhost:9876`

| Method | Endpoint | Description | Expected Response Time |
|--------|----------|-------------|----------------------|
| GET | `/` | API Documentation | < 10ms |
| GET | `/health` | Health Check | < 20ms |
| GET | `/stats` | Service Statistics | < 30ms |
| POST | `/reset` | Reset Window | < 50ms |
| GET | `/numbers/p` | Prime Numbers | < 600ms |
| GET | `/numbers/f` | Fibonacci Numbers | < 600ms |
| GET | `/numbers/e` | Even Numbers | < 600ms |
| GET | `/numbers/r` | Random Numbers | < 600ms |

## 📸 Screenshot Requirements

For each API call, capture screenshots showing:
1. **Request Details**: Method, URL, Headers
2. **Request Body**: (if applicable)
3. **Response Body**: Full JSON response
4. **Response Time**: Displayed in the API client
5. **Status Code**: HTTP status code

## 🔧 Testing Scenarios

### Scenario 1: Basic Health Check
```
Method: GET
URL: http://localhost:9876/health
Headers: Content-Type: application/json
Expected Status: 200 OK
Expected Response Time: < 20ms
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Average Calculator Microservice",
  "version": "1.0.0",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "uptime": 123.456,
  "windowSize": 0,
  "maxWindowSize": 10,
  "currentNumbers": [],
  "requestCount": 1,
  "lastRequestTime": "2024-XX-XXTXX:XX:XX.XXXZ",
  "memoryUsage": {
    "rss": 12345678,
    "heapTotal": 1234567,
    "heapUsed": 123456,
    "external": 12345,
    "arrayBuffers": 1234
  }
}
```

### Scenario 2: Prime Numbers (First Call)
```
Method: GET
URL: http://localhost:9876/numbers/p
Headers: Content-Type: application/json
Expected Status: 200 OK
Expected Response Time: < 600ms
```

**Expected Response:**
```json
{
  "windowPrevState": [],
  "windowCurrState": [2, 3, 5, 7],
  "numbers": [2, 3, 5, 7],
  "avg": 4.25
}
```

### Scenario 3: Fibonacci Numbers (Second Call)
```
Method: GET
URL: http://localhost:9876/numbers/f
Headers: Content-Type: application/json
Expected Status: 200 OK
Expected Response Time: < 600ms
```

**Expected Response:**
```json
{
  "windowPrevState": [2, 3, 5, 7],
  "windowCurrState": [2, 3, 5, 7, 1, 8, 13],
  "numbers": [1, 8, 13],
  "avg": 5.57
}
```

### Scenario 4: Reset Window
```
Method: POST
URL: http://localhost:9876/reset
Headers: Content-Type: application/json
Expected Status: 200 OK
Expected Response Time: < 50ms
```

**Expected Response:**
```json
{
  "message": "Window reset successfully",
  "previousSize": 7,
  "currentSize": 0,
  "previousNumbers": [2, 3, 5, 7, 1, 8, 13],
  "resetTime": "2024-XX-XXTXX:XX:XX.XXXZ"
}
```

### Scenario 5: Window Overflow Test
Make 15+ consecutive calls to different endpoints to test the sliding window behavior (max 10 numbers).

## 📊 Postman Collection Setup

### Creating a Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name: "Average Calculator Microservice"
4. Description: "API testing for sliding window average calculator"

### Adding Requests
For each endpoint, create a new request:

1. **Health Check**
   - Name: "Health Check"
   - Method: GET
   - URL: `{{baseUrl}}/health`

2. **Prime Numbers**
   - Name: "Get Prime Numbers"
   - Method: GET
   - URL: `{{baseUrl}}/numbers/p`

3. **Fibonacci Numbers**
   - Name: "Get Fibonacci Numbers"
   - Method: GET
   - URL: `{{baseUrl}}/numbers/f`

4. **Even Numbers**
   - Name: "Get Even Numbers"
   - Method: GET
   - URL: `{{baseUrl}}/numbers/e`

5. **Random Numbers**
   - Name: "Get Random Numbers"
   - Method: GET
   - URL: `{{baseUrl}}/numbers/r`

6. **Reset Window**
   - Name: "Reset Window"
   - Method: POST
   - URL: `{{baseUrl}}/reset`

7. **Statistics**
   - Name: "Get Statistics"
   - Method: GET
   - URL: `{{baseUrl}}/stats`

### Environment Variables
Create an environment with:
- Variable: `baseUrl`
- Value: `http://localhost:9876`

## 🎯 Testing Sequence for Screenshots

### Phase 1: Initial Setup
1. **Screenshot 1**: Health check (empty window)
2. **Screenshot 2**: Statistics (initial state)

### Phase 2: Window Population
3. **Screenshot 3**: First prime numbers call
4. **Screenshot 4**: First fibonacci numbers call
5. **Screenshot 5**: First even numbers call
6. **Screenshot 6**: First random numbers call

### Phase 3: Window Behavior
7. **Screenshot 7**: Second prime numbers call (showing window growth)
8. **Screenshot 8**: Statistics after multiple calls
9. **Screenshot 9**: Multiple consecutive calls to show sliding window

### Phase 4: Window Reset
10. **Screenshot 10**: Reset window call
11. **Screenshot 11**: Health check after reset

### Phase 5: Error Handling
12. **Screenshot 12**: Invalid endpoint (404 error)
13. **Screenshot 13**: Invalid number type

## 📝 Screenshot Naming Convention

Use this naming pattern for your screenshots:
- `01_health_check_initial.png`
- `02_stats_initial.png`
- `03_prime_numbers_first_call.png`
- `04_fibonacci_numbers_first_call.png`
- `05_even_numbers_first_call.png`
- `06_random_numbers_first_call.png`
- `07_prime_numbers_second_call.png`
- `08_stats_after_multiple_calls.png`
- `09_sliding_window_behavior.png`
- `10_reset_window.png`
- `11_health_check_after_reset.png`
- `12_invalid_endpoint_404.png`
- `13_invalid_number_type.png`

## 🔍 What to Look For

### Response Time Analysis
- Health check: Should be < 20ms
- Statistics: Should be < 30ms
- Number endpoints: Should be < 600ms (including mock data generation)
- Reset: Should be < 50ms

### Window Behavior Verification
- **Empty Window**: `windowPrevState: []`, `windowCurrState: []`, `avg: 0.00`
- **Growing Window**: Previous state should match previous current state
- **Full Window**: Should maintain exactly 10 numbers maximum
- **Sliding Window**: Oldest numbers should be removed when adding new ones

### Response Format Validation
All number endpoints should return:
```json
{
  "windowPrevState": [...],
  "windowCurrState": [...], 
  "numbers": [...],
  "avg": X.XX
}
```

## 🚨 Common Issues and Solutions

### Server Not Responding
- Check if server is running: `node server-pure.js`
- Verify port 9876 is not in use by another application
- Check firewall settings

### Slow Response Times
- Mock data should respond quickly (< 100ms)
- If using real API, timeouts are set to 500ms
- Network issues may cause delays

### Unexpected Window Behavior
- Verify unique number filtering is working
- Check that duplicates are not added to window
- Ensure sliding window maintains max 10 numbers

## 📤 Exporting Results

### Postman Export
1. Select your collection
2. Click "..." → "Export"
3. Choose "Collection v2.1"
4. Save as `average-calculator-postman-collection.json`

### Insomnia Export
1. Click "Application" → "Data" → "Export Data"
2. Select your workspace
3. Export as JSON

## ✅ Checklist for Complete Testing

- [ ] All 8 endpoints tested successfully
- [ ] Screenshots captured for each scenario
- [ ] Response times documented
- [ ] Window behavior verified
- [ ] Error handling tested
- [ ] Collection exported
- [ ] Screenshots organized and named properly

## 🎉 Success Criteria

Your testing is complete when you have:
1. ✅ 13+ screenshots showing different API scenarios
2. ✅ Response times under expected thresholds
3. ✅ Proper sliding window behavior demonstrated
4. ✅ Error handling verified
5. ✅ All endpoints returning correct JSON format
6. ✅ Postman/Insomnia collection exported

---

**Note**: Make sure to test YOUR microservice running on localhost:9876, not the external test server. The screenshots should show requests to your local implementation.