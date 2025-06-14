# Average Calculator Microservice

A REST API microservice that calculates the average of numbers fetched from a third-party server using a sliding window approach.

## Features

- **Sliding Window**: Maintains a window of up to 10 unique numbers
- **Multiple Number Types**: Supports prime (p), fibonacci (f), even (e), and random (r) numbers
- **Timeout Protection**: Ignores responses taking more than 500ms
- **Duplicate Filtering**: Only stores unique numbers
- **State Tracking**: Returns both previous and current window states

## API Endpoints

### GET /numbers/{numberid}

Fetches numbers of the specified type and returns the average calculation.

**Parameters:**
- `numberid`: Type of numbers to fetch
  - `p` - Prime numbers
  - `f` - Fibonacci numbers  
  - `e` - Even numbers
  - `r` - Random numbers

**Response Format:**
```json
{
  "windowPrevState": [1, 3, 5],
  "windowCurrState": [1, 3, 5, 7, 11],
  "numbers": [7, 11],
  "avg": 5.40
}
```

### GET /health

Returns the current status of the service and window information.

### POST /reset

Resets the sliding window (useful for testing).

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on port 9876 by default.

## Configuration

- **Window Size**: 10 numbers (configurable via WINDOW_SIZE constant)
- **Timeout**: 500ms for third-party API calls
- **Port**: 9876 (configurable via PORT environment variable)

## Third-Party Server

The service fetches numbers from: `http://20.244.56.144/evaluation-service`

Endpoints used:
- `/numbers/primes` - Prime numbers
- `/numbers/fibo` - Fibonacci numbers
- `/numbers/even` - Even numbers
- `/numbers/rand` - Random numbers

## Example Usage

```bash
# Fetch prime numbers
curl http://localhost:9876/numbers/p

# Fetch fibonacci numbers
curl http://localhost:9876/numbers/f

# Check service health
curl http://localhost:9876/health

# Reset window
curl -X POST http://localhost:9876/reset
```

## Error Handling

- Invalid number IDs return 400 Bad Request
- Server errors return 500 with current window state
- Network timeouts are handled gracefully
- Duplicate numbers are automatically filtered

## Implementation Details

- Uses Express.js for the REST API
- Axios for HTTP requests with timeout support
- In-memory storage for the sliding window
- CORS enabled for cross-origin requests
- Comprehensive error handling and logging