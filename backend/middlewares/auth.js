import { catchAsyncError } from "./catchAsyncError.js";
import Errorhandler from "./error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js"

export const isAuthenticated = catchAsyncError(async(req,res,next) =>{
    const { token } = req.cookies;
    if(!token){
        return next(new Errorhandler("user is not authenticated",400))
    }

    const decoded = jwt.verify(token , process.env.JWT_SECRET_KEY);  //to verify token

    req.user = await User.findById(decoded.id);

    next();

})