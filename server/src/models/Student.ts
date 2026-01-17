
import mongoose, { Schema, type Document } from 'mongoose';

export interface IStudent extends Document {
    id: string; // Virtual ID
    rollNo: string;
    name: string;
    email?: string; // Optional as per current interface
    password: string; // In production, hash this!
    role: 'student';
    createdAt: Date;
}

const StudentSchema: Schema = new Schema({
    rollNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    department: { type: String },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IStudent>('Student', StudentSchema);
