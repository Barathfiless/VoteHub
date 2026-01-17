
import mongoose, { Schema, type Document } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    createdAt: Date;
}

const DepartmentSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
