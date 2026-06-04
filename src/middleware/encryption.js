import { decrypt, encrypt } from "../utils/helper.js";

// Request interceptor
export const decryptionRequestInterceptor = (req, res, next) => {
    if (req.body && req.method.toUpperCase() !== "GET" ) {
        const decryptedBody = decrypt(req.body?.data);
        req.body = decryptedBody;
    }
    next();
};

// Response interceptor
export const encryptionResponseInterceptor = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
        const encryptedBody = encrypt(JSON.stringify(body));
        originalJson.call(this, encryptedBody);
    };
    next();
};
