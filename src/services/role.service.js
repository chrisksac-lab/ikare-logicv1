import RoleSchema from "../models/role.model.js";

export const getRole = async (role) => {
    return await RoleSchema.findOne(role);
  };

export const getRoleByLabel = async (label) => {
    return await RoleSchema.findOne({label});
};

export const createRole = async(role) => {
  return await RoleSchema.create(role);
};

export const updateRole = async(label, newLabel) => {
  return await RoleSchema.findOneAndUpdate({label}, {label:newLabel});
};

export const deleteRole = async(label) => {
  return await RoleSchema.findOneAndDelete({label});
};

export const getRoles = async() => {
  return await RoleSchema.find();
};