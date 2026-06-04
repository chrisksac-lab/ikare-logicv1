import PharmacySchema from "../models/pharmacy.model.js";

export const getAllPharmacies = async () => {
    return await PharmacySchema.find();
  };
   
  export const createPharmacy = async (pharmacy) => {
    return await PharmacySchema.create(pharmacy);
  };
  export const getPharmacyById = async (id) => {
    return await PharmacySchema.findById(id);
  };

  export const getPharmacyByName = async (name)=>{
    return await PharmacySchema.findOne({name})
  }

  export const getPharmaciesByLocation = async (location) => {
    return await PharmacySchema.find({location})
  }

  export const getOnePharmacy = async (value)=>{
    return await PharmacySchema.findOne(value)
  }
   
  export const updatePharmacy = async (id, pharmacy) => {
    return await PharmacySchema.findByIdAndUpdate(id, pharmacy);
  };
   
  export const hardDeletePharmacy = async (id) => {
    return await PharmacySchema.findByIdAndDelete(id);
  };

  export const softDeletePharmacy = async (id) => {
    return await PharmacySchema.findByIdAndUpdate(id, {status: 'SUSPENDED'});
  };
