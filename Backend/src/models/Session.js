import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    username: { type: String, required: true },
    roomId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, default: "Guest" }
});

export const Session = mongoose.model('Session', sessionSchema);