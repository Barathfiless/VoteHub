
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Election from './models/Election.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/votehub';
const clientOptions = { serverApi: { version: '1' as '1', strict: true, deprecationErrors: true } };

async function test() {
    try {
        console.log('Connecting to:', MONGO_URI); // Be careful if this logs secrets, but usually it's local or hidden in logs.
        await mongoose.connect(MONGO_URI, clientOptions);
        console.log('Connected');

        console.log('Testing Admin.findOne...');
        const admin = await Admin.findOne({});
        console.log('Admin find result:', admin);

        console.log('Testing Election.find...');
        const elections = await Election.find({});
        console.log('Elections find result:', elections);

    } catch (error) {
        console.error('TEST FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
}

test();
