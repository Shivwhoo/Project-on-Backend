import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //1.get the content
    //2.check for empty content
    //3.create the content in db

    const {content}=req.body

    if(!content.trim()){
        throw new ApiError(400,"Twwet can't be empty")
    }

    const tweet=await Tweet.create({
        content,
        owner:req.user._id
    })

    const createdTweet= await Tweet.findById(tweet._id)

    if(!createdTweet){
        throw new ApiError(500,"Something went wrong while posting the tweet")
    }

    return res.status(201).
    json(new ApiResponse(201,tweet,"Tweet created successfully."))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    //get the user
    //show the tweets in response

    const user=req.user
    const tweets=await Tweet.find({owner:user._id})
    .sort({createdAt:-1})  //descending order

    return res.status(200)
    .json(new ApiResponse(200,tweets,"Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    /*
    get the tweet
    and update
    */ 

    const {updatedContent}=req.body
    const tweetId=req.params.tweetId
    if(!updatedContent.trim()){
        throw new ApiError(400,"Tweet can't be empty.")
    }

   const tweet=await Tweet.findByIdAndUpdate(
    {_id:tweetId,owner:req.user._id},
    {
        content:updatedContent
    },
    {
        new:true
    }
   )
    return res.status(200)
    .json(new ApiResponse(200,tweet,"Tweet updated successfully."))    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const tweetId=req.params.tweetId
    const user=req.user

    const tweet=await Tweet.findOneAndDelete({_id:tweetId,owner:user._id})

    if(!tweet){
        throw new ApiError(400,"Tweet not found or unauthorized access")
    }
    return res.status(200)
    .json(new ApiResponse(200,tweet,"Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}