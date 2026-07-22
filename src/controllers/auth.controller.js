import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.model.js';
import { Session } from '../models/Session.model.js';
import { ActivityLog } from '../models/ActivityLog.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER');

export const googleLogin = asyncHandler(async (req, res) => {
    const { token, rememberMe } = req.body;
    if (!token) {
        return res.status(400).json(new ApiResponse(400, null, "Google token is required"));
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER',
        });
        const payload = ticket.getPayload();
        
        if (!payload) {
            return res.status(400).json(new ApiResponse(400, null, "Invalid Google token"));
        }

        const { sub: googleId, email, name, picture: avatar } = payload;

        let user = await User.findOne({ googleId });
        if (!user) {
            // Check if user exists by email but without googleId
            user = await User.findOne({ email });
            if (user) {
                user.googleId = googleId;
                user.avatar = avatar;
            } else {
                user = await User.create({ googleId, email, name, avatar });
                await ActivityLog.create({
                    userId: user._id,
                    type: 'REGISTER',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                });
            }
        }
        
        user.lastLogin = new Date();
        await user.save();

        // Create Session
        const sessionId = crypto.randomBytes(32).toString('hex');
        const expiresInDays = rememberMe ? 30 : 1;
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

        await Session.create({
            userId: user._id,
            sessionId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            expiresAt
        });

        // Sign JWT payload with sessionId
        const jwtToken = jwt.sign(
            { _id: user._id, sessionId },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: `${expiresInDays}d` }
        );

        // Set HTTP-Only Cookie
        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: expiresInDays * 24 * 60 * 60 * 1000
        });

        // Log Activity
        await ActivityLog.create({
            userId: user._id,
            type: 'LOGIN',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(200).json(new ApiResponse(200, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        }, "Logged in successfully"));
    } catch (error) {
        console.error("Google verify error:", error);
        res.status(401).json(new ApiResponse(401, null, "Invalid Google token authentication"));
    }
});

export const logout = asyncHandler(async (req, res) => {
    // If the user has a token, remove their session
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            await Session.findOneAndDelete({ sessionId: decoded.sessionId });
            
            await ActivityLog.create({
                userId: decoded._id,
                type: 'LOGOUT',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });
        } catch (error) {
            // Ignore token verify errors on logout
        }
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
    // Requires protectUser middleware
    res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});
