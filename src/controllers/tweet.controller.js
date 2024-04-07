import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


//CRUD OPERATIONS
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //req.body -> content
    //check content - not empty
    //find user matching the currently loggedIn user  -> req.user
    //insert a document of tweet in tweet model
    //return res
    const {content}=req.body;

    if(!content){
        throw new ApiError(400,"Required Content Field");
    }

    const user=await User.findById(req.user?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404,"User Not Found");
    }

    const tweet=await Tweet.create({
        content:content,
        owner:user._id
    });

    console.log(tweet);

    return res
    .status(200)
    .json(
        new ApiResponse(
        200,
        tweet,
        "Tweet Successfully Created"
        )
    );

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    //get user id from req.user
    //validate user - not empty
    //find user with documents in tweet model
    //fetch all the tweets
    //return res

    const user=await User.findById(req.user?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404,"User Not Found");
    }

    try{
        const tweets=await Tweet.find({owner:user?._id}).select("-owner");
        if(!tweets){
            throw new ApiError(404,"Tweets Not Found");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            tweets,
            "Tweets Fetched Succesfully"
        )
        )
    }
    catch(error){
        console.log("Error: ",error.message);
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
   //req.body -> newContent
   //req.params -> tweet _id which is to be updated
   //update the tweet and save
   //return res

    const {newContent}=req.body;
    if(!newContent){
        throw new ApiError(400,"Missing Fields");
    }

    const tweetId=req.params.tweetId;
    if(!tweetId){
        throw new ApiError(404,"Tweet Not Found Or Missing Params");
    }

    console.log(tweetId);
    const tweet=await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content:newContent
            }
        },
        {
            new:true
        }
    );


    tweet.save({ validateBeforeSave:false });

    return res
    .status(200)
    .json(
        new ApiResponse(
        200,
        tweet,
        "Tweet Updated Successfully"
    )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    //req.params -> get that particular tweet id to be deleted
    //find that tweet matching the id
    //delete this tweet document from Tweet Model
    //return res

    const tweetId=req.params.tweetId;

    if(!tweetId){
        throw new ApiError(404,"Tweet Not Found OR Missing Params");
    }

    await Tweet.deleteOne({_id:tweetId});

    return res
    .status(200)
    .json(
        new ApiResponse(
        200,{},"Tweet Deleted Successfully"
        )
    );

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}