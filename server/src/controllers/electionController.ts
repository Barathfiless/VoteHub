
import type { Request, Response } from 'express';
import Election from '../models/Election.js';

export const getElections = async (req: Request, res: Response) => {
    console.log('[Controller] getElections called');
    try {
        console.log('[Controller] Finding elections in DB...');
        const elections = await Election.find();
        console.log(`[Controller] Found ${elections.length} elections.`);

        console.log('[Controller] Sending response...');
        res.json(elections);
        console.log('[Controller] Response sent.');
    } catch (error: any) {
        console.error('Error in getElections:', error);
        const errorProps = Object.getOwnPropertyNames(error).reduce((acc: any, key) => {
            acc[key] = (error as any)[key];
            return acc;
        }, {});
        console.error('Error in getElections (deep):', errorProps);
        res.status(500).json({
            message: 'Error fetching elections - DEBUG',
            errorOriginal: error,
            errorProps
        });
    }
};

export const createElection = async (req: Request, res: Response) => {
    try {
        console.log('[Controller] createElection request body:', JSON.stringify(req.body, null, 2));
        const newElection = new Election(req.body);
        const savedElection = await newElection.save();
        console.log('[Controller] Election saved successfully:', savedElection._id);
        res.status(201).json(savedElection);
    } catch (error: any) {
        console.error('Error in createElection:', error);
        res.status(400).json({
            message: 'Error creating election',
            error: error.message,
            details: error.errors
        });
    }
};

export const updateElection = async (req: Request, res: Response) => {
    try {
        const updatedElection = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedElection) return res.status(404).json({ message: 'Election not found' });
        res.json(updatedElection);
    } catch (error) {
        res.status(400).json({ message: 'Error updating election', error });
    }
};

export const deleteElection = async (req: Request, res: Response) => {
    try {
        const deletedElection = await Election.findByIdAndDelete(req.params.id);
        if (!deletedElection) return res.status(404).json({ message: 'Election not found' });
        res.json({ message: 'Election deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting election', error });
    }
};
