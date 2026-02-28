const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function initDb() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS institutions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_en TEXT NOT NULL,
            type TEXT CHECK(type IN ('School', 'College', 'ITI')) NOT NULL,
            type_en TEXT NOT NULL,
            location TEXT NOT NULL,
            location_en TEXT NOT NULL,
            streams TEXT, 
            streams_en TEXT,
            degree_types TEXT, 
            subjects TEXT,
            subjects_en TEXT,
            facilities TEXT,
            facilities_en TEXT,
            contact_details TEXT,
            contact_details_en TEXT,
            admission_process TEXT,
            admission_process_en TEXT,
            map_location TEXT,
            image_url TEXT
        );

        CREATE TABLE IF NOT EXISTS updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_en TEXT NOT NULL,
            content TEXT NOT NULL,
            content_en TEXT NOT NULL,
            date TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_en TEXT NOT NULL,
            content TEXT NOT NULL,
            content_en TEXT NOT NULL,
            image_url TEXT,
            link TEXT,
            date TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const fs = require('fs');
    // Seed data if empty
    const institutionsCount = await db.get('SELECT COUNT(*) as count FROM institutions');
    if (institutionsCount.count === 0) {
        console.log('Seeding institutions from JSON...');
        try {
            const dataPath = path.join(__dirname, 'institutions_data.json');
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

                const stmt = await db.prepare(`
                    INSERT INTO institutions (
                        name, name_en, type, type_en, location, location_en, 
                        streams, streams_en, subjects, subjects_en, 
                        facilities, facilities_en, contact_details, contact_details_en, 
                        admission_process, admission_process_en, map_location, image_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                const customImages = {
                    'जवाहर नवोदय विद्यालय, दंतेवाड़ा': 'images/jnv_dantewada.png',
                    'केंद्रीय विद्यालय, दंतेवाड़ा': 'images/kv_dantewada.png',
                    'शासकीय दंतेश्वरी स्नाकोत्तर महाविद्यालय, दंतेवाड़ा': 'images/danteshwari_college.png'
                };

                for (const inst of data) {
                    let imageUrl = inst.image_url;
                    if (customImages[inst.name]) {
                        imageUrl = customImages[inst.name];
                    }

                    await stmt.run(
                        inst.name, inst.name_en, inst.type, inst.type_en, inst.location, inst.location_en,
                        inst.streams, inst.streams_en, inst.subjects, inst.subjects_en,
                        inst.facilities, inst.facilities_en, inst.contact_details, inst.contact_details_en,
                        inst.admission_process, inst.admission_process_en, inst.map_location, imageUrl
                    );
                }
                console.log(`Successfully seeded ${data.length} institutions.`);
            } else {
                console.warn('institutions_data.json not found, skipping initial seed.');
            }
        } catch (err) {
            console.error('Error seeding institutions:', err);
        }
    }

    const updatesCount = await db.get('SELECT COUNT(*) as count FROM updates');
    if (updatesCount.count === 0) {
        await db.run(`
            INSERT INTO updates (title, title_en, content, content_en)
            VALUES 
            ('नवगुरुकुल एडमिशन 2026', 'NavGurukul Admission 2026', 'सॉफ्टवेयर इंजीनियरिंग में फ्री आवासीय कोर्स। अण्डरसर्वेड युवाओं के लिए सुनहरा अवसर। admissions.navgurukul.org पर आवेदन करें।', 'Free residential software engineering course. Golden opportunity for underserved youth. Apply at admissions.navgurukul.org'),
            ('एकलव्य विद्यालय प्रवेश सूचना', 'EMRS Admission Alert', 'कक्षा 6वीं प्रवेश परीक्षा 2026-27 के लिए एडमिट कार्ड जारी कर दिए गए हैं। अधिक जानकारी के लिए cg.nic.in देखें।', 'Admit cards for Class 6th Entrance Exam 2026-27 have been issued. Check cg.nic.in for more details.'),
            ('दंतेवाड़ा में नया मेडिकल कॉलेज', 'New Medical College in Dantewada', 'छत्तीसगढ़ बजट 2026-27 में दंतेवाड़ा में नए मेडिकल कॉलेज की स्थापना के लिए ₹50 करोड़ का प्रावधान किया गया है।', '₹50 crore allocated in Chhattisgarh Budget 2026-27 for establishing a new medical college in Dantewada.'),
            ('शासकीय पीजी कॉलेज प्रवेश', 'Govt PG College Admission', 'स्नातक (UG) और स्नातकोत्तर (PG) पाठ्यक्रमों के लिए सत्र 2026 के प्रवेश अब चालू हैं। मेरिट के आधार पर होगा चयन।', 'Admissions for UG and PG courses for the 2026 session are now OPEN. Selection based on merit.')
        `);
    }

    const adminsCount = await db.get('SELECT COUNT(*) as count FROM admins');
    if (adminsCount.count === 0) {
        await db.run(`
            INSERT INTO admins (username, password)
            VALUES ('admin', 'admin&143b')
        `);
    }
    // Always sync the admin password to the latest value
    await db.run(`UPDATE admins SET password = 'admin&143b' WHERE username = 'admin'`);

    const adsCount = await db.get('SELECT COUNT(*) as count FROM ads');
    if (adsCount.count === 0) {
        await db.run(`
                INSERT INTO ads (title, title_en, content, content_en, image_url, link)
                VALUES 
                (
                    'निशुल्क कोचिंग शिविर', 'Free Coaching Camp', 
                    'दंतेवाड़ा के युवाओं के लिए व्यापम और PSC की निशुल्क कोचिंग। आवेदन जल्द करें।', 'Free coaching for Vyapam and PSC for youth of Dantewada. Apply soon.', 
                    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', 'https://dantewada.nic.in'
                ),
                (
                    'मुख्यमंत्री ज्ञान प्रोत्साहन योजना', 'CM Gyan Protsahan Yojana', 
                    'मेधावी छात्रों के लिए ₹15,000 की प्रोत्साहन राशि। पात्रता जांचें।', '₹15,000 incentive for meritorious students. Check eligibility.', 
                    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800', 'https://scholarship.cg.nic.in'
                )
            `);
    }

    console.log('Database initialized with dual-language support.');
    return db;
}

module.exports = { initDb };
