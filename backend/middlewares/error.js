class Errorhandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err,req,res,next) =>{
    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;

    if(err.name === "CaseError"){
        const message = `Resource not found. Invalid ${err.path} `;
        err = new Errorhandler(message,400);
    }
    if(err.code === 11000){    //if there is any issue in database uri,name
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered `;
        err = new Errorhandler(message,400);
    }
    if(err.name === "JsonWebTokenError"){
        const message = `Json web token is invalid, Try Again`;
        err = new Errorhandler(message,400);
    }
    if(err.name === "TokenExpiredError"){
        const message = `Json web token is expired, Try Again `;
        err = new Errorhandler(message,400);
    }
    return res.status(err.statusCode).json({
        success : false,
        message : err.message,
       
    });
}

export default Errorhandler;