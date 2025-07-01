// Import the Express.js library
const express = require('express');
// Create an Express application instance
const app = express();
// Define the port the server will listen on
const PORT = 8080;

// Initialize a random number generator
const random = {
    integer: (options) => Math.floor(Math.random() * (options.max - options.min + 1)) + options.min,
    floating: (options) => Math.random() * (options.max - options.min) + options.min,
    pickone: (arr) => arr[Math.floor(Math.random() * arr.length)]
};


/**
 * Represents a single dummy weather data record.
 * This is a conceptual structure; in JavaScript, we use plain objects.
 */
// interface WeatherReading {
//     city: string;
//     timestamp: string; // ISO 8601 string
//     temperature: number; // Celsius
//     humidity: number;    // Percentage
//     condition: string;
// }

/**
 * Represents the API response structure.
 * This is a conceptual structure; in JavaScript, we use plain objects.
 */
// interface DataResponse {
//     readings?: WeatherReading[];
//     message?: string;
// }

/**
 * Generates a list of dummy WeatherReading objects.
 * @param {number} count The number of readings to generate.
 * @returns {Array<Object>} A list of dummy weather reading objects.
 */
function generateDummyWeatherReadings(count) {
    const readings = [];
    const cities = ["New York", "London", "Paris", "Tokyo", "Sydney", "Lagos", "Dubai", "Rio"];
    const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Stormy", "Foggy", "Snowy"];

    for (let i = 0; i < count; i++) {
        // Simulate readings +/- 12 hours from now
        const timestamp = new Date(Date.now() + random.integer({ min: -12, max: 12 }) * 60 * 60 * 1000).toISOString();

        readings.push({
            city: random.pickone(cities),
            timestamp: timestamp,
            temperature: parseFloat(random.floating({ min: 5, max: 40 }).toFixed(2)), // 5.0 to 40.0 Celsius, 2 decimal places
            humidity: random.integer({ min: 20, max: 99 }), // 20% to 99%
            condition: random.pickone(conditions),
        });
    }
    return readings;
}

/**
 * Randomly selects a 2xx, 4xx, or 5xx HTTP status code.
 * @returns {number} An HTTP status code.
 */
function getResponseStatusCode() {
    const statusCodes2xx = [200, 201, 202, 204];
    const statusCodes4xx = [400, 401, 404, 403, 405];
    const statusCodes5xx = [500, 501, 502, 503, 504];

    // Randomly decide the type of response: 2xx, 4xx, or 5xx
    // Weights: 70% 2xx, 15% 4xx, 15% 5xx
    const randomNumber = random.integer({ min: 0, max: 99 }); // 0-99
    if (randomNumber < 70) {      // 70% chance for 2xx
        return random.pickone(statusCodes2xx);
    } else if (randomNumber < 85) { // 15% chance for 4xx (70-84)
        return random.pickone(statusCodes4xx);
    } else { // 15% chance for 5xx (85-99)
        return random.pickone(statusCodes5xx);
    }
}

/**
 * Handles requests to the /weather endpoint.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
app.get('/weather', async (req, res) => {
    // Set Content-Type header to application/json
    res.setHeader('Content-Type', 'application/json');

    // Get response size from query parameter, default to 10 if not provided or invalid.
    let size = parseInt(req.query.size, 10);
    if (isNaN(size) || size < 10 || size > 100) {
        console.log(`Invalid or missing 'size' parameter, defaulting to 10. Received: ${req.query.size}`);
        size = 10; // Default size
    }

    // Introduce a random delay between 0 and 5 seconds
    const delayMs = random.integer({ min: 0, max: 5000 }); // 0 to 5000 milliseconds
    console.log(`Introducing a delay of ${delayMs}ms for this request.`);
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Get a random status code
    const statusCode = getResponseStatusCode();
    res.status(statusCode); // Set the HTTP status code

    let responseData = {};

    // Depending on the status code, provide appropriate response body
    if (statusCode >= 200 && statusCode < 300) {
        const readings = generateDummyWeatherReadings(size);
        responseData = {
            readings: readings,
            message: `Successfully retrieved ${readings.length} weather readings.`,
        };
        console.log(`Responding with ${statusCode} status code and ${readings.length} weather readings.`);
    } else {
        // For 4xx and 5xx errors, provide a generic error message.
        const errorMessage = `An error occurred with status code ${statusCode}. This is a dummy error for testing.`;
        responseData = {
            message: errorMessage,
        };
        console.log(`Responding with ${statusCode} status code and error message: ${errorMessage}`);
    }

    // Send the JSON response
    res.json(responseData);
});

/**
 * Handles requests to the /health endpoint.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
app.get('/health', (req, res) => {
    res.send('Healthy');
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Node.js Express.js API server listening on port ${PORT}`);
    console.log(`Access weather data at http://localhost:${PORT}/weather`);
    console.log(`Access health check at http://localhost:${PORT}/health`);
});
