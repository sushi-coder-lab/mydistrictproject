const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function restoreInstitutions() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Clear existing institutions to prevent duplicates and ensure clean Hindi rename
    await db.exec('DELETE FROM institutions');
    await db.exec('DELETE FROM updates');

    const institutions = [
        // Schools
        ['जवाहर नवोदय विद्यालय, दंतेवाड़ा', 'School', 'Dantewada', 'Science, Commerce, Arts', 'कक्षा 6 से 12 तक का पूर्ण पाठ्यक्रम', 'छात्रावास, डाइनिंग हॉल, खेल का मैदान, विज्ञान प्रयोगशालाएं, स्मार्ट क्लासरूम', 'प्राचार्य कार्यालय, जेएनवी दंतेवाड़ा, +91-7856-XXXXXX', 'कक्षा 6 के लिए जेएनवीएसटी चयन परीक्षा', 'https://maps.google.com/?q=JNV+Dantewada', 'https://images.unsplash.com/photo-1523050853063-bd8012fbb7a1?w=800'],
        ['केंद्रीय विद्यालय, दंतेवाड़ा', 'School', 'Dantewada', 'Science, Commerce, Arts', 'कक्षा 1 से 12 तक केवीएस मानदंड', 'कंप्यूटर लैब, लाइब्रेरी, विज्ञान लैब, खेल का मैदान', 'केवी दंतेवाड़ा, +91-7856-XXXXXX', 'ऑनलाइन केवीएस प्रवेश पोर्टल', 'https://maps.google.com/?q=KV+Dantewada', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800'],
        ['एकलव्य आदर्श आवासीय विद्यालय, गीदम', 'School', 'Geedam', 'Science, Arts', 'आवासीय कक्षाएं 6 से 12 तक', 'पूर्ण आवासीय, आधुनिक लैब, लाइब्रेरी', 'गीदम, +91-7856-XXXXXX', 'ईएमआरएस प्रवेश परीक्षा', 'https://maps.google.com/?q=EMRS+Geedam', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'],
        ['शासकीय कन्या उच्चतर माध्यमिक विद्यालय, दंतेवाड़ा', 'School', 'Dantewada', 'Science, Arts, Commerce', 'हिंदी और अंग्रेजी माध्यम, कक्षा 9-12', 'लाइब्रेरी, खेल, लैब', 'दंतेवाड़ा, +91-7856-XXXXXX', 'प्रत्यक्ष प्रवेश', 'https://maps.google.com/?q=Govt+Girls+School+Dantewada', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'],
        ['डीएवी मुख्यमंत्री पब्लिक स्कूल, मोखपाल', 'School', 'Katekalyan', 'Science, Commerce', 'सीबीएसई पैटर्न, कक्षा 1 से 12', 'स्मार्ट क्लासेस, एक्टिविटी रूम, स्पोर्ट्स', 'मोखपाल, कटेकल्याण, +91-7856-XXXXXX', 'मेरिट आधारित प्रवेश', 'https://maps.google.com/?q=DAV+Mokhpal', 'https://images.unsplash.com/photo-1523050853063-bd8012fbb7a1?w=800'],
        ['शासकीय हाई स्कूल, भांसी', 'School', 'Dantewada', 'General', 'कक्षा 9 से 10 तक', 'खेल का मैदान, लाइब्रेरी', 'भांसी, दंतेवाड़ा', 'प्रत्यक्ष प्रवेश', 'https://maps.google.com/?q=Govt+High+School+Bhansi', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'],
        ['शासकीय हाई स्कूल, बालूद', 'School', 'Dantewada', 'General', 'कक्षा 9 से 10 तक', 'लाइब्रेरी, खेल की सुविधा', 'बालूद, दंतेवाड़ा', 'प्रत्यक्ष प्रवेश', 'https://maps.google.com/?q=Govt+High+School+Balood', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'],
        ['शासकीय हाई स्कूल, कटेकल्याण', 'School', 'Katekalyan', 'General', 'कक्षा 9 से 10 तक', 'बुनियादी सुविधाएं, खेल', 'कटेकल्याण, दंतेवाड़ा', 'प्रत्यक्ष प्रवेश', 'https://maps.google.com/?q=Govt+High+School+Katekalyan', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'],
        ['शासकीय कन्या उच्चतर माध्यमिक विद्यालय, गीदम', 'School', 'Geedam', 'Science, Commerce, Arts', 'कक्षा 9 से 12', 'लैब, लाइब्रेरी, स्पोर्ट्स', 'गीदम, दंतेवाड़ा', 'प्रत्यक्ष प्रवेश', 'https://maps.google.com/?q=Govt+Girls+HSS+Geedam', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'],
        ['निर्मल निकेतन हाई स्कूल, दंतेवाड़ा', 'School', 'Dantewada', 'Science, Commerce', 'अंग्रेजी माध्यम, कक्षा 1 से 10', 'कंप्यूटर लैब, संगीत, खेल', 'दंतेवाड़ा, +91-7856-XXXXXX', 'प्रवेश परीक्षा/मेरिट', 'https://maps.google.com/?q=Nirmal+Niketan+Dantewada', 'https://images.unsplash.com/photo-1523050853063-bd8012fbb7a1?w=800'],

        // Colleges
        ['शासकीय दंतेश्वरी स्नाकोत्तर महाविद्यालय, दंतेवाड़ा', 'College', 'Dantewada', 'Science, Commerce, Arts', 'UG: B.A, B.Sc, B.Com; PG: M.A, M.Sc, M.Com', 'लाइब्रेरी, विज्ञान लैब, खेल का मैदान, ऑडिटोरियम', 'मेन रोड चितलंका, दंतेवाड़ा, +91-7856-252XXX', 'विश्वविद्यालय मेरिट मानदंड', 'https://maps.google.com/?q=Danteshwari+College+Dantewada', 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800'],
        ['शासकीय अरविंद महाविद्यालय, किरंदुल', 'College', 'Kirandul', 'Arts, Commerce, Science', 'औद्योगिक क्षेत्र के लिए स्नातक कार्यक्रम', 'लाइब्रेरी, लैब, सांस्कृतिक केंद्र', 'किरंदुल, दंतेवाड़ा, +91-7857-XXXXXX', 'प्रत्यक्ष नामांकन', 'https://maps.google.com/?q=Arvind+College+Kirandul', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'],
        ['एन.एम.डी.सी./डीएवी पॉलिटेक्निक, गीदम', 'College', 'Geedam', 'Polytechnic', 'मैकेनिकल, इलेक्ट्रिकल, माइनिंग इंजीनियरिंग में डिप्लोमा', 'उन्नत इंजीनियरिंग वर्कशॉप, प्लेसमेंट सेल, हॉस्टल', 'एजुकेशन सिटी जवांगा, गीदम, +91-7856-XXXXXX', 'पीपीटी परीक्षा स्कोर', 'https://maps.google.com/?q=NMDC+DAV+Polytechnic', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
        ['लाईवलीहुड कॉलेज, दंतेवाड़ा', 'College', 'Dantewada', 'Vocational', 'अल्पकालिक कौशल विकास: आईटी, आतिथ्य, सिलाई', 'प्रशिक्षण लैब, प्लेसमेंट सेल', 'कलेक्टर कार्यालय के पीछे, दंतेवाड़ा, +91-7856-XXXXXX', 'कौशल प्रशिक्षण के लिए सीधे आएं', 'https://maps.google.com/?q=Livelihood+College+Dantewada', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
        ['कृषि महाविद्यालय, दंतेवाड़ा (निजी)', 'College', 'Dantewada', 'Agriculture', 'बी.एससी. कृषि, अनुसंधान कार्यक्रम', 'कृषि फार्म, अनुसंधान लैब', 'कलेक्टर कार्यालय के पास, दंतेवाड़ा, +91-7856-XXXXXX', 'पैट (PAT) प्रवेश परीक्षा', 'https://maps.google.com/?q=Agriculture+College+Dantewada', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800'],
        ['शासकीय नवीन कॉलेज, कुआकोंडा', 'College', 'Kuakonda', 'Arts, Science', 'कुआकोंडा ब्लॉक में नया सरकारी डिग्री कॉलेज', 'कक्षाएं, लाइब्रेरी, खेल', 'नकुलनार, कुआकोंडा, +91-7856-XXXXXX', 'मेरिट आधारित प्रवेश', 'https://maps.google.com/?q=Naveen+College+Kuakonda', 'https://images.unsplash.com/photo-1497633762265-9a179a63efb0?w=800'],
        ['शासकीय महेंद्र कर्मा कन्या महाविद्यालय, दंतेवाड़ा', 'College', 'Dantewada', 'Arts, Commerce, Science', 'कन्याओं के लिए स्नातक और स्नातकोत्तर पाठ्यक्रम', 'छात्रावास, लाइब्रेरी, खेल', 'दंतेवाड़ा, +91-7856-XXXXXX', 'मेरिट आधारित प्रवेश', 'https://maps.google.com/?q=Mahendra+Karma+College+Dantewada', 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800'],
        ['शासकीय मॉडल आवासीय महाविद्यालय, जवांगा', 'College', 'Geedam', 'Arts, Science', 'आधुनिक आवासीय स्नातक कॉलेज', 'आवासीय सुविधा, वाईफाई, डिजिटल लाइब्रेरी', 'जवांगा, गीदम, दंतेवाड़ा', 'मेरिट आधारित प्रवेश', 'https://maps.google.com/?q=Model+College+Javanga', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'],

        // ITIs
        ['शासकीय औद्योगिक प्रशिक्षण संस्था, गीदम', 'College', 'Geedam', 'ITI', 'इलेक्ट्रीशियन (Electrician): इलेक्ट्रिकल सिस्टम का ज्ञान।, फिटर (Fitter): मशीनरी असेंबलिंग और मरम्मत।, वायरमैन (Wireman): बिजली की फिटिंग का कार्य।, डीजल मैकेनिक (Mechanic Diesel): डीजल इंजन की मरम्मत।, कंप्यूटर ऑपरेटर और प्रोग्रामिंग सहायक (COPA): कंप्यूटर बेसिक और कोडिंग।', 'तकनीकी कार्यशाला, शिक्षुता सेल', 'गीदम, +91-7856-XXXXXX', 'सीजी आईटीआई पोर्टल', 'https://maps.google.com/?q=ITI+Geedam', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
        ['शासकीय औद्योगिक प्रशिक्षण संस्था, दंतेवाड़ा', 'College', 'Dantewada', 'ITI', 'इलेक्ट्रिशियन (Electrician), फिटर (Fitter), वेल्डर (Welder), कोपा (COPA), डीजल मैकेनिक (Mechanic Diesel)', 'कार्यशाला, उद्योग प्रशिक्षण', 'चितलंका, दंतेवाड़ा, +91-7856-XXXXXX', 'ऑनलाइन पंजीकरण', 'https://maps.google.com/?q=ITI+Dantewada', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
        ['शासकीय औद्योगिक प्रशिक्षण संस्था, कटेकल्याण', 'College', 'Katekalyan', 'ITI', 'इलेक्ट्रीशियन (Electrician): यह 2 वर्ष का इंजीनियरिंग पाठ्यक्रम है।, फिटर (Fitter): मशीनों के पुर्जों के रखरखाव से संबंधित यह 2 वर्ष का कोर्स है।, कोपा (COPA): यह 1 वर्ष का नॉन-इंजीनियरिंग कोर्स है जो कंप्यूटर संचालन और प्रोग्रामिंग पर आधारित है।, वेल्डर (Welder): धातुओं को जोड़ने की तकनीक सिखाने वाला यह 1 वर्ष का कोर्स है।, मैकेनिक डीजल (Mechanic Diesel): डीजल इंजनों की मरम्मत से संबंधित 1 वर्ष का कोर्स।', 'आधुनिक प्रशिक्षण सुविधाएं, लैब', 'कटेकल्याण, +91-7856-XXXXXX', 'प्रत्यक्ष प्रवेश/आईटीआई पोर्टल', 'https://maps.google.com/?q=ITI+Katekalyan', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
        ['शासकीय औद्योगिक प्रशिक्षण संस्था, कुआकोंडा', 'College', 'Kuakonda', 'ITI', 'इलेक्ट्रीशियन (Electrician), फिटर (Fitter), मैकेनिक मोटर व्हीकल (Mechanic Motor Vehicle), वेल्डर (Welder), कम्प्यूटर ऑपरेटर एंड प्रोग्रामिंग असिस्टेंट (COPA)', 'कार्यशाला, प्रैक्टिकल लैब', 'कुआकोंडा, +91-7856-XXXXXX', 'प्रत्यक्ष प्रवेश/आईटीआई पोर्टल', 'https://maps.google.com/?q=ITI+Kuakonda', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
        ['एन.एम.डी.सी. डीएवी औद्योगिक प्रशिक्षण संस्था, भांसी', 'College', 'Dantewada', 'ITI', 'इलेक्ट्रीशियन (Electrician): 2 वर्ष, फिटर (Fitter): 2 वर्ष, मैकेनिक मोटर व्हीकल (MMV): 2 वर्ष, मैकेनिक डीजल (Mechanic Diesel): 1 वर्ष, वेल्डर (Welder): 1 वर्ष', 'आधुनिक कार्यशाला, प्लेसमेंट सेल', 'भांसी, दंतेवाड़ा, +91-7856-XXXXXX', 'एनएमडीसी/डीएवी चयन मानदंड', 'https://maps.google.com/?q=ITI+Bhansi', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
        ['शासकीय औद्योगिक प्रशिक्षण संस्था, चितालंका', 'College', 'Dantewada', 'ITI', 'इलेक्ट्रीशियन (Electrician): बिजली से संबंधित कार्य के लिए।, कोपा (COPA): कंप्यूटर ऑपरेटर के लिए।, फिटर (Fitter): मशीन के पुर्जों की फिटिंग के लिए।, वेल्डर (Welder): धातु जोड़ने के लिए।, मैकेनिक (डीजल/पेट्रोल): इंजन मैकेनिक के लिए।', 'प्रैक्टिकल कार्यशाला, लाइब्रेरी', 'चितलंका, दंतेवाड़ा, +91-7856-XXXXXX', 'आईटीआई प्रवेश पोर्टल', 'https://maps.google.com/?q=ITI+Chitalanka', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800']
    ];

    const stmt = await db.prepare('INSERT INTO institutions (name, type, location, streams, subjects, facilities, contact_details, admission_process, map_location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

    for (const inst of institutions) {
        await stmt.run(inst);
        console.log(`Restored/Added: ${inst[0]}`);
    }
    await stmt.finalize();

    await db.run(`
        INSERT INTO updates (title, content)
        VALUES 
        ('संस्थानों की सूची अपडेट की गई', 'दंतेवाड़ा जिले के सभी ब्लॉक के स्कूलों और कॉलेजों की सूची को हिंदी में अपडेट कर दिया गया है।'),
        ('आईटीआई प्रवेश अलर्ट', 'गीदम, दंतेवाड़ा, कटेकल्याण और कुआकोंडा के लिए सरकारी आईटीआई प्रवेश जल्द ही खुल रहे हैं।'),
        ('कुआकोंडा में नया कॉलेज', 'शासकीय नवीन कॉलेज कुआकोंडा अब पहले बैच के लिए आवेदन आमंत्रित कर रहा है।')
    `);

    await db.close();
    console.log('Finished restoring institutions.');
}

restoreInstitutions().catch(console.error);
