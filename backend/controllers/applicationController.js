import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { v2 as cloudinary } from "cloudinary";


export const postApplication = catchAsyncError(async(req,res,next) =>{
    
});

export const employerGetAllApplication = catchAsyncError(async(req,res,next) =>{

});

export const jobSeekerGetAllApplication = catchAsyncError(async(req,res,next) =>{

});

export const deleteApplication = catchAsyncError(async(req,res,next) =>{

})
