import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import otpStore from '../utils/otpStore.js';
import emailService from '../utils/emailService.js';
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
export const sendSignupOTP = async (req, res) => {
    try {
        const { email, fullName, dateOfBirth } = req.body;
        if (!email || !fullName || !dateOfBirth) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Please enter a valid email address' });
            return;
        }
        const dob = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 13 || age > 120) {
            res.status(400).json({ error: 'Age must be between 13 and 120 years' });
            return;
        }
        const otp = otpStore.storeOTP(email.toLowerCase(), 'signup', { fullName, dateOfBirth });
        await emailService.sendOTP(email, otp, 'signup');
        res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        console.error('Send signup OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};
export const verifySignupOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ error: 'Email and OTP are required' });
            return;
        }
        const otpResult = otpStore.verifyOTP(email.toLowerCase(), otp, 'signup');
        if (!otpResult.valid) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }
        const user = new User({
            fullName: otpResult.userData.fullName,
            email: email.toLowerCase(),
            dateOfBirth: new Date(otpResult.userData.dateOfBirth)
        });
        await user.save();
        const token = generateToken(user._id.toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                dateOfBirth: user.dateOfBirth
            }
        });
    }
    catch (error) {
        console.error('Verify signup OTP error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};
export const sendSigninOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(400).json({ error: 'No account found with this email' });
            return;
        }
        const otp = otpStore.storeOTP(email.toLowerCase(), 'signin');
        await emailService.sendOTP(email, otp, 'signin');
        res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        console.error('Send signin OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};
export const verifySigninOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ error: 'Email and OTP are required' });
            return;
        }
        const otpResult = otpStore.verifyOTP(email.toLowerCase(), otp, 'signin');
        if (!otpResult.valid) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        const token = generateToken(user._id.toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: 'Signed in successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                dateOfBirth: user.dateOfBirth
            }
        });
    }
    catch (error) {
        console.error('Verify signin OTP error:', error);
        res.status(500).json({ error: 'Failed to sign in' });
    }
};
export const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};
export const getProfile = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-__v');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                dateOfBirth: user.dateOfBirth
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
//# sourceMappingURL=authController.js.map