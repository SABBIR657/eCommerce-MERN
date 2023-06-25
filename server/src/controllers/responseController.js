const errorResponse = (res, {statusCode=500, message= "internal server Error!"}) =>{

    return res.status(statusCode).json({
        sucess: false,
        message:  message,
      });
};
const successResponse = (res,{ statusCode=200, message= "Sucess", payload = {}}) =>{

    return res.status(statusCode).json({
        sucess: true,
        message:  message,
        payload,
      });
};

module.exports = {errorResponse, successResponse};