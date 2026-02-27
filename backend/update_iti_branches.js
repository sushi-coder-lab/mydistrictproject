const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function updateBranches() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    const updates = [
        {
            name: 'शासकीय औद्योगिक प्रशिक्षण संस्था, गीदम (Govt. ITI Geedam)',
            subjects: 'इलेक्ट्रीशियन (Electrician): इलेक्ट्रिकल सिस्टम का ज्ञान।, फिटर (Fitter): मशीनरी असेंबलिंग और मरम्मत।, वायरमैन (Wireman): बिजली की फिटिंग का कार्य।, डीजल मैकेनिक (Mechanic Diesel): डीजल इंजन की मरम्मत।, कंप्यूटर ऑपरेटर और प्रोग्रामिंग सहायक (COPA): कंप्यूटर बेसिक और कोडिंग।'
        },
        {
            name: 'शासकीय औद्योगिक प्रशिक्षण संस्था, दंतेवाड़ा (Govt. ITI Dantewada)',
            subjects: 'इलेक्ट्रिशियन (Electrician), फिटर (Fitter), वेल्डर (Welder), कोपा (COPA), डीजल मैकेनिक (Mechanic Diesel)'
        },
        {
            name: 'शासकीय औद्योगिक प्रशिक्षण संस्था, कटेकल्याण (Govt. ITI Katekalyan)',
            subjects: 'इलेक्ट्रीशियन (Electrician): यह 2 वर्ष का इंजीनियरिंग पाठ्यक्रम है।, फिटर (Fitter): मशीनों के पुर्जों के रखरखाव से संबंधित यह 2 वर्ष का कोर्स है।, कोपा (COPA): यह 1 वर्ष का नॉन-इंजीनियरिंग कोर्स है जो कंप्यूटर संचालन और प्रोग्रामिंग पर आधारित है।, वेल्डर (Welder): धातुओं को जोड़ने की तकनीक सिखाने वाला यह 1 वर्ष का कोर्स है।, मैकेनिक डीजल (Mechanic Diesel): डीजल इंजनों की मरम्मत से संबंधित 1 वर्ष का कोर्स।'
        },
        {
            name: 'शासकीय औद्योगिक प्रशिक्षण संस्था, कुआकोंडा (Govt. ITI Kuakonda)',
            subjects: 'इलेक्ट्रीशियन (Electrician), फिटर (Fitter), मैकेनिक मोटर व्हीकल (Mechanic Motor Vehicle), वेल्डर (Welder), कम्प्यूटर ऑपरेटर एंड प्रोग्रामिंग असिस्टेंट (COPA)'
        },
        {
            name: 'NMDC DAV Industrial Training Institute, भंसी (NMDC DAV ITI Bhansi)',
            subjects: 'इलेक्ट्रीशियन (Electrician): 2 वर्ष, फिटर (Fitter): 2 वर्ष, मैकेनिक मोटर व्हीकल (MMV): 2 वर्ष, मैकेनिक डीजल (Mechanic Diesel): 1 वर्ष, वेल्डर (Welder): 1 वर्ष'
        },
        {
            name: 'शासकीय आईटीआई, चितालंका (Govt. ITI Chitalank)',
            subjects: 'इलेक्ट्रीशियन (Electrician): बिजली से संबंधित कार्य के लिए।, कोपा (COPA): कंप्यूटर ऑपरेटर के लिए।, फिटर (Fitter): मशीन के पुर्जों की फिटिंग के लिए।, वेल्डर (Welder): धातु जोड़ने के लिए।, मैकेनिक (डीजल/पेट्रोल): इंजन मैकेनिक के लिए।'
        }
    ];

    for (const update of updates) {
        await db.run('UPDATE institutions SET subjects = ? WHERE name = ?', [update.subjects, update.name]);
        console.log(`Updated branches for: ${update.name}`);
    }

    await db.close();
    console.log('Finished updating ITI branches.');
}

updateBranches().catch(console.error);
