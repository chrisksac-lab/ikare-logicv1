import * as userService from "../services/user.service.js"

export const userExist = async (req, res, next) => {
    console.log(req.body)
    let user = await userService.getUserByEmail(req.body.email)
    if(!user) return res.status(400).json({ error: 'Sorry no user found with this email' });
    
    return next();
}