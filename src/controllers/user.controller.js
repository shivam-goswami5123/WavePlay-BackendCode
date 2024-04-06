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
            /*$set:{
                refreshToken:undefined
            }
            */
           $unset:{
            refreshToken:1 //this removes the field from the document
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

const changeUserPassword = asyncHandler( async(req,res)=>{

    const {oldPassword , newPassword}=req.body;

    const user=await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid User Password");
    }

    user.password=newPassword;

    user.save({ validateBeforeSave:false });

    return res.
    status(200)
    .json( new ApiResponse(200,{},"Password Changed Successfully"));

});

const getCurrentUser = asyncHandler( async(req,res) =>{

    const user=await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400,"User Not Found");
    }


    return res.
    status(200)
    .json( new ApiResponse(200,{user},"Current User Fetched"));
});

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,username,email}=req.body; //if wants to update all three fields

    if(!(fullName || username || email)){
        throw new ApiError(404,"User Not Found or Invalid Details");
    }

    const user=await findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                username:username,
                email:email
            }
        },
        {new:true}
        )
        .select("-password");

        return res
        .status(200)
        .json( new ApiResponse(200,user,"Account Details Changed Successfully"));
});

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path; //multer

    if(!avatarLocalPath){
        throw new ApiError(400,"Missing Avatar Details");
    }

    const avatar=await uploadOnCloudinary.upload(avatarLocalPath);
    console.log(avatar);

    if(!avatar.url){
        throw new ApiError(400,"Avatar URL Not Found");
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar:avatar.url
        },
        {new:true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar Changed Successfully")
    )
});

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path; //multer : upload single file : req.file

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage Path Not Found");
    }

    const coverImage=await uploadOnCloudinary.upload(coverImagePath);
    console.log(coverImage);

    if(!coverImage.url){
        throw new ApiError(400,"Cover Image URL Not Found");
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage:coverImage.url
        },
        {new:true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"CoverImage Changed Successfully")
    )
});

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(404,"User Not Found");
    }


    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions", //name of model as stored in mongo db
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subcribedTo"
            }
        },
        {
            //add more fields to each document of user model
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers" //as 'subscribers' is field name so use '$' before it
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    //read more about it
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            //make the flag 1 to those fields which u want to project
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    console.log(channel);

    if(!channel?.length){
        throw new ApiError(404,"Channel Does Not Exist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "User Channel Fetched Successfully"
        )
    );
});

const getWatchHistory = asyncHandler(async(req,res)=>{
    //match the user
    //write pipelines : subpipelines

    const user=await User.aggregate([
        {
            $match:{
                //req.user?._id : not used this because aggregation commands directly goes to mongodb  without interference of mongoose 
                //so to get _id of correct format we use this below command
                //actual output of req.user._id is string of just below format
                //database : this is stored in document of a model {_id:ObjectId('6753b.....')}
                //but with mongoose interference behind the scenes it gives only 6753b....
                _id:new mongoose.Types.ObjectId(req.user?._id) 
                
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            //TODO:Wrie this pipeline outside and experiment what happens
                            //made this pipeline because while lookup : videos"owner" from users"_id" we will get many fields from users but 
                            //we requires only some fields so by this pipeline we project only few required fields to owner
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        //array in output form but for frontend easy access use this below code
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"Watch History Fetched Successfully")
    )
})

//after getting control from user.routes.js , registerUser function runs and user will be registered

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeUserPassword,getCurrentUser
,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,
getWatchHistory};