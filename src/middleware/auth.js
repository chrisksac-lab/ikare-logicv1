import jwt from 'jsonwebtoken'
import dotenv from 'dotenv-flow'
dotenv.config({ path: 'local.env' })

export const auth = (req, res, next) => {
  let { token } = req.body;
  if (!token) {
    token = req.body.token || req.query.token || req.headers["x-access-token"];
    console.log("token", token);
    const authHeader = req.headers.authorization;
    if (!token && authHeader) {
      console.log("authHeader", authHeader);
      try {
        token = authHeader.split(" ")[1].trim()
      } catch (error) {
      }
    }
    if (!token) {
      return res.status(403).send({ message: 'Sorry Unauthorized access token needed' });
    }
  }
  try {
    const decoded_user_payload = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    req.user = decoded_user_payload;
    req.userId = decoded_user_payload.id;
    req.accountType = decoded_user_payload.accountType
    console.log(decoded_user_payload);
    next();
  } catch (err) {
    return res.status(401).send({ message: "Invalid token make sure its not expired" });
  }

  // return next();
};
