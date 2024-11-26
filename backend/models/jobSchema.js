import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const jobSchema = new mongoose.Schema({
   title : {
        type : String,
        required : true
   },
   jobType : {
        type : String,
        required : true,
        enum : ["full-time","part-time","internship"]
   },
   location : {
        type : String,
        required : true
   },
   companyName : {
        type : String,
        required : true
   },
   introduction : {
        type : String
   },
   responsibilities : {
        type : String,
        required : true
   },
   qualifications : {
        type : String,
        required : true
   },
   offers : {
        type : String
   },
   salary : {
        type : String,
        required : true
   },
   hiringMultipleCandidated : {
        type : String,
        default : "No",
        enum : ["Yes","No"]
   },
   personalWebsite : {
       title : String,
       url : String
   },
   jobNiches : {
        type : String,
        required : true
   },
   newsLettersSent : {
        type : Boolean,
        default: false
   },
   jobPostedOn : {
        type : Date,
        default : Date.now
   },
   postedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
   },

});

export const Job = mongoose.model("Job", jobSchema);