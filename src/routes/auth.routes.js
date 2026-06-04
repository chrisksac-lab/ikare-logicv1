import express from 'express'
import { loginUser,forgotPassword,confirmAccount,resendOtpCode,resetPassword,changePassword, validateOtpCode } from '../controllers/auth.controller.js'
import { userExist } from '../middleware/userExist.js'

const router = express.Router()

router.route("/login").post(loginUser)
router.route("/forgot-password").post(forgotPassword)
router.route("/verify-account").post(confirmAccount)
router.route("/reset-password").post(resetPassword)
router.route("/change-password").post(changePassword)
router.route("/resend-code").post(resendOtpCode)
router.route("/validate-otp").post(validateOtpCode);


export default router