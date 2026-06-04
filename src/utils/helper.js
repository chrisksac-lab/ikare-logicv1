import { config } from "../config/app.config.js";
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv-flow'
dotenv.config({path: 'local.env'})

export const generateString=(length=6)=>{
    const characters ='0123456789';
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export const mailMessages=(type,token,link=null)=>{
    let str = ''

    switch(type){
        case 'forgot-password':
            str+=`<p>ASAP Pay reset code: <b>${token}</b></p>`
            break;
        case 'create-account':
            str+=OTP_EMAIl(token,link ?? config.DEFAULT_REDIRECTION_LINK)
            break;
        default: 
            str+='Welcome to ASAP PAY'
            break;
    }

    return str;
}

export const checkIfSocketIdExist = (arr,value)=>{
    const data = arr.filter((item)=> item.socketId===value)
    if(data.length>0)
        return true
    else
        return false
}

export const encrypt=(value)=>{
    return CryptoJS.AES.encrypt(JSON.stringify(value), config.ENCRYPTION_SECRET_KEY).toString();
}

export const decrypt = (encryptedValue) =>{
    const decryptedValue =  CryptoJS.AES.decrypt(encryptedValue, config.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const regex = /\[.*\]|\{.*\}/
    if(regex.test(decryptedValue)) return JSON.parse(decryptedValue);

    return decryptedValue;
}

export const jwtDecoder=(value)=>{
    try{
        const decoded_payload = jwt.verify(value, process.env.JWT_TOKEN_KEY);
        return { valid: true, data: decoded_payload }
    }catch(err){
        return {  valid: false, data: null}
    }
}