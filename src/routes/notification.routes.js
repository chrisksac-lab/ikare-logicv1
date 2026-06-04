import { getNotificationByRole } from "../controllers/notification.controller.js"
import express from "express"
const router = express.Router()

router.route("/getNotificationByRole").get(getNotificationByRole)
export default router;
