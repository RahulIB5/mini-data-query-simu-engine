// // src/config/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database or connect to an existing one
const db = new sqlite3.Database(
  process.env.DB_PATH === ':memory:' 
    ? ':memory:' 
    : path.join(__dirname, '../../', process.env.DB_PATH),
  (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
    } else {
      console.log('Connected to the database');
      initializeDatabase(() => {
        console.log('Database initialization complete.');
        if (typeof startServer === 'function') {
          startServer();
        }
      });
    }
  }
);

// Initialize database tables and sample data
function initializeDatabase(callback) {
  // Create tables sequentially
  db.serialize(() => {
    // Create users table for authentication
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err.message);
    });

    // Create products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        inventory INTEGER NOT NULL
      )
    `, (err) => {
      if (err) console.error('Error creating products table:', err.message);
    });

    // Create sales table
    db.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        sale_date TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `, (err) => {
      if (err) console.error('Error creating sales table:', err.message);
    });

    // Create customers table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        location TEXT NOT NULL,
        joined_date TEXT NOT NULL
      )
    `, (err) => {
      if (err) console.error('Error creating customers table:', err.message);
      
      // After all tables are created, insert sample data
      insertSampleData(callback);
    });
  });
}

// Insert sample data for demo purposes
function insertSampleData(callback) {
  // Use serialized execution to ensure proper order
  db.serialize(() => {
    // Sample user for authentication
    db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
      if (err) {
        console.error('Error checking users table:', err.message);
      } else if (result.count === 0) {
        // Default user: username = admin, password = password123
        db.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          ['admin', '$2a$10$aCvFgHF3UZPkqL3X1PyZ5.JPuG1mO3eIDkf.QZdXSLAUYx0TKLzPi'],
          (err) => {
            if (err) console.error('Error inserting user:', err.message);
            else console.log('Default user created');
          }
        );
      }
    });

    // Sample products
    db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
      if (err) {
        console.error('Error checking products table:', err.message);
      } else if (result.count === 0) {
        const products = [
          ['Laptop', 'Electronics', 1200.00, 50],
          ['Smartphone', 'Electronics', 800.00, 100],
          ['Headphones', 'Electronics', 150.00, 200],
          ['T-shirt', 'Clothing', 25.00, 500],
          ['Jeans', 'Clothing', 60.00, 300]
        ];
        
        const stmt = db.prepare('INSERT INTO products (name, category, price, inventory) VALUES (?, ?, ?, ?)');
        products.forEach(product => stmt.run(product));
        stmt.finalize((err) => {
          if (err) console.error('Error inserting products:', err.message);
          else console.log('Sample products created');
        });
      }
    });

    // Sample sales
    db.get('SELECT COUNT(*) as count FROM sales', (err, result) => {
      if (err) {
        console.error('Error checking sales table:', err.message);
      } else if (result.count === 0) {
        const sales = [
          [1, 5, 6000.00, '2025-01-15'],
          [2, 10, 8000.00, '2025-01-20'],
          [3, 15, 2250.00, '2025-02-01'],
          [4, 20, 500.00, '2025-02-10'],
          [5, 10, 600.00, '2025-02-15'],
          [1, 3, 3600.00, '2025-02-20'],
          [2, 5, 4000.00, '2025-03-01'],
          [3, 8, 1200.00, '2025-03-10'],
          [4, 15, 375.00, '2025-03-15'],
          [5, 12, 720.00, '2025-03-20']
        ];
        
        const stmt = db.prepare('INSERT INTO sales (product_id, quantity, total_amount, sale_date) VALUES (?, ?, ?, ?)');
        sales.forEach(sale => stmt.run(sale));
        stmt.finalize((err) => {
          if (err) console.error('Error inserting sales:', err.message);
          else console.log('Sample sales created');
        });
      }
    });

    // Sample customers
    db.get('SELECT COUNT(*) as count FROM customers', (err, result) => {
      if (err) {
        console.error('Error checking customers table:', err.message);
      } else if (result.count === 0) {
        const customers = [
          ['John Doe', 'john@example.com', 'New York', '2024-06-15'],
          ['Jane Smith', 'jane@example.com', 'Los Angeles', '2024-07-20'],
          ['Robert Johnson', 'robert@example.com', 'Chicago', '2024-08-10'],
          ['Maria Garcia', 'maria@example.com', 'Miami', '2024-09-05'],
          ['James Wilson', 'james@example.com', 'Seattle', '2024-10-15']
        ];
        
        const stmt = db.prepare('INSERT INTO customers (name, email, location, joined_date) VALUES (?, ?, ?, ?)');
        customers.forEach(customer => stmt.run(customer));
        stmt.finalize((err) => {
          if (err) console.error('Error inserting customers:', err.message);
          else console.log('Sample customers created');
          
          // Call the callback when all operations are complete
          if (callback) callback();
        });
      } else {
        // If no data needed to be inserted, still call the callback
        if (callback) callback();
      }
    });
  });
}

module.exports = db;