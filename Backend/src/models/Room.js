import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, required: true }
}, { _id: false }); // '_id: false' rakhne se har chat message ki alag ID nahi banegi, DB light rahega

const roomSchema = new mongoose.Schema({
    roomId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true // Fast searching ke liye
    },
    code: { 
        type: String, 
        default: "// Welcome to SyncSpace PRO\n// Start collaborating in real-time...\nconsole.log('Hello from Jaipur! 🚀');" 
    },
    language: { 
        type: String, 
        default: "javascript" 
    },
    messages: [messageSchema]
}, { 
    timestamps: true 
});

// THE GARBAGE COLLECTOR (TTL INDEX)
// Jo room 7 din (604800 seconds) tak update nahi hoga, MongoDB usko auto-delete kar dega.
roomSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 });

export const Room = mongoose.model('Room', roomSchema);