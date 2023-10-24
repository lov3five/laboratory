const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;

// Helper function to update database json
const updateDatabaseJson = require('./db-helper');

// Database json
const db = require('./db.json');

// User bodyParser to parse application/json content-type
app.use(bodyParser.json());

// Secret key for JWT
const secretKey = process.env.JWT_SECRET_KEY;

// Middleware authenticate JWT
const authenticateJWT = (req, res, next) => {
  // Get authorization header from request
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Bearer TOKEN
    const token = authHeader.split(' ')[1];

    // Verify token
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      // Save user after authenticate to req.user
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const checkLogin = (username, password) => {
  return db.users.find(user => user.username === username && bcrypt.compareSync(password, user.password));
};

// POST /register
app.post('/register', async (req, res) => {
  // Get username and password from request body
  const { username, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = {
    id: db.users.length + 1,
    username,
    password: hashedPassword
  };

  // Update database json
  await updateDatabaseJson('./db.json', 'users', newUser);

  // Return response to client
  res.json({
    message: 'User created successfully!',
    newUser
  });
});

// POST /login
app.post('/login', (req, res) => {
  // Get username and password from request body
  const { username, password } = req.body;

  // Check if username and password is correct
  // If correct, return a JWT with username and id of user
  if(checkLogin(username, password)) {
    const user = username;
    // Create a token
    const token = jwt.sign( user , secretKey);

    // Send token to client
    res.json({
      message: 'Login successfully!',
      token
    });
  }
  else {
    res.json({
      message: 'Login failed!'
    });
  }
});

// GET /protected
// Use authenticateJWT middleware to protect this route
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({
    message: 'This is protected route!',
    user: req.user
  });
});

app.listen(3000, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});