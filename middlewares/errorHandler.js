import { ValidationError } from "joi";

const errorHandler = (err, req, res, next) => {

    let statusCode = 500;

    let data = {
        message: 'Internal Server Error',
        originalError: err.message
    }

    if(err instanceof ValidationError) {
        statusCode = 422;
        data = {
            message: err.message,
        };
    }
    
    return res.status(statusCode).json(data);

}

export default errorHandler;