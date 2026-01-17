
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Election from './models/Election.js';

dotenv.config();

// Fix for fetch availability in Node environment if needed (though node 18+ has it)
// const fetch = require('node-fetch'); 

async function testServerLogic() {
    try {
        console.log('--- TEST START ---');

        // 1. Test btoa availability
        console.log('Testing btoa...');
        try {
            console.log('btoa("test") =', btoa("test"));
        } catch (e) {
            console.error('btoa failed:', e);
        }

        const adminEmail = 'test@admin.com';
        const adminPassword = 'password123';

        // Connect to DB to ensure models work
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/votehub';
        await mongoose.connect(MONGO_URI);
        console.log('DB Connected');

        // Create a test admin if not exists
        let admin = await Admin.findOne({ email: adminEmail });
        if (!admin) {
            console.log('Creating test admin...');
            admin = new Admin({
                email: adminEmail,
                password: btoa(adminPassword),
                name: 'Test Admin'
            });
            await admin.save();
            console.log('Test admin saved.');
        } else {
            console.log('Test admin exists.');
        }

        // Simulate login logic
        console.log('Simulating login logic...');
        const foundAdmin = await Admin.findOne({ email: adminEmail });
        if (!foundAdmin) {
            console.log('Admin not found in simulation');
        } else {
            console.log('Admin found:', foundAdmin.email);
            console.log('Password check:', foundAdmin.password === btoa(adminPassword));

            // Simulate toJSON
            console.log('Testing toJSON...');
            try {
                const json = JSON.stringify(foundAdmin);
                console.log('toJSON success:', json);
            } catch (e) {
                console.error('toJSON failed:', e);
            }
        }

        // Simulate getElections logic
        console.log('Simulating getElections logic...');
        const elections = await Election.find();
        console.log(`Found ${elections.length} elections`);
        try {
            const json = JSON.stringify(elections);
            console.log('elections toJSON success (length):', elections.length);
        } catch (e) {
            console.error('elections toJSON failed:', e);
        }

    } catch (error) {
        console.error('TEST FAILED:', error);
    } finally {
        await mongoose.disconnect();
        console.log('--- TEST END ---');
    }
}

testServerLogic();
