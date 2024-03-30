import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.upload.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken=async(user_id)=>{
    try{
        const user=await User.findById(user_id);
        const accessToken=await user.generateAccessToken();
        const refreshToken=await user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"Something Went Wrong While Generating Tokens");
    }
}

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


const loginUser = asyncHandler( async(req,res)=>{
    //req.body -> data (from frontend)
    //validation - not empty
    //username or email based login
    //find user 
    //if not exists , send user do not exists
    //if exists , password check
    //if password matches , generate accessToken and refreshToken
    //send secure cookies
    //return res

    //req.body -> data
    const {username,email,password} = req.body;


    //username or email based login 

    //validation - not empty
    if(!(username || email)){
        throw new ApiError(400,"username or email is required");
    }

    
    //check for user existence:find user 
    const user = await User.findOne({
        $or:[{ email },{ username }]
    });

    //if not exists
    if(!user){
        throw new ApiError(404,"User Does Not Exists");
    }

    //if exists : password check
    const isValidPassword = await user.isPasswordCorrect(password);

    if(!isValidPassword){
        throw new ApiError(401,"Password Do Not Matches ... Invalid User Credentials");
    }

    //password matches : generate accessToken and refreshToken
    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    //send secure cookies
    const options={
            httpOnly:true,
            secure:true
        };

    //return res
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            { 
                user:loggedInUser,
                accessToken,
                refreshToken

            },
            "User Successfully Logged In"
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true //return response with new updated value
        }
    )

    const options={
        httpOnly:true,
        secure:true
    };

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"));

});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    //get refreshtoken from cookies or from body(if using mobile app)
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    //validate if not empty
    //console.log(incomingRefreshToken);
    if(!incomingRefreshToken){
        throw new ApiError(404,"Empty or Invalid Refresh Token");
    }
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
            );
    
       console.log(decodedToken); 

        const user=await User.findById(decodedToken?._id);
        //console.log(user);

        if(!user){
            throw new ApiError(401,"Unauthorized Access or Invalid Token");
        }
     
        //validate with db stored refreshToken
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Unauthorized Access or Invalid Token or Token Expired");
        }
    
        //generate new accessToken and refreshToken for that user
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessTokenAndRefreshToken(user?._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "New Tokens Generated"
            )
        );
    
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid Token");
    }

});

//after getting control from user.routes.js , registerUser function runs and user will be registered

export {registerUser,loginUser,logoutUser,refreshAccessToken};