import 'dotenv/config'
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initSocket } from './socket/socketManager.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';

connectDB();
connectRedis();

const app = express();
app.use(cors({
    origin: ["https://sync-space-orcin-one.vercel.app/","http://localhost:5173"]
}));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://sync-space-orcin-one.vercel.app/",
        methods: ["GET", "POST"]
    }
});

// Socket logic external file se call ho raha hai
initSocket(io);


app.post('/run-code', async (req, res) => {
    const { code, language } = req.body;
    
    // JDoodle language mapping
    const langMap = { javascript: "nodejs", python: "python3", cpp: "cpp", java: "java" };

    try {
        const response = await fetch("https://api.jdoodle.com/v1/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                script: code,
                language: langMap[language],
                versionIndex: "0",
                clientId: process.env.JD_CLIENT_ID,
                clientSecret: process.env.JD_CLIENT_SECRET
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Backend proxy failed" });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});