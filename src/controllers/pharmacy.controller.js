import * as pharmacyService from "../services/pharmacy.service.js";
import PharmacySchema from '../models/pharmacy.model.js';
import bcrypt from "bcrypt";

const saltRounds = 10;
export const addPharmacy = async (req, res) => {
    try {
        const pharmacy = req.body;
        const oldPharmacy = await pharmacyService.getPharmacyByName(pharmacy?.name);
        if (oldPharmacy)
            return res.status(400).json({message: "Pharmacy with name exists already !"})
        const salt = await bcrypt.genSalt(saltRounds)
        const hashedPassword = await bcrypt.hash(pharmacy?.admin.password, salt)
        const newPharmacy = {...pharmacy, admin: {...pharmacy.admin, password:hashedPassword}}
        const createdPharmacy = await pharmacyService.createPharmacy(newPharmacy);
        return res.status(200).json({message: "Success !"});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

export const getAllPharmacies = async (req, res) => {
    try {
        const pharmacies = await pharmacyService.getAllPharmacies();
        res.status(200).json({message: "Success !", data: pharmacies});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

export const getPharmacyById = async (req, res) => {
    try {
        const pharmacy = await pharmacyService.getPharmacyById(req.params.id);
        return res.status(200).json({message: "Success !", data: pharmacy});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

export const deletePharmacy = async (req, res) => {
    try {
        const {id} = req.params;
        const deletedPharamcy = await pharmacyService.hardDeletePharmacy(id);
        return res.status(200).json({message: "Success !", data:deletedPharamcy});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }   
}

export const suspendPharmacy = async (req, res) => {
    try {
        const {id} = req.params;
        const deletedPharamcy = await pharmacyService.softDeletePharmacy(id);
        return res.status(200).json({message: "Success !", data:deletedPharamcy});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }   
}

export const uploadDrug = async (req, res) => {
    try {
        const {id, newDrug} = req.body;
        const pharmacy = await pharmacyService.getPharmacyById(id);
        const drugExists = pharmacy.drugs.find(drug => drug.name == newDrug?.name);
        if (drugExists)
            return res.status(400).json({message: "Drug already exists !"});
        pharmacy.drugs.push(newDrug);
        pharmacy.save()
        return res.status(200).json({message: "Drug added successfully !"});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }   
}

export const deleteDrug = async (req, res) => {
    try {
        const {id, oldDrug} = req.body;
        const pharmacy = await pharmacyService.getPharmacyById(id);
        pharmacy.drugs = pharmacy.drugs.filter(drug => drug._id == oldDrug?._id);
        pharmacy.save();
        return res.status(200).json({message: "Drug deleted successfully !"});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }   
}

export const incrementDrugQuantity = async (req, res) => {
    try {
        const {id, drug, quantity} = req.body;
        const pharmacy = await pharmacyService.getHospitalById(id);
        pharmacy.drugs.forEach(dg => {
            if (dg._id == drug?._id){
                dg.quantity = dg.quantity + quantity;
            }
        })
        pharmacy.save();
        return res.status(200).json({message: "Quantity incremented successfully !"});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }   
}

export const decrementDrugQuantity = async (req, res) => {
    try {
        const {id, drug, quantity} = req.body;
        const pharmacy = await pharmacyService.getHospitalById(id);
        pharmacy.drugs.forEach(dg => {
            if (dg._id == drug?._id){
                if (dg.quantity < quantity) {
                    return res.status(400).json({message: "Insufficient quantity !"});
                }
                dg.quantity = dg.quantity - quantity;
            }
        })
        pharmacy.save();
        return res.status(200).json({message: "Drug quantity decremented successfully !"});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }   
}