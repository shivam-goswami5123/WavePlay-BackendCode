import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.upload.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async(req,res)=>{
    //steps for userRegister:
    //get user details from frontend
    //validation - not empty , email
    //check if user already exists
    //check for images , check for avatar
    //upload them on cloudinary
    //create user object - create entry on db
    //remove password and refreshToken from response
    //check for user creation
    //return res


    //console.log(req.body);

    const {fullName,email,username,password} = req.body; // destructuring of data
    console.log("Email:",email);

    //validation
    if(fullName === ""){
        throw new ApiError(400,"fullName Field is Required");
    }
    if(email === ""){
        throw new ApiError(400,"email Field is Required");
    }
    if(username === ""){
        throw new ApiError(400,"username Field is Required");
    }
    if(password === ""){
        throw new ApiError(400,"password Field is Required");
    }

    //check if user already exists
    const existedUser = await User.findOne({
        $or:[{ username },{ email }]
    });

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists");
    }

    //check for images
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //classic way of checking coverImage
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar File is Required");
    }

    //upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"avatar File is Required");
    }

    //object creation
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    });

    //remove password and refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user object creation
    if(!createdUser){
        throw new ApiError(500,"Something Went Wrong While Registering The User");
    }

    //return res
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    );


    /*res.status(200).json({
        message:"OK"
    });
    */
});

//after getting control from user.routes.js , registerUser function runs and user will be registered

export {registerUser};