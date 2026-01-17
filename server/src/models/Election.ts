
import mongoose, { Schema, type Document } from 'mongoose';

export interface ICandidate {
    id: string; // Keeping string ID for frontend compatibility
    name: string;
    photo: string | null;
    bio: string;
    department: string;
    year: string;
    manifesto: string;
    votes: number;
}

export interface IElection extends Document {
    id: string; // Virtual ID
    title: string;
    description: string;
    department: string;
    standing_post: string;
    logo_url: string | null;
    start_time: Date;
    end_time: Date;
    status: 'scheduled' | 'active' | 'completed';
    created_by: string;
    candidates: ICandidate[];
    resultsPublished: boolean;
    created_at: Date;
}

const CandidateSchema: Schema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    photo: { type: String, default: null },
    bio: { type: String, default: 'Candidate' },
    department: { type: String, required: true },
    year: { type: String, default: 'N/A' },
    manifesto: { type: String, required: true },
    votes: { type: Number, default: 0 },
});

const ElectionSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, required: true },
    standing_post: { type: String, required: true },
    logo_url: { type: String, default: null },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
    resultsPublished: { type: Boolean, default: false },
    created_by: { type: String, required: true },
    candidates: [CandidateSchema],
    created_at: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IElection>('Election', ElectionSchema);
