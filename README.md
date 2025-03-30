# Mini Data Query Simulation Engine

A lightweight backend service that simulates a simplified version of a Gen AI Analytics data query system. This service allows non-technical users to query databases using natural language, eliminating dependency on data teams.

## Features

- Natural language to SQL query translation
- Mock database with sample data
- API endpoints for query processing, explanation, and validation
- Authentication using JWT
- Comprehensive error handling
- Detailed query explanation and insights

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **SQLite**: Lightweight database (in-memory for this simulation)
- **JWT**: Authentication mechanism
- **Bcrypt**: Password hashing

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user
  - Request Body: `{ "username": "user", "password": "password" }`
  - Response: `{ "success": true, "token": "jwt_token" }`

- **POST /api/auth/login**: Login an existing user
  - Request Body: `{ "username": "user", "password": "password" }`
  - Response: `{ "success": true, "token": "jwt_token" }`

### Query Processing

All query endpoints require authentication with a JWT token in the Authorization header:
`Authorization: Bearer your_jwt_token`

- **POST /api/query**: Process a natural language query
  - Request Body: `{ "query": "Show me sales from last month" }`
  - Response: 
    ```json
    {
      "success": true,
      "queryType": "sales_report",
      "explanation": "This query retrieves sales information for last month...",
      "results": [...],
      "metadata": {
        "rowCount": 5,
        "parameters": { "timePeriod": "last month" },
        "executionTime": "2025-03-30T12:00:00.000Z"
      },
      "insights": [
        "Total sales amount: $5,000.00",
        "Top selling product: Laptop with 10 units sold"
      ]
    }
    ```

- **POST /api/explain**: Explain how a query would be processed
  - Request Body: `{ "query": "What is the revenue in February?" }`
  - Response:
    ```json
    {
      "success": true,
      "explanation": {
        "originalQuery": "What is the revenue in February?",
        "interpretedAs": "revenue_report",
        "parameters": { "timePeriod": "February" },
        "explanation": "This query calculates the total revenue for February...",
        "sqlQuery": "SELECT SUM(total_amount) as total_revenue..."
      }
    }
    ```

- **POST /api/validate**: Check if a query can be processed
  - Request Body: `{ "query": "How many laptops do we have in stock?" }`
  - Response:
    ```json
    {
      "success": true,
      "validation": {
        "isValid": true,
        "confidence": 0.85,
        "queryType": "inventory_check",
        "possibleInterpretation": "This query checks the current inventory levels...",
        "feedback": "This query can be processed successfully."
      }
    }
    ```

- **GET /api/schema**: Get database schema information
  - Response:
    ```json
    {
      "success": true,
      "schemas": {
        "products": [
          {"name": "id", "type": "INTEGER", "pk": 1},
          {"name": "name", "type": "TEXT", "notnull": 1},
          ...
        ],
        "sales": [
          {"name": "id", "type": "INTEGER", "pk": 1},
          {"name": "product_id", "type": "INTEGER", "notnull": 1},
          ...
        ]
      }
    }
    ```

## Sample Queries

Here are some example queries you can try:

### 1. Sales Queries

-   "Sales in January"
-   "Sales from February"
-   "Sales in March"
-   "Sales from last month"
-   "Sales from last year"
-   "Sales in Jan"
-   "Sales from Feb"
-   "Sales in Mar"
-   "What were our sales in January?"
-   "Display all sales from February"

### 2. Inventory Queries

-   "How many laptops do we have in stock"
-   "Inventory of electronics"
-   "Stock of t-shirts"
-   "How many products do we have available"
-   "Inventory of laptop"
-   "How many smartphones do we have available"
-   "How many laptops available"
-   "Check inventory of electronics"
-   "What's the current stock of t-shirts?"

### 3. Top Products Queries

-   "What are the top 3 products"
-   "Show me the top 5 selling products"
-   "List the top 10 products"
-   "What are our top 5 selling products?"
-   "Show me the top 3 products"
-   "List top 10 products by sales"

### 4. Revenue Queries

-   "What is the revenue in January"
-   "Calculate the revenue from February"
-   "Show me the total revenue for March"
-   "What is the revenue in last month"
-   "Calculate the revenue from last year"
-   "Show me the total sales for January"
-   "What is the revenue from Jan"
-   "Calculate the total revenue for Feb"
-   "Show me the total revenue for Mar"
-   "What is our total revenue in March?"
-   "Calculate the revenue from last month"
-   "Show me the revenue for February"

### 5. Customer Queries

-   "Who are the customers from New York"
-   "Show me the clients in Chicago"
-   "List the customers from Miami"
-   "Who are our customers in New York?"
-   "Show me clients from Chicago"
-   "List customers from Miami"
-   "Who are the clients from Seattle"
-   "Show me the customers in Los Angeles"
-   "List the customers from New York"
-   "Who are the clients from chicago"


## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mini-data-query-engine.git
   cd mini-data-query-engine
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=24h
   DB_PATH=:memory:
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

The server will start on http://localhost:3000

### Running Tests

The project includes comprehensive unit and integration tests:

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Testing with Curl

1. Register a user:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"password123"}'
   ```

2. Login to get a token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"password123"}'
   ```

3. Process a query:
   ```bash
   curl -X POST http://localhost:3000/api/query \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"query":"Show me sales from last month"}'
   ```

4. Explain a query:
   ```bash
   curl -X POST http://localhost:3000/api/explain \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"query":"What is our revenue in February?"}'
   ```

5. Validate a query:
   ```bash
   curl -X POST http://localhost:3000/api/validate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"query":"How many laptops do we have in stock?"}'
   ```

## Deployment

This application can be deployed to platforms like Render, Heroku, or Railway.

### Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install`
4. Set the start command: `npm start`
5. Add environment variables in the Render dashboard

### Deploying to Heroku

1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create your-app-name`
4. Push to Heroku: `git push heroku main`
5. Set environment variables: `heroku config:set JWT_SECRET=your_secret_key NODE_ENV=production`

## Project Structure

```
mini-data-query-engine/
├── .env                      # Environment variables
├── .gitignore                # Files to ignore in git
├── README.md                 # Project documentation
├── package.json              # Project dependencies
├── server.js                 # Entry point for the application
├── src/
│   ├── config/               # Configuration files
│   │   └── db.js             # Database configuration
│   ├── controllers/          # Route controllers
│   │   ├── queryController.js # Controller for query operations
│   │   └── authController.js  # Controller for authentication
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   └── errorHandler.js   # Error handling middleware
│   ├── models/               # Data models
│   │   └── mockDatabase.js   # In-memory database module
│   ├── routes/               # API routes
│   │   ├── queryRoutes.js    # Routes for query operations
│   │   └── authRoutes.js     # Routes for authentication
│   ├── services/             # Business logic
│   │   ├── queryParser.js    # Natural language to SQL parser
│   │   └── queryExecutor.js  # Query execution service
│   └── utils/                # Utility functions
│       ├── logger.js         # Logging utility
│       └── validators.js     # Input validation functions
└── tests/                    # Test files
    ├── integration/          # Integration tests
    │   ├── auth.test.js      # Authentication API tests
    │   └── query.test.js     # Query API endpoint tests
    └── unit/                 # Unit tests
        ├── queryParser.test.js  # Tests for query parsing logic
        ├── queryExecutor.test.js # Tests for query execution
        └── validators.test.js   # Tests for validation utilities
```