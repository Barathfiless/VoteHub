
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import electionRoutes from './routes/electionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

app.use('/api/elections', electionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/votehub';
const clientOptions = { serverApi: { version: '1' as '1', strict: true, deprecationErrors: true } };
mongoose.set('debug', true);

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI, clientOptions);
        console.log('✅ MongoDB connected successfully');

        // Basic Route
        app.get('/', (req: Request, res: Response) => {
            res.send('VoteHub API is running');
        });

        // Debug Route
        app.get('/api/health-check', (req: Request, res: Response) => {
            try {
                const btoaTest = btoa ? btoa('test') : 'undefined';
                res.json({
                    status: 'ok',
                    btoa: btoaTest,
                    mongoState: mongoose.connection.readyState,
                    mongoHost: mongoose.connection.host,
                    modelNames: mongoose.modelNames()
                });
            } catch (e: any) {
                res.status(500).json({ error: e.toString() });
            }
        });

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

startServer();
