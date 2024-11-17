import mongoose from "mongoose";

export const dbConnection = () =>{
    mongoose.connect(process.env.MONGO_URL,{
        dbName : "JOB_SEEKING_SITE",
    }).then(() =>{
        console.log("Connected to database!");
    })
    .catch((err) =>{
        console.log(`Some error occured while connecting to the database : ${err}`);
    })
}
