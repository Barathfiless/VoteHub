
import mongoose, { Schema, type Document } from 'mongoose';

export interface IAdmin extends Document {
    id: string; // Virtual ID
    email: string;
    name: string;
    password: string;
    role: 'admin';
    createdAt: Date;
}

const AdminSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
