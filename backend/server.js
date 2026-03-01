const express = require('express');
const cors = require('cors');
const { initDb } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// Initialize Database
initDb().then(database => {
    db = database;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});

// API Routes
app.get('/api/institutions', async (req, res) => {
    try {
        const { type, stream, location, search } = req.query;
        let query = 'SELECT * FROM institutions WHERE 1=1';
        const params = [];

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        if (stream) {
            query += ' AND (streams LIKE ? OR streams_en LIKE ?)';
            params.push(`%${stream}%`, `%${stream}%`);
        }
        if (location) {
            query += ' AND (location LIKE ? OR location_en LIKE ?)';
            params.push(`%${location}%`, `%${location}%`);
        }
        if (search) {
            query += ' AND (name LIKE ? OR name_en LIKE ? OR subjects LIKE ? OR subjects_en LIKE ? OR contact_details_en LIKE ? OR location LIKE ? OR location_en LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        console.log('Query:', query);
        console.log('Params:', params);
        const institutions = await db.all(query, params);
        res.json(institutions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/institutions/:id', async (req, res) => {
    try {
        const institution = await db.get('SELECT * FROM institutions WHERE id = ?', [req.params.id]);
        if (!institution) return res.status(404).json({ error: 'Institution not found' });
        res.json(institution);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/updates', async (req, res) => {
    try {
        const updates = await db.all('SELECT * FROM updates ORDER BY date DESC');
        res.json(updates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- User Authentication ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        await db.run(
            'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
            [name, username, email, password]
        );
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            console.error('Signup error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        const user = await db.get(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (user) {
            res.json({ message: 'Login successful', user: { id: user.id, name: user.name, username: user.username } });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await db.get('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password]);

        if (admin) {
            res.json({ message: 'Admin login successful', username: admin.username });
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Ads API ---

// Get all ads
app.get('/api/ads', async (req, res) => {
    try {
        const ads = await db.all('SELECT * FROM ads ORDER BY date DESC');
        res.json(ads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new ad (Admin only - currently simplified)
app.post('/api/admin/ads', async (req, res) => {
    try {
        const { title, title_en, content, content_en, image_url, link } = req.body;
        await db.run(
            'INSERT INTO ads (title, title_en, content, content_en, image_url, link) VALUES (?, ?, ?, ?, ?, ?)',
            [title, title_en, content, content_en, image_url, link]
        );
        res.status(201).json({ message: 'Ad created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete ad
app.delete('/api/admin/ads/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM ads WHERE id = ?', [req.params.id]);
        res.json({ message: 'Ad deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Institutions Management API ---

app.post('/api/admin/institutions', async (req, res) => {
    try {
        const {
            name, name_en, type, type_en, location, location_en,
            streams, streams_en, subjects, subjects_en,
            facilities, facilities_en, contact_details, contact_details_en,
            admission_process, admission_process_en, map_location, image_url
        } = req.body;

        const result = await db.run(`
            INSERT INTO institutions (
                name, name_en, type, type_en, location, location_en, 
                streams, streams_en, subjects, subjects_en, 
                facilities, facilities_en, contact_details, contact_details_en, 
                admission_process, admission_process_en, map_location, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name, name_en, type, type_en, location, location_en,
            streams, streams_en, subjects, subjects_en,
            facilities, facilities_en, contact_details, contact_details_en,
            admission_process, admission_process_en, map_location, image_url
        ]);

        res.status(201).json({ message: 'Institution created successfully', id: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/institutions/:id', async (req, res) => {
    try {
        const {
            name, name_en, type, type_en, location, location_en,
            streams, streams_en, subjects, subjects_en,
            facilities, facilities_en, contact_details, contact_details_en,
            admission_process, admission_process_en, map_location, image_url
        } = req.body;

        await db.run(`
            UPDATE institutions SET 
                name = ?, name_en = ?, type = ?, type_en = ?, location = ?, location_en = ?, 
                streams = ?, streams_en = ?, subjects = ?, subjects_en = ?, 
                facilities = ?, facilities_en = ?, contact_details = ?, contact_details_en = ?, 
                admission_process = ?, admission_process_en = ?, map_location = ?, image_url = ?
            WHERE id = ?
        `, [
            name, name_en, type, type_en, location, location_en,
            streams, streams_en, subjects, subjects_en,
            facilities, facilities_en, contact_details, contact_details_en,
            admission_process, admission_process_en, map_location, image_url,
            req.params.id
        ]);

        res.json({ message: 'Institution updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/institutions/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM institutions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Institution deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Institution Images API ---

app.get('/api/institutions/:id/images', async (req, res) => {
    try {
        const images = await db.all('SELECT * FROM institution_images WHERE institution_id = ?', [req.params.id]);
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/institutions/:id/images', async (req, res) => {
    try {
        const { image_url } = req.body;
        await db.run('INSERT INTO institution_images (institution_id, image_url) VALUES (?, ?)', [req.params.id, image_url]);
        res.status(201).json({ message: 'Image added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/institutions/images/:imageId', async (req, res) => {
    try {
        await db.run('DELETE FROM institution_images WHERE id = ?', [req.params.imageId]);
        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

