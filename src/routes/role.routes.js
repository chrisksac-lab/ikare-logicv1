import express from "express";
import * as roleController from "../controllers/role.controller.js";

const router = express.Router();

router.route("/add-role").post(roleController.addRole);
router.route("/get-roles").get(roleController.getRoles);
router.route("/update-role").put(roleController.updateRole);
router.route("/delete-role").post(roleController.deleteRole);

export default router;