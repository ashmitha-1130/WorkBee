import cron from "node-cron";
import {Job} from "../models/jobSchema.js";
import {User} from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const newsLetterCron = () =>{
    cron.schedule("*/1 * * * *", async()=>{    //star indicates minutes,hours,days,month,week days
        console.log("Running Cron Automation.")
        const jobs = await Job.find({newsLettersSent : false});
        for(const job of jobs){
            try {
                const filteredUsers = await User.find({
                    $or : [
                        {"niches.firstNiche" : job.jobNiches},
                        {"niches.secondNiche" : job.jobNiches},
                        {"niche.thirdNiche": job.jobNiches}
                    ]
                });
                for(const user of filteredUsers){
                    const subject =`Hot Job Alert : ${job.title} in ${job.jobNiches} Available now.`;
                    const message = `H1 ${user.name},\n\nGreat news! A new job that fits your niche has just been posted.
                        The position is for ${job.title} with ${job.companyName},and they are looking to hire immediately.
                        \n\nJob Details:\n- **Position:** ${job.title}\n- **Company:** ${job.companyName}\n- **Location:** ${job.location}\n- **Salary:** ${job.salary}\n\nDon't wait too long! Job opening like these are 
                       filled quickly.\n\nWe're here to support you in your job search. Best of luck!\n\nBest Regards,
                       \nNichNest Team`;
                    await sendEmail({
                        email : user.email,
                        subject,
                        message
                    })
                }
                job.newsLettersSent = true;
                await job.save();
            } catch (error) {
                console.log("ERROR IN NODE CRON CATCH BLOCK");
                return next(console.log(error || "Some error in cron"));
                
            }
        }

    })
}