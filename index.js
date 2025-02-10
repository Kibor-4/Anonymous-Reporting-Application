require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
        }
    }
});

// MySQL Connection Pooling
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'knls123', // Update to your MySQL password
    database: 'anonymous_reports',
    waitForConnections: true,5
    connectionLimit: 10,
    queueLimit: 0
});

// Handle form submission
app.post('/submit-report', upload.single('attachment'), (req, res) => {
    const { category, description } = req.body;
    const attachment = req.file ? req.file.filename : null;

    const sql = 'INSERT INTO reports (category, description, attachment) VALUES (?, ?, ?)';
    pool.query(sql, [category, description, attachment], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Error submitting report', error: err.message });
        }
        res.status(200).json({ success: true, message: 'Report submitted successfully', data: { reportId: result.insertId } });
    });
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});