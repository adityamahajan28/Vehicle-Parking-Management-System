const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'parking_management',
    port: '3306'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

// Register User
app.post('/register', (req, res) => {
    const { name, phone, password } = req.body;
    
    // Check if user already exists
    db.query('SELECT * FROM users WHERE phone = ?', [phone], (err, result) => {
        if (err) return res.status(500).send(err.message);
        
        if (result.length > 0) {
            return res.send('User already exists');
        }
        
        // Insert new user
        const sql = 'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)';
        db.query(sql, [name, phone, password], (err, result) => {
            if (err) return res.status(500).send(err.message);
            res.send('User registered successfully');
        });
    });
});

// Login User
app.post('/login', (req, res) => {
    const { phone, password } = req.body;
    const sql = 'SELECT * FROM users WHERE phone = ? AND password = ?';
    db.query(sql, [phone, password], (err, result) => {
        if (err) return res.status(500).send(err.message);
        
        if (result.length > 0) {
            res.send('Login successful');
        } else {
            res.send('Invalid credentials');
        }
    });
});

// Get User ID by Phone
app.get('/getUserId/:phone', (req, res) => {
    const { phone } = req.params;
    const sql = 'SELECT id FROM users WHERE phone = ?';
    db.query(sql, [phone], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.length > 0) {
            res.json({ userId: result[0].id });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});

// Get All Regions
app.get('/regions', (req, res) => {
    const sql = 'SELECT DISTINCT region FROM locations';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get Subdivisions by Region
app.get('/subdivisions/:region', (req, res) => {
    const { region } = req.params;
    const sql = 'SELECT DISTINCT subdivision FROM locations WHERE region = ?';
    db.query(sql, [region], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get Locations by Region and Subdivision
app.get('/locations/:region/:subdivision', (req, res) => {
    const { region, subdivision } = req.params;
    const sql = 'SELECT * FROM locations WHERE region = ? AND subdivision = ?';
    db.query(sql, [region, subdivision], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Book Parking
app.post('/book', (req, res) => {
    const { userId, location, vehicleType, vehicleNumber, date, price } = req.body;
    
    // Validate the data
    if (!userId || !location || !vehicleType || !vehicleNumber || !date || !price) {
        return res.send('All fields are required');
    }
    
    const sql = 'INSERT INTO bookings (user_id, location, vehicle_type, vehicle_number, booking_date, price) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [userId, location, vehicleType, vehicleNumber, date, price], (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send('Booking successful');
    });
});

// Get Bookings
app.get('/bookings/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = 'SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC';
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));