import { redisClient } from "../config/redis.js";
import Room from "../models/Room.js";
import { Session } from "../models/Session.js";

//HELPER FUNCTION: Room me baithe saare logo ka Naam aur ID nikalne ke liye
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

    socket.on("join-room", async ({ roomId, username }) => {
      socket.join(roomId);
      socket.roomId = roomId;

      //socket object pe username bhi save kar diya
      socket.username = username;

      console.log(`👤 ${username} joined room: ${roomId}`);

      let latestCode = await redisClient.get(roomId);
      if (!latestCode) {
        const dbRoom = await Room.findOne({ roomId });
        if (dbRoom) {
          latestCode = dbRoom.code;
          await redisClient.set(roomId, latestCode);
        }
      }
      if (latestCode) socket.emit("code-update", latestCode);

      //LOGIC: Room ke sabhi logo ko updated User List bhej do
      const clients = getAllConnectedClients(roomId, io);
      io.to(roomId).emit("joined-clients", clients);
    });

    socket.on("code-change", async ({ roomId, newCode }) => {
      await redisClient.set(roomId, newCode);
      socket.in(roomId).emit("code-update", newCode);
    });

    socket.on("send-message", ({ roomId, username, text, time }) => {
      // Sender ko chhod kar same room ke baaki sabhi logo ko message bhej do
      socket.in(roomId).emit("receive-message", { username, text, time });
    });

    //CODE OUTPUT BROADCASTER
    socket.on("sync-output", ({ roomId, output }) => {
      socket.in(roomId).emit("receive-output", output);
    });

    socket.on("join-room", async ({ roomId, username }) => {
      // 1. User ko room me dalo
      socket.join(roomId);

      // 2. MongoDB me record save hoga!
      const newSession = new Session({ username, roomId });
      await newSession.save();

      console.log(`${username} saved to Database!`);
    });

    socket.on("disconnect", async () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);
      const roomId = socket.roomId;

      if (roomId) {
        // 1. Purana MongoDB save logic
        const codeToSave = await redisClient.get(roomId);
        if (codeToSave) {
          await Room.findOneAndUpdate(
            { roomId },
            { code: codeToSave },
            { upsert: true },
          );
        }

        //LOGIC: Koi chala gaya? Baaki bache logo ko nayi list bhejo!
        const remainingClients = getAllConnectedClients(roomId, io);
        socket.in(roomId).emit("joined-clients", remainingClients);
      }
    });
  });
};
