import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        default: "// Welcome to SyncSpace"
    }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);