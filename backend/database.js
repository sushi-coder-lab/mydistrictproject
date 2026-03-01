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
            image_url TEXT,
            enrollment_count INTEGER DEFAULT 0,
            latitude REAL,
            longitude REAL
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
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin'
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

        CREATE TABLE IF NOT EXISTS institution_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            institution_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            FOREIGN KEY (institution_id) REFERENCES institutions (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS scholarships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_en TEXT NOT NULL,
            description TEXT,
            description_en TEXT,
            amount TEXT,
            eligibility TEXT,
            eligibility_en TEXT,
            deadline TEXT,
            link TEXT,
            category TEXT DEFAULT 'general',
            date_added TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_en TEXT NOT NULL,
            content TEXT,
            content_en TEXT,
            notice_type TEXT DEFAULT 'general',
            link TEXT,
            date TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_en TEXT,
            subject TEXT,
            subject_en TEXT,
            institution_name TEXT,
            qualification TEXT,
            experience_years INTEGER DEFAULT 0,
            contact TEXT,
            image_url TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_en TEXT,
            image_url TEXT NOT NULL,
            institution_name TEXT,
            event_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT,
            feedback_type TEXT DEFAULT 'feedback',
            message TEXT NOT NULL,
            institution_name TEXT,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page TEXT NOT NULL,
            ip TEXT,
            visited_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_username TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Run migrations for existing tables
    try {
        await db.exec(`ALTER TABLE institutions ADD COLUMN enrollment_count INTEGER DEFAULT 0`);
    } catch (e) { /* column already exists */ }
    try {
        await db.exec(`ALTER TABLE institutions ADD COLUMN latitude REAL`);
    } catch (e) { /* column already exists */ }
    try {
        await db.exec(`ALTER TABLE institutions ADD COLUMN longitude REAL`);
    } catch (e) { /* column already exists */ }

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
            INSERT INTO admins (username, password, role)
            VALUES ('admin', 'admin&143b', 'super_admin')
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

    // Seed scholarships
    const scholarshipsCount = await db.get('SELECT COUNT(*) as count FROM scholarships');
    if (scholarshipsCount.count === 0) {
        await db.run(`
            INSERT INTO scholarships (title, title_en, description, description_en, amount, eligibility, eligibility_en, deadline, link, category)
            VALUES 
            ('मुख्यमंत्री ज्ञान प्रोत्साहन योजना', 'CM Gyan Protsahan Yojana', 'मेधावी छात्रों को प्रोत्साहन राशि', 'Incentive for meritorious students', '₹15,000', '10वीं/12वीं में 60% से अधिक अंक', '60%+ marks in 10th/12th', '31 मार्च 2026', 'https://scholarship.cg.nic.in', 'merit'),
            ('नेशनल मेरिट स्कॉलरशिप', 'National Merit Scholarship', 'राष्ट्रीय स्तर की मेरिट छात्रवृत्ति', 'National level merit scholarship', '₹12,000/year', '8वीं कक्षा पास, आय सीमा ₹1.5 लाख', 'Class 8 pass, income below 1.5L', '15 अप्रैल 2026', 'https://scholarships.gov.in', 'merit'),
            ('SC/ST छात्रवृत्ति', 'SC/ST Scholarship', 'अनुसूचित जाति/जनजाति के छात्रों के लिए', 'For SC/ST category students', '₹8,000-₹20,000', 'SC/ST श्रेणी के छात्र', 'SC/ST category students', '30 जून 2026', 'https://tribal.cg.gov.in', 'sc_st'),
            ('पोस्ट मैट्रिक छात्रवृत्ति', 'Post Matric Scholarship', '11वीं और उससे ऊपर के छात्रों के लिए', 'For students in class 11 and above', 'पाठ्यक्रम के अनुसार', 'OBC/SC/ST श्रेणी', 'OBC/SC/ST category', '31 मई 2026', 'https://pmsonline.cg.nic.in', 'obc_sc_st'),
            ('प्रतिभा छात्रवृत्ति - दंतेवाड़ा', 'Pratibha Scholarship - Dantewada', 'जिले के प्रतिभाशाली छात्रों के लिए विशेष योजना', 'Special scheme for talented students of Dantewada', '₹5,000', 'दंतेवाड़ा जिले के निवासी', 'Residents of Dantewada district', '28 फरवरी 2026', 'https://dantewada.nic.in', 'district')
        `);
    }

    // Seed notices
    const noticesCount = await db.get('SELECT COUNT(*) as count FROM notices');
    if (noticesCount.count === 0) {
        await db.run(`
            INSERT INTO notices (title, title_en, content, content_en, notice_type, link)
            VALUES
            ('CGBSE 10वीं परिणाम 2026', 'CGBSE 10th Result 2026', 'छत्तीसगढ़ बोर्ड कक्षा 10वीं का परिणाम जारी।', 'Chhattisgarh Board Class 10th result declared.', 'result', 'https://cgbse.nic.in'),
            ('CGBSE 12वीं परिणाम 2026', 'CGBSE 12th Result 2026', 'छत्तीसगढ़ बोर्ड कक्षा 12वीं का परिणाम जारी।', 'Chhattisgarh Board Class 12th result declared.', 'result', 'https://cgbse.nic.in'),
            ('एकलव्य स्कूल प्रवेश परीक्षा एडमिट कार्ड', 'EMRS Entrance Admit Card', 'कक्षा 6वीं प्रवेश परीक्षा के एडमिट कार्ड जारी हो गए हैं।', 'Admit cards for Class 6th EMRS entrance exam issued.', 'admit_card', 'https://cg.nic.in'),
            ('UG प्रवेश 2026 अधिसूचना', 'UG Admission 2026 Notice', 'स्नातक कक्षाओं में प्रवेश के लिए आवेदन शुरू।', 'Applications started for UG admission 2026.', 'admission', 'https://cgvyapam.choice.gov.in'),
            ('NIT रायपुर काउंसलिंग सूचना', 'NIT Raipur Counselling Notice', 'NIT रायपुर भर्ती 2026 काउंसलिंग की तारीखें घोषित।', 'NIT Raipur admission 2026 counselling dates announced.', 'admission', 'https://nitrr.ac.in')
        `);
    }

    // Seed gallery
    const galleryCount = await db.get('SELECT COUNT(*) as count FROM gallery');
    if (galleryCount.count === 0) {
        await db.run(`
            INSERT INTO gallery (title, title_en, image_url, institution_name, event_date)
            VALUES
            ('वार्षिक खेल दिवस 2025', 'Annual Sports Day 2025', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'जवाहर नवोदय विद्यालय', '2025-12-15'),
            ('विज्ञान प्रदर्शनी 2025', 'Science Exhibition 2025', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800', 'केंद्रीय विद्यालय', '2025-11-20'),
            ('सांस्कृतिक कार्यक्रम', 'Cultural Event', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 'शासकीय महाविद्यालय', '2025-10-02'),
            ('पुस्तक मेला 2025', 'Book Fair 2025', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'जिला शिक्षा केंद्र', '2025-09-14'),
            ('पर्यावरण दिवस', 'Environment Day', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800', 'विभिन्न स्कूल', '2025-06-05'),
            ('स्नातक समारोह 2025', 'Graduation Ceremony 2025', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800', 'दंतेश्वरी महाविद्यालय', '2025-05-30')
        `);
    }

    // Seed teachers
    const teachersCount = await db.get('SELECT COUNT(*) as count FROM teachers');
    if (teachersCount.count === 0) {
        await db.run(`
            INSERT INTO teachers (name, name_en, subject, subject_en, institution_name, qualification, experience_years, contact)
            VALUES
            ('श्री राम प्रसाद यादव', 'Shri Ram Prasad Yadav', 'गणित', 'Mathematics', 'जवाहर नवोदय विद्यालय', 'M.Sc, B.Ed', 15, '9876543210'),
            ('श्रीमती सुनीता देवी', 'Smt. Sunita Devi', 'हिंदी', 'Hindi', 'केंद्रीय विद्यालय', 'MA Hindi, B.Ed', 12, '9812345678'),
            ('श्री अनिल कुमार', 'Shri Anil Kumar', 'विज्ञान', 'Science', 'शासकीय उच्चतर माध्यमिक विद्यालय', 'M.Sc Physics, B.Ed', 8, '9765432109'),
            ('श्रीमती प्रिया शर्मा', 'Smt. Priya Sharma', 'अंग्रेजी', 'English', 'केंद्रीय विद्यालय', 'MA English, B.Ed', 10, '9654321098'),
            ('श्री महेंद्र सिंह', 'Shri Mahendra Singh', 'सामाजिक विज्ञान', 'Social Science', 'एकलव्य आदर्श आवासीय विद्यालय', 'MA History, B.Ed', 7, '9543210987'),
            ('डॉ. नंदिनी वर्मा', 'Dr. Nandini Verma', 'रसायन विज्ञान', 'Chemistry', 'शासकीय महाविद्यालय', 'Ph.D Chemistry', 20, '9432109876')
        `);
    }

    console.log('Database initialized with all new features support.');
    return db;
}

module.exports = { initDb };
