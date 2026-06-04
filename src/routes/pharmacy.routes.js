import express from "express";
import {
    addPharmacy,
    getAllPharmacies,
    uploadDrug,
    getPharmacyById,
    deletePharmacy,
    incrementDrugQuantity,
    decrementDrugQuantity,
    suspendPharmacy
} from "../controllers/pharmacy.controller.js";

const router = express.Router();

router.route("/").get(getAllPharmacies).post(addPharmacy);
router.route("/:id").get(getPharmacyById).delete(deletePharmacy).put(suspendPharmacy);
router.route("/drug-upload").put(uploadDrug);
router.route("/drug-increment").put(incrementDrugQuantity);
router.route("/drug-decrement").put(decrementDrugQuantity);

export default router;