const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { z } = require("zod"); // Import Zod

const app = express();
const port = 8080;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Datadb",
  password: "yashdb007",
  port: 5432,
});

app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies

// Zod validation schemas
const signupSchema = z.object({
  firstname: z.string().min(2), // Minimum length of 2 characters
  lastname: z.string().min(2), // Minimum length of 2 characters
  email: z.string().email(), // Valid email format
  password: z.string().min(6), // Minimum length of 6 characters
  country: z.string().min(2), // Minimum length of 2 characters
});
app.use(express.static('public')); // Assuming supcl2.html is located in the 'public' directory

// Route to handle user sign up
app.post("/signup", async (req, res) => {
  try {
    // Validate request body against the schema
    const validatedData = signupSchema.parse(req.body);

    // If validation succeeds, insert user data into the database
    const { firstname, lastname, email, password, country } = validatedData;
    const result = await pool.query(
      'INSERT INTO users (firstname, lastname, email, password, country) VALUES ($1, $2, $3, $4, $5)',
      [firstname, lastname, email, password, country]
    );

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod validation error
      console.error('Validation error:', error);
      res.status(400).json({ error: 'Invalid input data' });
    } else {
      // Other unexpected errors
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
