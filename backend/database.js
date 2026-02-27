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

    // Seed data if empty
    const institutionsCount = await db.get('SELECT COUNT(*) as count FROM institutions');
    if (institutionsCount.count === 0) {
        await db.run(`
            INSERT INTO institutions (
                name, name_en, type, type_en, location, location_en, 
                streams, streams_en, subjects, subjects_en, 
                facilities, facilities_en, contact_details, contact_details_en, 
                admission_process, admission_process_en, map_location, image_url
            )
            VALUES 
            -- Schools
            (
                'जवाहर नवोदय विद्यालय, दंतेवाड़ा', 'Jawahar Navodaya Vidyalaya, Dantewada', 
                'School', 'School', 'दंतेवाड़ा', 'Dantewada', 
                'विज्ञान, वाणिज्य, कला', 'Science, Commerce, Arts', 
                'कक्षा 6 से 12 तक का पूर्ण पाठ्यक्रम', 'Full curriculum from class 6 to 12', 
                'छात्रावास, डाइनिंग हॉल, खेल का मैदान, विज्ञान प्रयोगशालाएं, स्मार्ट क्लासरूम', 'Hostel, Dining Hall, Playground, Science Labs, Smart Classrooms', 
                'प्राचार्य कार्यालय, जेएनवी दंतेवाड़ा, +91-7856-XXXXXX', 'Principal Office, JNV Dantewada, +91-7856-XXXXXX', 
                'कक्षा 6 के लिए जेएनवीएसटी चयन परीक्षा', 'JNVST Selection Test for Class 6', 
                'https://maps.google.com/?q=JNV+Dantewada', 'https://images.unsplash.com/photo-1523050853063-bd8012fbb7a1?w=800'
            ),
            (
                'केंद्रीय विद्यालय, दंतेवाड़ा', 'Kendriya Vidyalaya, Dantewada', 
                'School', 'School', 'दंतेवाड़ा', 'Dantewada', 
                'विज्ञान, वाणिज्य, कला', 'Science, Commerce, Arts', 
                'कक्षा 1 से 12 तक केवीएस मानदंड', 'KVS Norms for Class 1 to 12', 
                'कंप्यूटर लैब, लाइब्रेरी, विज्ञान लैब, खेल का मैदान', 'Computer Lab, Library, Science Lab, Playground', 
                'केवी दंतेवाड़ा, +91-7856-XXXXXX', 'KV Dantewada, +91-7856-XXXXXX', 
                'ऑनलाइन केवीएस प्रवेश पोर्टल', 'Online KVS Admission Portal', 
                'https://maps.google.com/?q=KV+Dantewada', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800'
            ),
            (
                'एकलव्य आदर्श आवासीय विद्यालय, गीदम', 'Eklavya Model Residential School, Geedam', 
                'School', 'School', 'गीदम', 'Geedam', 
                'विज्ञान, कला', 'Science, Arts', 
                'आवासीय कक्षाएं 6 से 12 तक', 'Residential Classes 6 to 12', 
                'पूर्ण आवासीय, आधुनिक लैब, लाइब्रेरी', 'Fully Residential, Modern Labs, Library', 
                'गीदम, +91-7856-XXXXXX', 'Geedam, +91-7856-XXXXXX', 
                'ईएमआरएस प्रवेश परीक्षा', 'EMRS Entrance Exam', 
                'https://maps.google.com/?q=EMRS+Geedam', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'
            ),
            (
                'शासकीय कन्या उच्चतर माध्यमिक विद्यालय, दंतेवाड़ा', 'Govt Girls Higher Secondary School, Dantewada', 
                'School', 'School', 'दंतेवाड़ा', 'Dantewada', 
                'विज्ञान, कला, वाणिज्य', 'Science, Arts, Commerce', 
                'हिंदी और अंग्रेजी माध्यम, कक्षा 9-12', 'Hindi and English Medium, Class 9-12', 
                'लाइब्रेरी, खेल, लैब', 'Library, Sports, Labs', 
                'दंतेवाड़ा, +91-7856-XXXXXX', 'Dantewada, +91-7856-XXXXXX', 
                'प्रत्यक्ष प्रवेश', 'Direct Admission', 
                'https://maps.google.com/?q=Govt+Girls+School+Dantewada', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'
            ),
            (
                'डीएवी मुख्यमंत्री पब्लिक स्कूल, मोखपाल', 'DAV Mukhyamantri Public School, Mokhpal', 
                'School', 'School', 'कटेकल्याण', 'Katekalyan', 
                'विज्ञान, वाणिज्य', 'Science, Commerce', 
                'सीबीएसई पैटर्न, कक्षा 1 से 12', 'CBSE Pattern, Class 1-12', 
                'स्मार्ट क्लासेस, एक्टिविटी रूम, स्पोर्ट्स', 'Smart Classes, Activity Room, Sports', 
                'मोखपाल, कटेकल्याण, +91-7856-XXXXXX', 'Mokhpal, Katekalyan, +91-7856-XXXXXX', 
                'मेरिट आधारित प्रवेश', 'Merit Based Admission', 
                'https://maps.google.com/?q=DAV+Mokhpal', 'https://images.unsplash.com/photo-1523050853063-bd8012fbb7a1?w=800'
            ),
            (
                'शासकीय हाई स्कूल, भांसी', 'Govt High School, Bhansi', 
                'School', 'School', 'दंतेवाड़ा', 'Dantewada', 
                'सामान्य', 'General', 
                'कक्षा 9 से 10 तक', 'Class 9 to 10', 
                'खेल का मैदान, लाइब्रेरी', 'Playground, Library', 
                'भांसी, दंतेवाड़ा', 'Bhansi, Dantewada', 
                'प्रत्यक्ष प्रवेश', 'Direct Admission', 
                'https://maps.google.com/?q=Govt+High+School+Bhansi', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'
            ),
            (
                'शासकीय हाई स्कूल, बालूद', 'Govt High School, Balood', 
                'School', 'School', 'दंतेवाड़ा', 'Dantewada', 
                'सामान्य', 'General', 
                'कक्षा 9 से 10 तक', 'Class 9 to 10', 
                'लाइब्रेरी, खेल की सुविधा', 'Library, Sports facilities', 
                'बालूद, दंतेवाड़ा', 'Balood, Dantewada', 
                'प्रत्यक्ष प्रवेश', 'Direct Admission', 
                'https://maps.google.com/?q=Govt+High+School+Balood', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'
            ),
            (
                'शासकीय हाई स्कूल, कटेकल्याण', 'Govt High School, Katekalyan', 
                'School', 'School', 'कटेकल्याण', 'Katekalyan', 
                'सामान्य', 'General', 
                'कक्षा 9 से 10 तक', 'Class 9 to 10', 
                'बुनियादी सुविधाएं, खेल', 'Basic amenities, Sports', 
                'कटेकल्याण, दंतेवाड़ा', 'Katekalyan, Dantewada', 
                'प्रत्यक्ष प्रवेश', 'Direct Admission', 
                'https://maps.google.com/?q=Govt+High+School+Katekalyan', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'
            ),
            (
                'शासकीय कन्या उच्चतर माध्यमिक विद्यालय, गीदम', 'Govt Girls Higher Secondary School, Geedam', 
                'School', 'School', 'गीदम', 'Geedam', 
                'विज्ञान, वाणिज्य, कला', 'Science, Commerce, Arts', 
                'कक्षा 9 से 12', 'Class 9 to 12', 
                'लैब, लाइब्रेरी, स्पोर्ट्स', 'Labs, Library, Sports', 
                'गीदम, दंतेवाड़ा', 'Geedam, Dantewada', 
                'प्रत्यक्ष प्रवेश', 'Direct Admission', 
                'https://maps.google.com/?q=Govt+Girls+HSS+Geedam', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'
            ),
            (
                'निर्मल निकेतन हाई स्कूल, दंतेवाड़ा', 'Nirmal Niketan High School, Dantewada', 
                'School', 'School', 'दंतेवाड़ा', 'Dantewada', 
                'विज्ञान, वाणिज्य', 'Science, Commerce', 
                'अंग्रेजी माध्यम, कक्षा 1 से 10', 'English Medium, Class 1-10', 
                'कंप्यूटर लैब, संगीत, खेल', 'Computer Lab, Music, Sports', 
                'दंतेवाड़ा, +91-7856-XXXXXX', 'Dantewada, +91-7856-XXXXXX', 
                'प्रवेश परीक्षा/मेरिट', 'Entrance Exam/Merit', 
                'https://maps.google.com/?q=Nirmal+Niketan+Dantewada', 'https://images.unsplash.com/photo-1523050853063-bd8012fbb7a1?w=800'
            ),

            -- Colleges
            (
                'शासकीय दंतेश्वरी स्नाकोत्तर महाविद्यालय, दंतेवाड़ा', 'Govt Danteshwari Post Graduate College, Dantewada', 
                'College', 'College', 'दंतेवाड़ा', 'Dantewada', 
                'विज्ञान, वाणिज्य, कला', 'Science, Commerce, Arts', 
                'UG: B.A, B.Sc, B.Com; PG: M.A, M.Sc, M.Com', 'UG: B.A, B.Sc, B.Com; PG: M.A, M.Sc, M.Com', 
                'लाइब्रेरी, विज्ञान लैब, खेल का मैदान, ऑडिटोरियम', 'Library, Science Lab, Playground, Auditorium', 
                'मेन रोड चितलंका, दंतेवाड़ा, +91-7856-252XXX', 'Main Road Chitalanka, Dantewada, +91-7856-252XXX', 
                'विश्वविद्यालय मेरिट मानदंड', 'University Merit Criteria', 
                'https://maps.google.com/?q=Danteshwari+College+Dantewada', 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800'
            ),
            (
                'शासकीय अरविंद महाविद्यालय, किरंदुल', 'Govt Arvind College, Kirandul', 
                'College', 'College', 'किरंदुल', 'Kirandul', 
                'कला, वाणिज्य, विज्ञान', 'Arts, Commerce, Science', 
                'औद्योगिक क्षेत्र के लिए स्नातक कार्यक्रम', 'Undergraduate programs for industrial area', 
                'लाइब्रेरी, लैब, सांस्कृतिक केंद्र', 'Library, Labs, Cultural Center', 
                'किरंदुल, दंतेवाड़ा, +91-7857-XXXXXX', 'Kirandul, Dantewada, +91-7857-XXXXXX', 
                'प्रत्यक्ष नामांकन', 'Direct Enrollment', 
                'https://maps.google.com/?q=Arvind+College+Kirandul', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'
            ),
            (
                'एन.एम.डी.सी./डीएवी पॉलिटेक्निक, गीदम', 'NMDC/DAV Polytechnic, Geedam', 
                'College', 'College', 'गीदम', 'Geedam', 
                'पॉलिटेक्निक', 'Polytechnic', 
                'मैकेनिकल, इलेक्ट्रिकल, माइनिंग इंजीनियरिंग में डिप्लोमा', 'Diploma in Mechanical, Electrical, Mining Engineering', 
                'उन्नत इंजीनियरिंग वर्कशॉप, प्लेसमेंट सेल, हॉस्टल', 'Advanced Engineering Workshop, Placement Cell, Hostel', 
                'एजुकेशन सिटी जवांगा, गीदम, +91-7856-XXXXXX', 'Education City Javanga, Geedam, +91-7856-XXXXXX', 
                'पीपीटी परीक्षा स्कोर', 'PPT Exam Scores', 
                'https://maps.google.com/?q=NMDC+DAV+Polytechnic', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
            ),
            (
                'लाईवलीहुड कॉलेज, दंतेवाड़ा', 'Livelihood College, Dantewada', 
                'College', 'College', 'दंतेवाड़ा', 'Dantewada', 
                'व्यावसायिक', 'Vocational', 
                'अल्पकालिक कौशल विकास: आईटी, आतिथ्य, सिलाई', 'Short-term Skill Development: IT, Hospitality, Tailoring', 
                'प्रशिक्षण लैब, प्लेसमेंट सेल', 'Training Labs, Placement Cell', 
                'कलेक्टर कार्यालय के पीछे, दंतेवाड़ा, +91-7856-XXXXXX', 'Behind Collector Office, Dantewada, +91-7856-XXXXXX', 
                'कौशल प्रशिक्षण के लिए सीधे आएं', 'Visit directly for skill training', 
                'https://maps.google.com/?q=Livelihood+College+Dantewada', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
            ),
            (
                'कृषि महाविद्यालय, दंतेवाड़ा (निजी)', 'Agriculture College, Dantewada (Private)', 
                'College', 'College', 'दंतेवाड़ा', 'Dantewada', 
                'कृषि', 'Agriculture', 
                'बी.एससी. कृषि, अनुसंधान कार्यक्रम', 'B.Sc Agriculture, Research Programs', 
                'कृषि फार्म, अनुसंधान लैब', 'Agriculture Farm, Research Labs', 
                'कलेक्टर कार्यालय के पास, दंतेवाड़ा, +91-7856-XXXXXX', 'Near Collector Office, Dantewada, +91-7856-XXXXXX', 
                'पैट (PAT) प्रवेश परीक्षा', 'PAT Entrance Exam', 
                'https://maps.google.com/?q=Agriculture+College+Dantewada', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800'
            ),
            (
                'शासकीय नवीन कॉलेज, कुआकोंडा', 'Govt New College, Kuakonda', 
                'College', 'College', 'कुआकोंडा', 'Kuakonda', 
                'कला, विज्ञान', 'Arts, Science', 
                'कुआकोंडा ब्लॉक में नया सरकारी डिग्री कॉलेज', 'New Govt Degree College in Kuakonda block', 
                'कक्षाएं, लाइब्रेरी, खेल', 'Classes, Library, Sports', 
                'नकुलनार, कुआकोंडा, +91-7856-XXXXXX', 'Nakulnar, Kuakonda, +91-7856-XXXXXX', 
                'मेरिट आधारित प्रवेश', 'Merit Based Admission', 
                'https://maps.google.com/?q=Naveen+College+Kuakonda', 'https://images.unsplash.com/photo-1497633762265-9a179a63efb0?w=800'
            ),
            (
                'शासकीय महेंद्र कर्मा कन्या महाविद्यालय, दंतेवाड़ा', 'Govt Mahendra Karma Girls College, Dantewada', 
                'College', 'College', 'दंतेवाड़ा', 'Dantewada', 
                'कला, वाणिज्य, विज्ञान', 'Arts, Commerce, Science', 
                'कन्याओं के लिए स्नातक और स्नातकोत्तर पाठ्यक्रम', 'UG and PG courses for girls', 
                'छात्रावास, लाइब्रेरी, खेल', 'Hostel, Library, Sports', 
                'दंतेवाड़ा, +91-7856-XXXXXX', 'Dantewada, +91-7856-XXXXXX', 
                'मेरिट आधारित प्रवेश', 'Merit Based Admission', 
                'https://maps.google.com/?q=Mahendra+Karma+College+Dantewada', 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800'
            ),
            (
                'शासकीय मॉडल आवासीय महाविद्यालय, जवांगा', 'Govt Model Residential College, Javanga', 
                'College', 'College', 'गीदम', 'Geedam', 
                'कला, विज्ञान', 'Arts, Science', 
                'आधुनिक आवासीय स्नातक कॉलेज', 'Modern Residential Undergraduate College', 
                'आवासीय सुविधा, वाईफाई, डिजिटल लाइब्रेरी', 'Residential Facility, WiFi, Digital Library', 
                'जवांगा, गीदम, दंतेवाड़ा', 'Javanga, Geedam, Dantewada', 
                'मेरिट आधारित प्रवेश', 'Merit Based Admission', 
                'https://maps.google.com/?q=Model+College+Javanga', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'
            ),

            -- ITIs
            (
                'शासकीय औद्योगिक प्रशिक्षण संस्था, गीदम', 'Govt Industrial Training Institute (ITI), Geedam', 
                'ITI', 'ITI', 'गीदम', 'Geedam', 
                'आईटीआई', 'ITI', 
                'इलेक्ट्रीशियन, फिटर, वायरमैन, डीजल मैकेनिक, कोपा', 'Electrician, Fitter, Wireman, Diesel Mechanic, COPA', 
                'तकनीकी कार्यशाला, शिक्षुता सेल', 'Technical Workshop, Apprenticeship Cell', 
                'गीदम, +91-7856-XXXXXX', 'Geedam, +91-7856-XXXXXX', 
                'सीजी आईटीआई पोर्टल', 'CG ITI Portal', 
                'https://maps.google.com/?q=ITI+Geedam', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'
            ),
            (
                'शासकीय औद्योगिक प्रशिक्षण संस्था, दंतेवाड़ा', 'Govt Industrial Training Institute (ITI), Dantewada', 
                'ITI', 'ITI', 'दंतेवाड़ा', 'Dantewada', 
                'आईटीआई', 'ITI', 
                'इलेक्ट्रिशियन, फिटर, वेल्डर, कोपा, डीजल मैकेनिक', 'Electrician, Fitter, Welder, COPA, Diesel Mechanic', 
                'कार्यशाला, उद्योग प्रशिक्षण', 'Workshop, Industry Training', 
                'चितलंका, दंतेवाड़ा, +91-7856-XXXXXX', 'Chitalanka, Dantewada, +91-7856-XXXXXX', 
                'ऑनलाइन पंजीकरण', 'Online Registration', 
                'https://maps.google.com/?q=ITI+Dantewada', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'
            ),
            (
                'शासकीय औद्योगिक प्रशिक्षण संस्था, कटेकल्याण', 'Govt Industrial Training Institute (ITI), Katekalyan', 
                'ITI', 'ITI', 'कटेकल्याण', 'Katekalyan', 
                'आईटीआई', 'ITI', 
                'इलेक्ट्रीशियन, फिटर, कोपा, वेल्डर, मैकेनिक डीजल', 'Electrician, Fitter, COPA, Welder, Mechanic Diesel', 
                'आधुनिक प्रशिक्षण सुविधाएं, लैब', 'Modern Training Facilities, Labs', 
                'कटेकल्याण, +91-7856-XXXXXX', 'Katekalyan, +91-7856-XXXXXX', 
                'प्रत्यक्ष प्रवेश/आईटीआई पोर्टल', 'Direct Admission/ITI Portal', 
                'https://maps.google.com/?q=ITI+Katekalyan', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'
            ),
            (
                'शासकीय औद्योगिक प्रशिक्षण संस्था, कुआकोंडा', 'Govt Industrial Training Institute (ITI), Kuakonda', 
                'ITI', 'ITI', 'कुआकोंडा', 'Kuakonda', 
                'आईटीआई', 'ITI', 
                'इलेक्ट्रीशियन, फिटर, मैकेनिक मोटर व्हीकल, वेल्डर, कोपा', 'Electrician, Fitter, Mechanic Motor Vehicle, Welder, COPA', 
                'कार्यशाला, प्रैक्टिकल लैब', 'Workshop, Practical Lab', 
                'कुआकोंडा, +91-7856-XXXXXX', 'Kuakonda, +91-7856-XXXXXX', 
                'प्रत्यक्ष प्रवेश/आईटीआई पोर्टल', 'Direct Admission/ITI Portal', 
                'https://maps.google.com/?q=ITI+Kuakonda', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'
            ),
            (
                'एन.एम.डी.सी. डीएवी औद्योगिक प्रशिक्षण संस्था, भांसी', 'NMDC DAV Industrial Training Institute (ITI), Bhansi', 
                'ITI', 'ITI', 'दंतेवाड़ा', 'Dantewada', 
                'आईटीआई', 'ITI', 
                'इलेक्ट्रीशियन, फिटर, मैकेनिक मोटर व्हीकल, मैकेनिक डीजल, वेल्डर', 'Electrician, Fitter, Mechanic Motor Vehicle, Mechanic Diesel, Welder', 
                'आधुनिक कार्यशाला, प्लेसमेंट सेल', 'Modern Workshop, Placement Cell', 
                'भांसी, दंतेवाड़ा, +91-7856-XXXXXX', 'Bhansi, Dantewada, +91-7856-XXXXXX', 
                'एनएमडीसी/डीएवी चयन मानदंड', 'NMDC/DAV Selection Criteria', 
                'https://maps.google.com/?q=ITI+Bhansi', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'
            ),
            (
                'शासकीय औद्योगिक प्रशिक्षण संस्था, चितालंका', 'Govt Industrial Training Institute (ITI), Chitalanka', 
                'ITI', 'ITI', 'दंतेवाड़ा', 'Dantewada', 
                'आईटीआई', 'ITI', 
                'इलेक्ट्रीशियन, कोपा, फिटर, वेल्डर, मैकेनिक (डीजल/पेट्रोल)', 'Electrician, COPA, Fitter, Welder, Mechanic (Diesel/Petrol)', 
                'प्रैक्टिकल कार्यशाला, लाइब्रेरी', 'Practical Workshop, Library', 
                'चितलंका, दंतेवाड़ा, +91-7856-XXXXXX', 'Chitalanka, Dantewada, +91-7856-XXXXXX', 
                'आईटीआई प्रवेश पोर्टल', 'ITI Admission Portal', 
                'https://maps.google.com/?q=ITI+Chitalanka', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'
            )
        `);

        await db.run(`
            INSERT INTO updates (title, title_en, content, content_en)
            VALUES 
            ('नवगुरुकुल एडमिशन 2026', 'NavGurukul Admission 2026', 'सॉफ्टवेयर इंजीनियरिंग में फ्री आवासीय कोर्स। अण्डरसर्वेड युवाओं के लिए सुनहरा अवसर। admissions.navgurukul.org पर आवेदन करें।', 'Free residential software engineering course. Golden opportunity for underserved youth. Apply at admissions.navgurukul.org'),
            ('एकलव्य विद्यालय प्रवेश सूचना', 'EMRS Admission Alert', 'कक्षा 6वीं प्रवेश परीक्षा 2026-27 के लिए एडमिट कार्ड जारी कर दिए गए हैं। अधिक जानकारी के लिए cg.nic.in देखें।', 'Admit cards for Class 6th Entrance Exam 2026-27 have been issued. Check cg.nic.in for more details.'),
            ('दंतेवाड़ा में नया मेडिकल कॉलेज', 'New Medical College in Dantewada', 'छत्तीसगढ़ बजट 2026-27 में दंतेवाड़ा में नए मेडिकल कॉलेज की स्थापना के लिए ₹50 करोड़ का प्रावधान किया गया है।', '₹50 crore allocated in Chhattisgarh Budget 2026-27 for establishing a new medical college in Dantewada.'),
            ('शासकीय पीजी कॉलेज प्रवेश', 'Govt PG College Admission', 'स्नातक (UG) और स्नातकोत्तर (PG) पाठ्यक्रमों के लिए सत्र 2026 के प्रवेश अब चालू हैं। मेरिट के आधार पर होगा चयन।', 'Admissions for UG and PG courses for the 2026 session are now OPEN. Selection based on merit.')
        `);

        await db.run(`
            INSERT INTO admins (username, password)
            VALUES ('admin', 'admin123')
        `);

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
