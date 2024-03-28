import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"OK"
    });
});

//after getting control from user.routes.js , registerUser function runs and user will be registered

export {registerUser};