import { response } from "express";
import * as service from "../services/hospital.service.js";
import bcrypt from "bcrypt";

const saltRounds = 10;
export const addHospital = async (req, res) => {
    const hospital = req.body;
    try {
        const salt = await bcrypt.genSalt(saltRounds)
        const hashedPassword = await bcrypt.hash(hospital?.admin.password, salt)
        const newHosp = {...hospital, admin: {...hospital.admin, password:hashedPassword}}
        const isNew = await service.getHospitalByName(hospital?.name);
        if (isNew){
            return res.status(400).json({message: "Hospital already exists !"});
        }
        try {
            const newHospital = await service.createHospital(newHosp);
            return res.status(200).json({message: "New hospital added successfully !", data:newHospital});
        }
        catch(error) {
            console.error(error);
        }
    }
    catch(error) {
        console.error(error)
    }
}

export const getHospitals = async (req, res) => {
    try {
        const hospitals = await service.getAllHospitals();
        return res.status(200).json({message: "Success", data:hospitals})

    } catch(error) {
        console.error(error)
    }
}

export const hardDeleteHospitals = async(req, res) =>{
    const {_id} = req.body;
    try {
        const hospital = await service.hardDeleteHospital(_id);
        return res.status(200).json({message: "Hospital deleted successfully", data:hospital})
    } catch(error) {
        console.error(error)
    }
}

export const softDeleteHospitals = async (req, res) => {
    const {_id} = req.body;
    try {
        const hospital = await service.softDeleteHospital(_id);
        return res.status(200).json({message: "Hospital deleted successfully", data:hospital})
    } catch(error) {
        console.error(error)
    }
}

export const updateHospitals = async (req, res) => {
    const {_id, hospital} = req.body;
    try {
        const hospital = await service.updateHospital(_id, hospital);
        return res.status(200).json({message: "Hospital updated successfully", data:hospital})
    } catch(error) {
        console.error(error)
    }
}

export const addDoctor = async (req, res) => {
    const {doctor, hospital} = req.body;
   try {
        const salt = await bcrypt.genSalt(saltRounds)
        const hashedPassword = await bcrypt.hash(doctor?.password, salt)
        const newDoc = {...doctor, password:hashedPassword}
        const dbHospital = await service.getHospitalByName(hospital?.name);
        const doctorObj = dbHospital.doctors.find(doc => doc.email===doctor.email);
        if (doctorObj) return res.status(400).json({message: "Doctor already added in this hospital !"});
        const doctorAdded = dbHospital.doctors.push(newDoc)
        try {
            const saved = dbHospital.save();
            return res.status(200).json({message: "New doctor added successfully !"});
        }
        catch(error) {
            console.error(error)
        }
    }catch(error) {
        console.error(error);
    }
}

export const hardDeleteDoctor = async (req, res) => {
    const {_id, hospital} = req.body;
    try {
        const singleHospital = await service.getHospitalById(hospital._id);
        singleHospital.doctors = singleHospital.doctors.filter(doc => doc._id===_id);
        try {
            singleHospital.save()
            return res.status(200).json({message: "Doctor successfully deleted !"});
        }
        catch(error) {
            console.error(error)
        }
    }catch(error) {
        console.error(error);
    }
}

export const softDeleteDoctor = async (req, res) => {
    const {_id, hospital} = req.body;
    try {
        const singleHospital = await service.getHospitalById(hospital._id);
        singleHospital.doctors.forEach(doc => {
            if (doc._id === _id)
                doc.status = "INACTIVE"
        })
        try {
            singleHospital.save()
            return res.status(200).json({message: "Doctor successfully deleted !"});
        }
        catch(error) {
            console.error(error)
        }
    }catch(error) {
        console.error(error);
    }
}

export const addHospitalAdmins = async(req, res) => {
    const {admin, hospital} = req.body;
    try {
        const singleHospital = await service.getHospitalById(hospital?._id);
        if (admin.email === singleHospital.admin.fullname) return res.status(400).json({message: "Admin already registered for this hospital"});
        const updatedHospital = await service.updateHospital(hospital?._id, {admin});
        return res.status(400).json({message: "Admin successfully added !"})
    }
    catch(error) {
        console.error(error);
    }
}