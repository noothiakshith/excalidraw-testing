import express from 'express';
const router = express.Router();
import verifytoken from '../middlewares/VerifyToken.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

router.post('/create', verifytoken, async (req, res) => {
    const userid = req.userid;
    try {
        const newCanvas = await prisma.canvas.create({
            data: {
                ownerId: userid
            }
        });
        res.status(201).json({
            message: "Canvas created successfully",
            canvas: newCanvas
        });
    } catch (err) {
        console.error("Error creating canvas:", err);
        res.status(500).json({
            message: "Failed to create canvas",
            error: err.message || err
        });
    }
});


router.put('/canvas/update/:id', verifytoken, async (req, res) => {
    const canvasId = req.params.id;
    const { elements } = req.body;

    if (!elements || typeof elements !== 'object') {
        return res.status(400).json({ message: "Invalid elements format" });
    }

    try {
        const canvas = await prisma.canvas.findUnique({ where: { id: canvasId } });

        if (!canvas || canvas.ownerId !== req.userid) {
            return res.status(403).json({ message: "Unauthorized or canvas not found" });
        }

        const updatedCanvas = await prisma.canvas.update({
            where: { id: canvasId },
            data: { elements }
        });

        res.status(200).json({
            message: "Canvas updated successfully",
            canvas: updatedCanvas
        });
    } catch (err) {
        console.error("Error updating canvas:", err);
        res.status(500).json({
            message: "Failed to update canvas",
            error: err.message || err
        });
    }
});


router.get('/canvas/:id', verifytoken, async (req, res) => {
    const canvasId = req.params.id;

    try {
        const canvas = await prisma.canvas.findUnique({
            where: { id: canvasId }
        });

        if (!canvas) {
            return res.status(404).json({ message: "Canvas not found" });
        }

        // Optional: Only allow owner or shared user
        if (canvas.ownerId !== req.userid) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        res.status(200).json({
            message: "Canvas fetched successfully",
            canvas
        });
    } catch (err) {
        console.error("Error fetching canvas:", err);
        res.status(500).json({
            message: "Failed to fetch canvas",
            error: err.message || err
        });
    }
});

// Get all canvases for logged-in user
router.get('/canvas', verifytoken, async (req, res) => {
    const userid = req.userid;

    try {
        const canvases = await prisma.canvas.findMany({
            where: {
                ownerId: userid
            }
        });

        res.status(200).json({
            message: "Canvas fetched successfully",
            canvases
        });
    } catch (err) {
        console.error("Error fetching canvases:", err);
        res.status(500).json({
            message: "Failed to fetch canvases",
            error: err.message || err
        });
    }
});

// Delete a canvas
router.delete('/canvas/delete/:id', verifytoken, async (req, res) => {
    const canvasId = req.params.id;

    try {
        const canvas = await prisma.canvas.findUnique({ where: { id: canvasId } });

        if (!canvas || canvas.ownerId !== req.userid) {
            return res.status(403).json({ message: "Unauthorized or canvas not found" });
        }

        await prisma.canvas.delete({ where: { id: canvasId } });

        res.status(200).json({
            message: "Canvas deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting canvas:", err);
        res.status(500).json({
            message: "Failed to delete canvas",
            error: err.message || err
        });
    }
});

// Share canvas with another user
router.post('/canvas/share/:id', verifytoken, async (req, res) => {
    const canvasId = req.params.id;
    const { shareid } = req.body;

    if (!shareid) {
        return res.status(400).json({ message: "Missing share ID" });
    }

    try {
        const canvas = await prisma.canvas.findUnique({ where: { id: canvasId } });

        if (!canvas || canvas.ownerId !== req.userid) {
            return res.status(403).json({ message: "Unauthorized or canvas not found" });
        }

        const sharedCanvas = await prisma.canvas.update({
            where: { id: canvasId },
            data: {
                sharedWith: {
                    connect: { id: shareid }
                }
            }
        });

        res.status(200).json({
            message: "Canvas shared successfully",
            canvas: sharedCanvas
        });
    } catch (err) {
        console.error("Error sharing canvas:", err);
        res.status(500).json({
            message: "Failed to share canvas",
            error: err.message || err
        });
    }
});

export default router;
