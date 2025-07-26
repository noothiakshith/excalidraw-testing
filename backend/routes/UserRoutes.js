import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';
import z from 'zod';

const prisma = new PrismaClient();
const router = express.Router();
// Login Route
router.post('/login', async (req, res) => {
    const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    });

    const loginCredentials = loginSchema.safeParse(req.body);

    if (!loginCredentials.success) {
        return res.status(400).json({ message: "Invalid input", errors: loginCredentials.error.errors });
    }

    try {
        const parsed = loginCredentials.data;

        const user = await prisma.user.findUnique({
            where: { email: parsed.email }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(parsed.password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Register Route
router.post('/register', async (req, res) => {
    const registrationSchema = z.object({
        name: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6)
    });

    const registration = registrationSchema.safeParse(req.body);

    if (!registration.success) {
        return res.status(400).json({ message: "Invalid input", errors: registration.error.errors });
    }

    try {
        const { name, email, password } = registration.data;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
