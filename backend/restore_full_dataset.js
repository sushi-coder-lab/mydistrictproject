const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function restoreFullDataset() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Clear existing institutions
    await db.exec('DELETE FROM institutions');
    console.log('Cleared existing institutions.');

    // Path to the JSON snapshot (found in previous session's temporary storage)
    const snapshotPath = '/home/ng/.gemini/antigravity/brain/c27075c1-254a-4553-a7e2-b4c987efcfc8/.tempmediaStorage/dom_1772170262842.txt';
    const rawContent = fs.readFileSync(snapshotPath, 'utf8');

    // Extract JSON array from the DOM snapshot
    const jsonMatch = rawContent.match(/<current_dom>\n([\s\S]*)\n<\/current_dom>/);
    if (!jsonMatch) {
        throw new Error('Could not find JSON data in snapshot');
    }

    const institutions = JSON.parse(jsonMatch[1]);
    console.log(`Found ${institutions.length} institutions in snapshot.`);

    const stmt = await db.prepare(`
        INSERT INTO institutions (
            name, name_en, type, type_en, location, location_en, 
            streams, streams_en, subjects, subjects_en, 
            facilities, facilities_en, contact_details, contact_details_en, 
            admission_process, admission_process_en, map_location, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let count = 0;
    for (const inst of institutions) {
        // Group ITIs under 'College' category as requested
        let type = inst.type;
        let type_en = inst.type_en;

        if (type === 'ITI') {
            type = 'College';
            type_en = 'College (ITI)'; // Keep note of ITI in English label for clarity, or just 'College'
        }

        await stmt.run(
            inst.name, inst.name_en, type, type_en, inst.location, inst.location_en,
            inst.streams, inst.streams_en, inst.subjects, inst.subjects_en,
            inst.facilities, inst.facilities_en, inst.contact_details, inst.contact_details_en,
            inst.admission_process, inst.admission_process_en, inst.map_location, inst.image_url
        );
        count++;
        if (count % 100 === 0) console.log(`Restored ${count} institutions...`);
    }

    await stmt.finalize();
    await db.close();
    console.log(`Successfully restored ${count} institutions.`);
}

restoreFullDataset().catch(console.error);
