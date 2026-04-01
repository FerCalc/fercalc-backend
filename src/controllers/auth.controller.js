import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';

// ✅ Configuración de cookie centralizada
const cookieOptions = {
    httpOnly: true,
    secure: true,        // ✅ Siempre true en producción (HTTPS)
    sameSite: 'none',    // ✅ Permite cookies entre dominios distintos
};

export const register = async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const userFound = await User.findOne({ email });
        if (userFound) return res.status(400).json({ errors: ["El correo ya está en uso"] });

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: passwordHash });
        const userSaved = await newUser.save();
        const token = await createAccessToken({ id: userSaved._id });

        res.cookie('token', token, cookieOptions);
        res.status(201).json({ 
            id: userSaved._id, 
            username: userSaved.username, 
            email: userSaved.email 
        });
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userFound = await User.findOne({ email });
        if (!userFound) return res.status(400).json({ errors: ["Credenciales inválidas"] });

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({ errors: ["Credenciales inválidas"] });

        const token = await createAccessToken({ id: userFound._id });
        res.cookie('token', token, cookieOptions);
        res.json({ 
            id: userFound._id, 
            username: userFound.username, 
            email: userFound.email 
        });
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        ...cookieOptions,
        expires: new Date(0),
    });
    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    return res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
    });
};