import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { Job } from "../models/jobSchema.js";

export const postJob = catchAsyncError(async(req,res,next) =>{
    const {
        title,
        jobType,
        location,
        companyName,
        introduction,
        responsibilities,
        qualifications,
        offers,
        salary,
        hiringMultipleCandidated,
        personalWebsiteTitle,
        personalWebsiteUrl,
        jobNiches,
    } = req.body;
    if(
        !title || 
        !jobType ||
        !location ||
        !companyName ||
        !introduction ||
        !responsibilities ||
        !qualifications ||
        !salary ||
        !jobNiches 
    )
    return next(new ErrorHandler("Please provide full job details",400));

    if(personalWebsiteTitle && !personalWebsiteUrl  || (!personalWebsiteTitle && personalWebsiteUrl)){
        return next(new ErrorHandler("Provide both website url and title, or leave both blank",400));
    };

    const postedBy = req.user._id;
    const job = await Job.create({
        title,
        jobType,
        location,
        companyName,
        introduction,
        responsibilities,
        qualifications,
        offers,
        salary,
        hiringMultipleCandidated,
        personalWebsite : {
            title : personalWebsiteTitle,
            url : personalWebsiteUrl
        },    
        jobNiches,
        postedBy
    });
    res.status(201).json({
        success : true,
        message : "Job posted successfully",
        job
    })
});

export const getAllJobs  = catchAsyncError(async(req,res,next) =>{
    const {city,niche,searchkeyword} = req.query;
    const query = {};
    if(city){
        query.location = city;  //adding location inside query object
    }
    if(niche){
        query.jobNiches = niche;
    }
    if(searchkeyword){
        query.$or = [
            {title : {$regex : searchkeyword , $options : "i"}},
            {companyName : {$regex : searchkeyword, $options : "i"}},
            {introduction : {$regex : searchkeyword, $options : "i"}},
        ];
    }
    const jobs = await Job.find(query);
    res.status(200).json({
        message : true,
        jobs,
        count : jobs.length
    })
});
export const getMyJobs = catchAsyncError(async(req,res,next) =>{
    const myJobs = await Job.find({postedBy : req.user._id});
    res.status(200).json({
        success : true,
        myJobs
    });

});
export const deleteJob = catchAsyncError(async(req,res,next) =>{
    const {id} = req.params;
    const job = await Job.findById(id);
    if(!job){    //if it takes time to load the data
        return next(new ErrorHandler("Oops job not found",404));
    }
    await job.deleteOne();
    res.status(200).json({
        success : true,
        message : "Job deleted"
    })

});
export const getSingleJob = catchAsyncError(async(req,res,next) =>{
    const {id} = req.params;
    const job = await Job.findById(id);
    if(!job){
        return next(new ErrorHandler("Job not found",404));
    }
    res.status(200).json({
        success : true,
        job
    })
});