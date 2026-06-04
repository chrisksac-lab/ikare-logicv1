import userSchema from "../models/user.model.js";

export const getAllUsers = async () => {
    return await userSchema.find();
  };
   
  export const createUser = async (user) => {
    return await userSchema.create(user);
  };
  export const getUserById = async (id) => {
    return await userSchema.findById(id);
  };

  export const getUserByEmail = async (email)=>{
    return await userSchema.findOne({email})
  }

  export const getUserByAuthToken = async (authToken)=>{
    return await userSchema.findOne({authToken})
  }

  export const getOneUser = async (value)=>{
    return await userSchema.findOne(value)
  }
   
  export const updateUser = async (id, user) => {
    return await userSchema.findByIdAndUpdate(id, user);
  };
   
  export const hardDeleteUser = async (id) => {
    return await userSchema.findByIdAndDelete(id);
  };

  export const softDeleteUser = async (id) => {
    return await userSchema.findByIdAndUpdate(id, {status: 'INACTIVE'});
  };