import * as userService from "../services/user.service.js";
import __dirname from "../../helper.js";
import path from "path"

export const updateVitals = async (req, res) => {
    try {
        const vitals = req.body;
        const patientId = "66bc78b2a90e33adb97e0386";
        const patient = await userService.getUserById(patientId);
        patient.vitals = {}
        patient.vitals.temperature = vitals.temp;
        patient.vitals.heartBeat = vitals.beatAvg;
        patient.vitals.bloodPressure = vitals.BPM;
        patient.vitals.concentration = vitals.BPM;
        await patient.save();
        return res.json({message: "Success !"})?.status(200);
    } catch(error) {
        return res.json({message: error.message})?.status(500);
    }
};

export const getVitals = async (req, res) => {
    try {
        const {email} = req.body;
        const patient = await userService.getUserByEmail(email);
        return res.json({message:"Success !", data:patient.vitals})?.status(200)
    } catch(error) {
        return res.json({message:error.message})?.status(500)
    }
};