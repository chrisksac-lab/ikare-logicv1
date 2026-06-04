import express from "express";
import * as hospitalController from "../controllers/hospital.controller.js";

const router = express.Router();

router.route("/get-hospitals").get(hospitalController.getHospitals);
router.route("/add-hospital").post(hospitalController.addHospital);
router.route("/update-hospital").put(hospitalController.updateHospitals);
router.route("/delete-hospital").post(hospitalController.softDeleteHospitals);
router.route("/add-doctor").post(hospitalController.addDoctor);
router.route("/delete-doctor").post(hospitalController.softDeleteDoctor);
router.route("/add-admin").post(hospitalController.addHospitalAdmins);

export default router;