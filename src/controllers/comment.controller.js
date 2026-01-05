import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit



    const video= await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const comments=await Comment.find({video:video._id})
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)
    .select("content owner createdAt")

    const totalComments = await Comment.countDocuments({ video: videoId })
    
    return res.status(200).
    json(new ApiResponse(200,
        {
            comments,
            pagination:totalComments,
            page,
            limit,
            totalPages:Math.ceil(totalComments/limit)
        }
        ,
        "Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const commentOwner=req.user._id
    const {videoId}= req.params
    const video =await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const {content}=req.body
    const comment=await Comment.create({
        content:content,
        video:videoId,
        owner:commentOwner
    })

    return res.status(200)
    .json(new ApiResponse(200,comment,"Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {updatedContent}=req.body
    const userId=req.user._id
    const {commentId}=req.params

    if (!updatedContent?.trim()) {
        throw new ApiError(400, "Comment content cannot be empty")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment")
    }

    comment.content=updatedContent
    await Comment.save()
    return res.status(200).
    json(new ApiResponse(200,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const userId=req.user._id
    const {commentId}=req.params

    const comment=await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }


    if(comment.owner.toString()!== userId.toString()){
        throw new ApiError(403,"Unauthorized access")
    }
    await comment.deleteOne()

    res.status(200).
    json(new ApiResponse(200,null,"Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }