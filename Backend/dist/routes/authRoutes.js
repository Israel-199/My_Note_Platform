import express from 'express';
import { sendSignupOTP, verifySignupOTP, sendSigninOTP, verifySigninOTP, logout, getProfile } from '../controllers/authController.js';
const router = express.Router();
router.post('/signup/send-otp', sendSignupOTP);
router.post('/signup/verify-otp', verifySignupOTP);
router.post('/signin/send-otp', sendSigninOTP);
router.post('/signin/verify-otp', verifySigninOTP);
router.post('/logout', logout);
router.get('/profile', getProfile);
export default router;
//# sourceMappingURL=authRoutes.js.map