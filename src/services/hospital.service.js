import hospitalSchema from "../models/hospital.model.js";

export const getAllHospitals = async () => {
    return await hospitalSchema.find();
  };
   
  export const createHospital = async (hospital) => {
    return await hospitalSchema.create(hospital);
  };
  export const getHospitalById = async (id) => {
    return await hospitalSchema.findById(id);
  };

  export const getHospitalByName = async (name)=>{
    return await hospitalSchema.findOne({name})
  }

  export const getHospitalsByLocation = async (location) => {
    return await hospitalSchema.find({location})
  }

  export const getOneHospital = async (value)=>{
    return await hospitalSchema.findOne(value)
  }
   
  export const updateHospital = async (id, hospital) => {
    return await hospitalSchema.findByIdAndUpdate(id, hospital);
  };
   
  export const hardDeleteHospital = async (id) => {
    return await hospitalSchema.findByIdAndDelete(id);
  };

  export const softDeleteHospital = async (id) => {
    return await hospitalSchema.findByIdAndUpdate(id, {status: 'INACTIVE'});
  };
