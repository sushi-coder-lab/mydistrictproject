const express = require('express');
const cors = require('cors');
const { initDb } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow all
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(express.json());

let db;
let dbInitialized = false;

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'Dantewada Education Portal API',
        status: 'running',
        db: dbInitialized ? 'ready' : 'initializing',
        version: '1.0.2',
        frontend: 'https://sushi-coder-lab.github.io/mydistrictproject/',
        docs: 'Use /api/institutions, /api/updates, /api/stats etc.'
    });
});

// Health check (before DB init)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: dbInitialized ? 'initialized' : 'initializing',
        version: '1.0.2',
        timestamp: new Date().toISOString()
    });
});

// Initialize Database in background
initDb().then(database => {
    db = database;
    dbInitialized = true;
    console.log('Database initialized successfully.');
}).catch(err => {
    console.error('CRITICAL: Failed to initialize database:', err);
});

// Start listening immediately
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Helper: Log admin action
async function logAudit(username, action, details) {
    try {
        await db.run('INSERT INTO audit_log (admin_username, action, details) VALUES (?, ?, ?)', [username, action, details]);
    } catch (e) { console.error('Audit log error:', e); }
}

// API Routes
app.use((req, res, next) => {
    if (!dbInitialized && !req.path.includes('/health')) {
        return res.status(503).json({ error: 'Database initializing, please wait...' });
    }
    next();
});

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

// --- Analytics ---

// Track page view
app.post('/api/pageview', async (req, res) => {
    try {
        const { page } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        await db.run('INSERT INTO page_views (page, ip) VALUES (?, ?)', [page || '/', ip]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin analytics summary
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const totalInstitutions = await db.get('SELECT COUNT(*) as count FROM institutions');
        const schoolCount = await db.get("SELECT COUNT(*) as count FROM institutions WHERE type = 'School'");
        const collegeCount = await db.get("SELECT COUNT(*) as count FROM institutions WHERE type = 'College'");
        const itiCount = await db.get("SELECT COUNT(*) as count FROM institutions WHERE type = 'ITI'");
        const totalPageViews = await db.get('SELECT COUNT(*) as count FROM page_views');
        const todayViews = await db.get("SELECT COUNT(*) as count FROM page_views WHERE date(visited_at) = date('now')");
        const totalFeedback = await db.get('SELECT COUNT(*) as count FROM feedback');
        const totalScholarships = await db.get('SELECT COUNT(*) as count FROM scholarships');
        const totalNotices = await db.get('SELECT COUNT(*) as count FROM notices');
        const totalTeachers = await db.get('SELECT COUNT(*) as count FROM teachers');
        const totalGallery = await db.get('SELECT COUNT(*) as count FROM gallery');

        // Popular pages
        const popularPages = await db.all(
            'SELECT page, COUNT(*) as views FROM page_views GROUP BY page ORDER BY views DESC LIMIT 5'
        );

        // Views by day (last 7 days)
        const weeklyViews = await db.all(`
            SELECT date(visited_at) as day, COUNT(*) as views 
            FROM page_views 
            WHERE visited_at >= datetime('now', '-7 days')
            GROUP BY day ORDER BY day ASC
        `);

        res.json({
            institutions: { total: totalInstitutions.count, schools: schoolCount.count, colleges: collegeCount.count, iti: itiCount.count },
            pageViews: { total: totalPageViews.count, today: todayViews.count },
            feedback: totalFeedback.count,
            scholarships: totalScholarships.count,
            notices: totalNotices.count,
            teachers: totalTeachers.count,
            gallery: totalGallery.count,
            popularPages,
            weeklyViews
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Home stats (public)
app.get('/api/stats', async (req, res) => {
    try {
        const totalInstitutions = await db.get('SELECT COUNT(*) as count FROM institutions');
        const schoolCount = await db.get("SELECT COUNT(*) as count FROM institutions WHERE type = 'School'");
        const collegeCount = await db.get("SELECT COUNT(*) as count FROM institutions WHERE type = 'College'");
        const itiCount = await db.get("SELECT COUNT(*) as count FROM institutions WHERE type = 'ITI'");
        const locationCounts = await db.all("SELECT location_en as location, COUNT(*) as count FROM institutions GROUP BY location_en ORDER BY count DESC LIMIT 7");
        res.json({ total: totalInstitutions.count, schools: schoolCount.count, colleges: collegeCount.count, iti: itiCount.count, byLocation: locationCounts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- User Authentication ---

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        await db.run('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)', [name, username, email, password]);
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
        const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (user) {
            res.json({ message: 'Login successful', user: { id: user.id, name: user.name, username: user.username } });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await db.get('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password]);
        if (admin) {
            res.json({ message: 'Admin login successful', username: admin.username, role: admin.role || 'admin' });
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Ads API ---

app.get('/api/ads', async (req, res) => {
    try {
        const ads = await db.all('SELECT * FROM ads ORDER BY date DESC');
        res.json(ads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/ads', async (req, res) => {
    try {
        const { title, title_en, content, content_en, image_url, link, admin_user } = req.body;
        await db.run('INSERT INTO ads (title, title_en, content, content_en, image_url, link) VALUES (?, ?, ?, ?, ?, ?)', [title, title_en, content, content_en, image_url, link]);
        await logAudit(admin_user || 'admin', 'ADD_AD', `Added ad: ${title_en}`);
        res.status(201).json({ message: 'Ad created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/ads/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM ads WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_AD', `Deleted ad ID: ${req.params.id}`);
        res.json({ message: 'Ad deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Institutions Management API ---

app.post('/api/admin/institutions', async (req, res) => {
    try {
        const { name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count, latitude, longitude, admin_user } = req.body;
        const result = await db.run(`
            INSERT INTO institutions (name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count || 0, latitude, longitude]);
        await logAudit(admin_user || 'admin', 'ADD_INSTITUTION', `Added institution: ${name_en}`);
        res.status(201).json({ message: 'Institution created successfully', id: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/institutions/:id', async (req, res) => {
    try {
        const { name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count, latitude, longitude, admin_user } = req.body;
        await db.run(`
            UPDATE institutions SET name=?, name_en=?, type=?, type_en=?, location=?, location_en=?, streams=?, streams_en=?, subjects=?, subjects_en=?, facilities=?, facilities_en=?, contact_details=?, contact_details_en=?, admission_process=?, admission_process_en=?, map_location=?, image_url=?, enrollment_count=?, latitude=?, longitude=?
            WHERE id = ?
        `, [name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count || 0, latitude, longitude, req.params.id]);
        await logAudit(admin_user || 'admin', 'EDIT_INSTITUTION', `Edited institution ID: ${req.params.id}`);
        res.json({ message: 'Institution updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/institutions/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM institutions WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_INSTITUTION', `Deleted institution ID: ${req.params.id}`);
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

// --- Updates Management ---

app.post('/api/admin/updates', async (req, res) => {
    try {
        const { title, title_en, content, content_en, admin_user } = req.body;
        await db.run('INSERT INTO updates (title, title_en, content, content_en) VALUES (?, ?, ?, ?)', [title, title_en, content, content_en]);
        await logAudit(admin_user || 'admin', 'ADD_UPDATE', `Added update: ${title_en}`);
        res.status(201).json({ message: 'Update created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/updates/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM updates WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_UPDATE', `Deleted update ID: ${req.params.id}`);
        res.json({ message: 'Update deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Scholarships API ---

app.get('/api/scholarships', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM scholarships';
        const params = [];
        if (category) { query += ' WHERE category = ?'; params.push(category); }
        query += ' ORDER BY date_added DESC';
        const scholarships = await db.all(query, params);
        res.json(scholarships);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Toppers API ---

app.get('/api/toppers', async (req, res) => {
    try {
        const { category, year } = req.query;
        let query = 'SELECT * FROM toppers';
        const params = [];
        if (category || year) {
            query += ' WHERE';
            if (category) {
                query += ' category = ?';
                params.push(category);
            }
            if (year) {
                if (category) query += ' AND';
                query += ' year = ?';
                params.push(year);
            }
        }
        query += ' ORDER BY year DESC, rank ASC';
        const toppers = await db.all(query, params);
        res.json(toppers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/toppers', async (req, res) => {
    try {
        const { name, name_en, photo_url, rank, percentage, year, school_name, school_name_en, category, details, details_en, admin_user } = req.body;
        await db.run(`
            INSERT INTO toppers (name, name_en, photo_url, rank, percentage, year, school_name, school_name_en, category, details, details_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, name_en, photo_url, rank, percentage, year, school_name, school_name_en, category, details, details_en]);
        await logAudit(admin_user || 'admin', 'ADD_TOPPER', `Added topper: ${name_en}`);
        res.status(201).json({ message: 'Topper added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/toppers/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM toppers WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_TOPPER', `Deleted topper ID: ${req.params.id}`);
        res.json({ message: 'Topper deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Resources API ---

app.get('/api/resources', async (req, res) => {
    try {
        const { class: cls, type, subject } = req.query;
        let query = 'SELECT * FROM resources';
        const params = [];
        const filters = [];
        if (cls) { filters.push('class = ?'); params.push(cls); }
        if (type) { filters.push('type = ?'); params.push(type); }
        if (subject) { filters.push('subject = ?'); params.push(subject); }

        if (filters.length > 0) {
            query += ' WHERE ' + filters.join(' AND ');
        }
        query += ' ORDER BY year DESC, title_en ASC';
        const resources = await db.all(query, params);
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/resources', async (req, res) => {
    try {
        const { title, title_en, class: cls, subject, subject_en, type, board, download_url, year, admin_user } = req.body;
        await db.run(`
            INSERT INTO resources (title, title_en, class, subject, subject_en, type, board, download_url, year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, title_en, cls, subject, subject_en, type, board, download_url, year]);
        await logAudit(admin_user || 'admin', 'ADD_RESOURCE', `Added resource: ${title_en}`);
        res.status(201).json({ message: 'Resource added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/resources/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM resources WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_RESOURCE', `Deleted resource ID: ${req.params.id}`);
        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Exam Alerts API ---

app.get('/api/exam-alerts', async (req, res) => {
    try {
        const alerts = await db.all('SELECT * FROM exam_alerts WHERE status = "upcoming" ORDER BY exam_date ASC');
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/exam-alerts', async (req, res) => {
    try {
        const { exam_name, exam_name_en, exam_date, description, description_en, link, admin_user } = req.body;
        await db.run(`
            INSERT INTO exam_alerts (exam_name, exam_name_en, exam_date, description, description_en, link)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [exam_name, exam_name_en, exam_date, description, description_en, link]);
        await logAudit(admin_user || 'admin', 'ADD_EXAM_ALERT', `Added exam alert: ${exam_name_en}`);
        res.status(201).json({ message: 'Exam alert created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Audit Log ---
app.get('/api/admin/audit-log', async (req, res) => {
    try {
        const logs = await db.all('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- User Authentication ---

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        await db.run('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)', [name, username, email, password]);
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
        const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (user) {
            res.json({ message: 'Login successful', user: { id: user.id, name: user.name, username: user.username } });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await db.get('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password]);
        if (admin) {
            res.json({ message: 'Admin login successful', username: admin.username, role: admin.role || 'admin' });
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Ads API ---

app.get('/api/ads', async (req, res) => {
    try {
        const ads = await db.all('SELECT * FROM ads ORDER BY date DESC');
        res.json(ads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/ads', async (req, res) => {
    try {
        const { title, title_en, content, content_en, image_url, link, admin_user } = req.body;
        await db.run('INSERT INTO ads (title, title_en, content, content_en, image_url, link) VALUES (?, ?, ?, ?, ?, ?)', [title, title_en, content, content_en, image_url, link]);
        await logAudit(admin_user || 'admin', 'ADD_AD', `Added ad: ${title_en}`);
        res.status(201).json({ message: 'Ad created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/ads/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM ads WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_AD', `Deleted ad ID: ${req.params.id}`);
        res.json({ message: 'Ad deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Institutions Management API ---

app.post('/api/admin/institutions', async (req, res) => {
    try {
        const { name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count, latitude, longitude, admin_user } = req.body;
        const result = await db.run(`
            INSERT INTO institutions (name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count || 0, latitude, longitude]);
        await logAudit(admin_user || 'admin', 'ADD_INSTITUTION', `Added institution: ${name_en}`);
        res.status(201).json({ message: 'Institution created successfully', id: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/institutions/:id', async (req, res) => {
    try {
        const { name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count, latitude, longitude, admin_user } = req.body;
        await db.run(`
            UPDATE institutions SET name=?, name_en=?, type=?, type_en=?, location=?, location_en=?, streams=?, streams_en=?, subjects=?, subjects_en=?, facilities=?, facilities_en=?, contact_details=?, contact_details_en=?, admission_process=?, admission_process_en=?, map_location=?, image_url=?, enrollment_count=?, latitude=?, longitude=?
            WHERE id = ?
        `, [name, name_en, type, type_en, location, location_en, streams, streams_en, subjects, subjects_en, facilities, facilities_en, contact_details, contact_details_en, admission_process, admission_process_en, map_location, image_url, enrollment_count || 0, latitude, longitude, req.params.id]);
        await logAudit(admin_user || 'admin', 'EDIT_INSTITUTION', `Edited institution ID: ${req.params.id}`);
        res.json({ message: 'Institution updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/institutions/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM institutions WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_INSTITUTION', `Deleted institution ID: ${req.params.id}`);
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

// --- Updates Management ---

app.post('/api/admin/updates', async (req, res) => {
    try {
        const { title, title_en, content, content_en, admin_user } = req.body;
        await db.run('INSERT INTO updates (title, title_en, content, content_en) VALUES (?, ?, ?, ?)', [title, title_en, content, content_en]);
        await logAudit(admin_user || 'admin', 'ADD_UPDATE', `Added update: ${title_en}`);
        res.status(201).json({ message: 'Update created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/updates/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM updates WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_UPDATE', `Deleted update ID: ${req.params.id}`);
        res.json({ message: 'Update deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Scholarships API ---

app.get('/api/scholarships', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM scholarships';
        const params = [];
        if (category) { query += ' WHERE category = ?'; params.push(category); }
        query += ' ORDER BY date_added DESC';
        const scholarships = await db.all(query, params);
        res.json(scholarships);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/scholarships', async (req, res) => {
    try {
        const { title, title_en, description, description_en, amount, eligibility, eligibility_en, deadline, link, category, admin_user } = req.body;
        await db.run('INSERT INTO scholarships (title, title_en, description, description_en, amount, eligibility, eligibility_en, deadline, link, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [title, title_en, description, description_en, amount, eligibility, eligibility_en, deadline, link, category || 'general']);
        await logAudit(admin_user || 'admin', 'ADD_SCHOLARSHIP', `Added scholarship: ${title_en}`);
        res.status(201).json({ message: 'Scholarship created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/scholarships/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM scholarships WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_SCHOLARSHIP', `Deleted scholarship ID: ${req.params.id}`);
        res.json({ message: 'Scholarship deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Notices API ---

app.get('/api/notices', async (req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM notices';
        const params = [];
        if (type) { query += ' WHERE notice_type = ?'; params.push(type); }
        query += ' ORDER BY date DESC';
        const notices = await db.all(query, params);
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/notices', async (req, res) => {
    try {
        const { title, title_en, content, content_en, notice_type, link, admin_user } = req.body;
        await db.run('INSERT INTO notices (title, title_en, content, content_en, notice_type, link) VALUES (?, ?, ?, ?, ?, ?)', [title, title_en, content, content_en, notice_type || 'general', link]);
        await logAudit(admin_user || 'admin', 'ADD_NOTICE', `Added notice: ${title_en}`);
        res.status(201).json({ message: 'Notice created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/notices/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM notices WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_NOTICE', `Deleted notice ID: ${req.params.id}`);
        res.json({ message: 'Notice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Teachers API ---

app.get('/api/teachers', async (req, res) => {
    try {
        const { institution } = req.query;
        let query = 'SELECT * FROM teachers';
        const params = [];
        if (institution) { query += ' WHERE institution_name LIKE ?'; params.push(`%${institution}%`); }
        query += ' ORDER BY name ASC';
        const teachers = await db.all(query, params);
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/teachers', async (req, res) => {
    try {
        const { name, name_en, subject, subject_en, institution_name, qualification, experience_years, contact, image_url, admin_user } = req.body;
        await db.run('INSERT INTO teachers (name, name_en, subject, subject_en, institution_name, qualification, experience_years, contact, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, name_en, subject, subject_en, institution_name, qualification, experience_years || 0, contact, image_url]);
        await logAudit(admin_user || 'admin', 'ADD_TEACHER', `Added teacher: ${name_en || name}`);
        res.status(201).json({ message: 'Teacher added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/teachers/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM teachers WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_TEACHER', `Deleted teacher ID: ${req.params.id}`);
        res.json({ message: 'Teacher deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Gallery API ---

app.get('/api/gallery', async (req, res) => {
    try {
        const gallery = await db.all('SELECT * FROM gallery ORDER BY created_at DESC');
        res.json(gallery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/gallery', async (req, res) => {
    try {
        const { title, title_en, image_url, institution_name, event_date, admin_user } = req.body;
        await db.run('INSERT INTO gallery (title, title_en, image_url, institution_name, event_date) VALUES (?, ?, ?, ?, ?)', [title, title_en, image_url, institution_name, event_date]);
        await logAudit(admin_user || 'admin', 'ADD_GALLERY', `Added gallery photo: ${title_en || title}`);
        res.status(201).json({ message: 'Gallery item added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/gallery/:id', async (req, res) => {
    try {
        const { admin_user } = req.body || {};
        await db.run('DELETE FROM gallery WHERE id = ?', [req.params.id]);
        await logAudit(admin_user || 'admin', 'DELETE_GALLERY', `Deleted gallery item ID: ${req.params.id}`);
        res.json({ message: 'Gallery item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Feedback API ---

app.post('/api/feedback', async (req, res) => {
    try {
        const { name, contact, feedback_type, message, institution_name } = req.body;
        if (!name || !message) return res.status(400).json({ error: 'Name and message are required' });
        await db.run('INSERT INTO feedback (name, contact, feedback_type, message, institution_name) VALUES (?, ?, ?, ?, ?)', [name, contact, feedback_type || 'feedback', message, institution_name]);
        res.status(201).json({ message: 'Feedback submitted successfully. Thank you!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/feedback', async (req, res) => {
    try {
        const feedback = await db.all('SELECT * FROM feedback ORDER BY created_at DESC');
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/feedback/:id/status', async (req, res) => {
    try {
        const { status, admin_user } = req.body;
        await db.run('UPDATE feedback SET status = ? WHERE id = ?', [status, req.params.id]);
        await logAudit(admin_user || 'admin', 'UPDATE_FEEDBACK', `Feedback ID ${req.params.id} marked as ${status}`);
        res.json({ message: 'Feedback status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/feedback/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM feedback WHERE id = ?', [req.params.id]);
        res.json({ message: 'Feedback deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Toppers API (Phase 9) ---
app.get('/api/toppers', async (req, res) => {
    try {
        const { category, year } = req.query;
        let query = 'SELECT * FROM toppers';
        const params = [];
        const filters = [];

        if (category && category !== 'All') {
            filters.push('category = ?');
            params.push(category);
        }
        if (year) {
            filters.push('year = ?');
            params.push(year);
        }

        if (filters.length > 0) {
            query += ' WHERE ' + filters.join(' AND ');
        }

        query += ' ORDER BY year DESC, CAST(rank AS INTEGER) ASC';
        const toppers = await db.all(query, params);
        res.json(toppers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/toppers', async (req, res) => {
    try {
        const { name, name_en, photo_url, rank, year, school_name, school_name_en, percentage, category, details, details_en, admin_user } = req.body;
        await db.run(`
            INSERT INTO toppers (name, name_en, photo_url, rank, year, school_name, school_name_en, percentage, category, details, details_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, name_en, photo_url, rank, year, school_name, school_name_en, percentage, category, details, details_en]);
        await logAudit(admin_user || 'admin', 'ADD_TOPPER', `Added topper: ${name_en}`);
        res.status(201).json({ message: 'Topper added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Resources API (Phase 9) ---
app.get('/api/resources', async (req, res) => {
    try {
        const { class: cls, type, subject } = req.query;
        let query = 'SELECT * FROM resources';
        const params = [];
        const filters = [];
        if (cls) { filters.push('class = ?'); params.push(cls); }
        if (type) { filters.push('type = ?'); params.push(type); }
        if (subject) { filters.push('(subject LIKE ? OR subject_en LIKE ?)'); params.push(`%${subject}%`, `%${subject}%`); }

        if (filters.length > 0) {
            query += ' WHERE ' + filters.join(' AND ');
        }
        query += ' ORDER BY year DESC, title ASC';
        const resources = await db.all(query, params);
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/resources', async (req, res) => {
    try {
        const { title, title_en, class: cls, subject, subject_en, type, board, download_url, year, admin_user } = req.body;
        await db.run(`
            INSERT INTO resources (title, title_en, class, subject, subject_en, type, board, download_url, year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, title_en, cls, subject, subject_en, type, board, download_url, year]);
        await logAudit(admin_user || 'admin', 'ADD_RESOURCE', `Added resource: ${title_en}`);
        res.status(201).json({ message: 'Resource added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Exam Alerts API (Phase 9) ---
app.get('/api/exam-alerts', async (req, res) => {
    try {
        const alerts = await db.all('SELECT * FROM exam_alerts WHERE status = "upcoming" ORDER BY exam_date ASC');
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/exam-alerts', async (req, res) => {
    try {
        const { exam_name, exam_name_en, exam_date, description, description_en, link, admin_user } = req.body;
        await db.run(`
            INSERT INTO exam_alerts (exam_name, exam_name_en, exam_date, description, description_en, link)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [exam_name, exam_name_en, exam_date, description, description_en, link]);
        await logAudit(admin_user || 'admin', 'ADD_EXAM_ALERT', `Added exam alert: ${exam_name_en}`);
        res.status(201).json({ message: 'Exam alert created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
