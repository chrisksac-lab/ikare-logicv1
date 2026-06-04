import * as roleService from "../services/role.service.js";

export const addRole = async(req, res) => {
    const role = req.body;
    try {
        const dbRole = await roleService.getRoleByLabel(role?.label);
        if (dbRole) return res.status(400).json({message: "Role exists already !"});
        try {
            const newRole = await roleService.createRole(role);
            return res.status(200).json({message: "New role added successfully !", role:newRole});
        }catch(error) {
            console.error(error);
        }
    }catch(error) {
        console.error(error);
    }
}

export const getRoles = async(req, res) => {
    try {
        const roles = await roleService.getRoles();
        return res.status(200).json({message: "Success !", data:roles})
    }catch(error) {
        console.error(error);
    }
}

export const updateRole = async (req, res) => {
    const {initial, update} = req.body;
    try {
        const updatedRole = await roleService.updateRole(initial, update);
        return res.status(200).json({message: "Role updated successfully !", data:updatedRole});
    }
    catch(error) {
        console.error(error)
    }
}

export const deleteRole = async (req, res) => {
    const role = req.body;
    try {
        const deletedRole = await roleService.deleteRole(role.label);
        return res.status(200).json({message: "Role deleted successfully !", data:deletedRole});
    }catch(error) {
        console.error(error);
    }
}