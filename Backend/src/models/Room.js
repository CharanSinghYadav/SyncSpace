import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    code: { 
        type: String, 
        default: "// Welcome to SyncSpace PRO\n// Start collaborating in real-time...\nconsole.log('Hello from Jaipur! 🚀');" 
    },
    language: { 
        type: String, 
        default: "javascript" 
    },
    // 🔥 BRUTE-FORCE ARRAY: Mongoose ko bolo bas Object save kare, koi schema nakhre nahi!
    messages: {
        type: Array,
        default: []
    }
}, { 
    timestamps: true 
});

roomSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 });

export const Room = mongoose.model('Room', roomSchema);