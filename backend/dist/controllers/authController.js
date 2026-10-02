"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const authValidators_1 = require("../validators/authValidators");
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '7d',
    });
};
const register = async (req, res) => {
    try {
        const { email, password } = authValidators_1.registerSchema.parse(req.body);
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: { email, password: hashedPassword },
        });
        const token = generateToken(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(201).json({ user: { id: user.id, email: user.email } });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = authValidators_1.loginSchema.parse(req.body);
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({ user: { id: user.id, email: user.email } });
    }
    catch (error) {
        res.status(400).json({ message: error.errors || error.message });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const me = async (req, res) => {
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true },
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.me = me;
