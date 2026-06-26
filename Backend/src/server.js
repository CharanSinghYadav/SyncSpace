import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { initSocket } from './socket/socketManager.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';

connectDB();
connectRedis();

const app = express();

// 🔥 THE NUCLEAR NATIVE CORS MIDDLEWARE (No NPM package needed!)
app.use((req, res, next) => {
    const allowedOrigins = [
        "https://sync-space-orcin-one.vercel.app",
        "http://localhost:5173"
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // Safety fallback for direct API pings
        res.setHeader('Access-Control-Allow-Origin', "https://sync-space-orcin-one.vercel.app");
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Agar OPTIONS preflight request hai, toh yahin se 200 OK bhej ke wapas mod do!
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "https://sync-space-orcin-one.vercel.app",
            "http://localhost:5173"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

initSocket(io);

app.post('/run-code', async (req, res) => {
    const { code, language } = req.body;
    
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