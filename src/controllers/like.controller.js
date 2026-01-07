import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Tweet} from "../models/tweet.model.js"
import { Comment } from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const userId=req.user._id

    const existingLike=await Like.findOne({video:videoId,likedBy:userId})

    let isLiked;
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        isLiked=false
    }else{
        await Like.create({video:videoId,likedBy:userId})
        isLiked=true
    }
    return res.status(200)
    .json(new ApiResponse(200,isLiked,"Video like toggle done successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId=req.user._id

    const comment=await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    const existingLike=await Like.findOne({comment:commentId,likedBy:userId})
    let isLiked;
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        isLiked=false
    }
    else{
        await Like.create({
            comment:commentId,
            likedBy:userId
        })
        isLiked=true
    }

    return res.status(200).
    json(new ApiResponse(200,isLiked,"Comment toggle status fetched successfully"))

})  

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    const user= req.user
    const existingLike=await Like.findOne({tweet:tweetId,likedBy:user._id})

    let isLiked;
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        isLiked=false
    }else{
        await Like.create({
            tweet:tweetId,
            likedBy:user._id
        })
        isLiked=true
    }

    return res.status(200)
    .json(new ApiResponse(200,isLiked,"Tweet-Like toggled successfully"))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $replaceRoot: {
                newRoot: "$video"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}