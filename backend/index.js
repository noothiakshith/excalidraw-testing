import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import userroutes from './routes/UserRoutes.js';
import canvasroutes from './routes/CanvasRoutes.js';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
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
        canvasdata[canvasid] = elements;
        socket.to(canvasid).emit("receiveupdate", elements);

        try {
            await prisma.canvas.update({
                where: { id: canvasid },
                data: { elements }
            });
        } catch (err) {
            console.error("Failed to update canvas:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
