const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require("pg");
const bcrypt = require('bcrypt');
const { object, string, email } = require('zod');

const app = express();
const PORT = 8080;

// Database connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Datadb",
    password: "yashdb007",
    port: 5432,
});

// Zod validation schema
const signupSchema = object({
    firstname: string(),
    lastname: string(),
    email: string().email(),
    password: string().min(6), // Minimum 6 characters for the password
    country: string(),
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (assuming your HTML file is in a directory named "public")
app.use(express.static('public'));

app.get("/checkdb", async (req, res) => {
    try {
      // Attempt to query the database
      const result = await pool.query("SELECT NOW()");
      res.send("Database connection successful");
    } catch (err) {
      console.error("Error connecting to database:", err);
      res.status(500).send("Error connecting to database");
    }
  });
// POST endpoint for form submission
app.post('/signup', async (req, res) => {
    const formData = req.body;
    
    try {
        // Validate form data
        signupSchema.parse(formData);
        
        // Encrypt password
        const hashedPassword = await bcrypt.hash(formData.password, 10); // Using 10 salt rounds

        // Insert the form data into the database
        const sql = 'INSERT INTO users (firstname, lastname, email, password, country) VALUES ($1, $2, $3, $4, $5)';
        const values = [formData.firstname, formData.lastname, formData.email, hashedPassword, formData.country];

        pool.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting into database:', err);
                res.status(500).json({ error: 'Error inserting into database' });
            } else {
                console.log('Inserted into database:', result);
                res.json({ message: 'Form submitted successfully' });
            }
        });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
