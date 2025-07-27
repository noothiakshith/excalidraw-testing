import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from "socket.io";
import userroutes from './routes/UserRoutes.js';
import canvasroutes from './routes/CanvasRoutes.js';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// CORS configuration
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use('/auth', userroutes);
app.use('/api', canvasroutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const canvasdata = {};

io.on("connection", (socket) => {
    console.log("connected");

    socket.on("joincanvas", async ({ canvasid }) => {
        try {
            const canvas = await prisma.canvas.findUnique({
                where: { id: canvasid }
            });

            if (!canvas) return socket.emit("error", "Canvas not found");

            socket.join(canvasid);
            socket.emit("canvasdata", canvasdata[canvasid] || canvas.elements);
        } catch (err) {
            console.error("DB Error:", err);
            socket.emit("error", "Server error");
        }
    });

    socket.on("drawingupdate", async ({ canvasid, elements }) => {
        // Validate input data
        if (!canvasid) {
            console.error("Canvas ID is missing");
            return socket.emit("error", "Canvas ID is required");
        }

        if (!elements) {
            console.error("Elements data is missing");
            return socket.emit("error", "Elements data is required");
        }

        // Update in-memory cache
        canvasdata[canvasid] = elements;
        
        // Broadcast to other clients in the room
        socket.to(canvasid).emit("receiveupdate", elements);

        // Persist to database
        try {
            await prisma.canvas.update({
                where: { id: canvasid },
                data: { elements }
            });
        } catch (err) {
            console.error("Failed to update canvas:", err);
            socket.emit("error", "Failed to save canvas data");
        }
    });

    socket.on("disconnect", () => {
        console.log("disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
