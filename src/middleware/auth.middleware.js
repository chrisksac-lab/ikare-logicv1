import jwt from "jsonwebtoken"
import dotenv from 'dotenv-flow';
dotenv.config({ path: 'local.env' });

export const checkAuthenticated = (req, res,next) => {
    console.log(req.headers)
    if (req.headers.authorization === undefined || req.headers.authorization === null){
        return res.status(403).json({message: "Unauthorized, token does not exist"});
    }
    let token = req.headers.authorization.split(" ")[1];
    if (token === ''){
        return res.status(403).json({message: "Token does not exist"});
    }
    else {
        jwt.verify(token.trim(), process.env.JWT_TOKEN_KEY, (err, result) => {
            if(err) {
                return res.status(401).json({message: "Token expired "+err});
            }
            else if(result) {
                req.user = result.user;
                req.userId = result.user._id;
                next();
            }
        });
    }
}