import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { sendToken } from "../utils/jwtTokens.js";
import fs from 'fs';

export const register = catchAsyncError(async (req, res, next) => {
    try {
        const {
            name, 
            email, 
            password, 
            address,
            phone,
            role, 
            firstNiche,
            secondNiche, 
            thirdNiche, 
            coverLetter,
        } = req.body;

        if (!name || !email || !password || !address || !phone || !role) {
            return next(new ErrorHandler("All fields are required.", 400));
        }

        if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
            return next(new ErrorHandler("Please provide your preferred niches.", 400));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler("Email is already registered", 400));
        }

        const userData = {
            name,
            email,
            password,
            address,
            phone,
            role,
            niches: {
                firstNiche,
                secondNiche,
                thirdNiche,
            },
            coverLetter,
        };

        if (req.files && req.files.resume) {
            const { resume } = req.files;

            try {
                // Upload file to Cloudinary
                const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath, {
                    folder: "Job_Seekers_Resume",
                    resource_type: "auto", // auto-detect file type
                });

                if (cloudinaryResponse.error) {
                    return next(new ErrorHandler("Failed to upload resume to Cloudinary.", 500));
                }

                // Add Cloudinary URL and ID to userData
                userData.resume = {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.secure_url,
                };

                // Clean up the temporary file after upload
                fs.unlinkSync(resume.tempFilePath);

            } catch (error) {
                console.error("Error uploading to Cloudinary: ", error);
                return next(new ErrorHandler("Failed to upload resume.", 500));
            }
        }

        // Create the user
        const user = await User.create(userData);
        sendToken(user,201,res,"User Registered")
        // res.status(201).json({
        //     success: true,
        //     message: 'User Registered successfully.',
        // });

    } catch (error) {
        next(error);
    }
});

export const login = catchAsyncError(async(req,res,next) =>{
        const {
            role,
            email,
            password
        } = req.body;

        if(!role || !email || !password){
            return next(new ErrorHandler("role,email and password are required.",400));
        }
        const user = await User.findOne({email}).select("+password")
        if(!user){
            return next(new ErrorHandler("Invalid email or password.",400));
        }
        const isPasswordMatched = await user.comparePassword(password);
            if(!isPasswordMatched){
                return next(new ErrorHandler("Invalid email or password.",400))
            }
            if(user.role !== role){
                return next(new ErrorHandler("Invalid user role.",400))
            }
            sendToken(user,200,res,"User Logged in successfully");
 
});
export const logout = catchAsyncError(async(req,res,next) =>{
    res.status(200).cookie("token","",{
        expires : new Date(Date.now()),
        httpOnly : true,
    }).json({
        sucess : true,
        mesaage : "Logged out successfully."
    })

});

export const getUser = catchAsyncError(async(req,res,next) =>{
    const user = req.user;
    res.status(200).json({
        success : true,
        user,
    })
});

export const updateProfile = catchAsyncError(async(req,res,next) =>{
    const newUserData = {
        name : req.body.name,
        email : req.body.email,
        address : req.body.address,
        phone : req.body.phone,
        coverLetter : req.body.coverLetter,
        niches : {
            firstNiche : req.body.firstNiche,
            secondNiche : req.body.secondNiche,
            thirdNiche : req.body.thirdNiche
        }
    }

    const {firstNiche, secondNiche, thirdNiche} = newUserData.niches;

    if(req.user.role == "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
            return next(new ErrorHandler("please provide your all prefered job niches.",400));
    }
    if(req.files){
        const {resume } = req.files;
        if(resume){
            const currentResumeId = req.user.resume.public_id
            if(currentResumeId){
               await cloudinary.uploader.destroy(currentResumeId);
            }
            const newResume = await cloudinary.uploader.upload(resume.tempFilePath,
                {folder : "Job_Seekers_Resume",
                resource_type: "auto"}
            )

            newUserData.resume = {
                public_id : newResume.public_id,
                url : newResume.secure_url

            }
            fs.unlinkSync(resume.tempFilePath);
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    });
    res.status(200).json({
        success : true,
        user,
        message : "Profile Updated"
    })

});

export const updatePassword = catchAsyncError(async(req,res,next) =>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched  = user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect.",400));
    }
    if(req.body.newPassword != req.body.confirmPassword){
        return next(new ErrorHandler("New password & confirm password do not match.",400))
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user,200,res,"Password updated successfully");
})
