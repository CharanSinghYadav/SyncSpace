import { redisClient } from "../config/redis.js";
import { Room } from "../models/Room.js";
import { Session } from "../models/Session.js";

// HELPER: Room me baithe saare logo ka Naam aur ID nikalne ke liye
const getAllConnectedClients = (roomId, io) => {
  const roomIds = io.sockets.adapter.rooms.get(roomId);
  if (!roomIds) return [];

  return Array.from(roomIds).map((socketId) => {
    return {
      socketId,
      username: io.sockets.sockets.get(socketId)?.username || "Anonymous",
    };
  });
};

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 New User Connected: ${socket.id}`);

    // 1. UNIFIED JOIN ROOM (Merged both listeners + Fetches DB Chats)
    socket.on("join-room", async ({ roomId, username }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;

      console.log(`👤 ${username} joined room: ${roomId}`);

      try {
        // A. Session log save karo 
        const newSession = new Session({ username, roomId });
        await newSession.save();
      } catch (err) {
        console.log("Session DB logging skipped");
      }

      // B. Fetch Code from Redis or DB
      let latestCode = await redisClient.get(roomId);
      let dbRoom = null;

      if (!latestCode) {
        dbRoom = await Room.findOne({ roomId });
        if (dbRoom) {
          latestCode = dbRoom.code;
          await redisClient.set(roomId, latestCode);
        }
      }
      if (latestCode) socket.emit("code-update", latestCode);

      // C. FETCH CHAT HISTORY FROM DB & SEND ONLY TO JOINING USER
      if (!dbRoom) dbRoom = await Room.findOne({ roomId });
      if (dbRoom && dbRoom.messages && dbRoom.messages.length > 0) {
        socket.emit("load-chat-history", dbRoom.messages);
      }

      // D. Broadcast updated connected users list
      const clients = getAllConnectedClients(roomId, io);
      io.to(roomId).emit("joined-clients", clients);
    });

    // 2. REAL-TIME CODE CHANGE (Keeps Redis hot)
    socket.on("code-change", async ({ roomId, newCode }) => {
      await redisClient.set(roomId, newCode);
      socket.in(roomId).emit("code-update", newCode);
    });

// 🔥 3. PERSISTENT CHAT BROADCASTER (Hard-Write DB)
    socket.on("send-message", async ({ roomId, username, text, time }) => {
      socket.in(roomId).emit("receive-message", { username, text, time });

      try {
        // FindoneAndUpdate ki jagah hum pehle fetch karenge, push karenge aur explicitly .save() maarenge!
        let dbRoom = await Room.findOne({ roomId });
        if (!dbRoom) {
            dbRoom = new Room({ roomId, messages: [] });
        }
        
        dbRoom.messages.push({ username, text, time });
        await dbRoom.save(); // This forces MongoDB to write 100%!
        console.log(`💬 Saved message to DB for room: ${roomId}`);
      } catch (err) {
        console.error("Chat DB Sync failed:", err.message);
      }
    });

    // 4. CODE OUTPUT BROADCASTER
    socket.on("sync-output", ({ roomId, output }) => {
      socket.in(roomId).emit("receive-output", output);
    });

    // 5. DISCONNECT & FLUSH REDIS TO DB
    socket.on("disconnect", async () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);
      const roomId = socket.roomId;

      if (roomId) {
        try {
          const codeToSave = await redisClient.get(roomId);
          if (codeToSave) {
            await Room.findOneAndUpdate(
              { roomId },
              { code: codeToSave },
              { upsert: true }
            );
          }
        } catch (err) {
          console.error("Disconnect DB flush failed:", err.message);
        }

        const remainingClients = getAllConnectedClients(roomId, io);
        socket.in(roomId).emit("joined-clients", remainingClients);
      }
    });
  });
};