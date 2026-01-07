import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const pageNum = Math.max(Number(page), 1)
    const limitNum = Math.min(Number(limit), 50)
    const skip = (pageNum - 1) * limitNum

    const filter = {}

    if (userId) {
        filter.owner = userId
    }

    if (query) {
        filter.title = { $regex: query, $options: "i" }
    }

    const sortOptions = {}

    if (sortBy) {
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1
    } else {
        sortOptions.createdAt = -1
    }

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)

    const totalVideos = await Video.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                totalVideos,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalVideos / limitNum)
            },
            "Videos fetched successfully"
        )
    )
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const user= await User.findById(req.user._id)

    if(!user){
        throw new ApiError(400,"Unauthorized access")
    }

    const videoFile=req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path
    if (!videoFile) {
            throw new ApiError(400, "Video file is required")
    }
    if (!thumbnailLocalPath) {
            throw new ApiError(400, "Thumbnail file is required")
    }

    const video= await uploadOnCloudinary(videoFile)
    if(!video){
        throw new ApiError(400,"Video file is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(400,"Thumbnail is required")
    }


    const videoDb=await Video.create({
        videoFile:video.url,
        thumbNail:thumbnail.url,
        title:title,
        description:description,
        duration:video.duration || 0.0,
        views:0,
        isPublished:true,
        owner:user._id
    })

    const createdVideo=await Video.findById(videoDb.id)

    if(!createdVideo){
        throw new ApiError(500,"Something went wrong wile publishing a video")
    }
    return res.status(201).json(
            new ApiResponse(200, createdVideo, "Video published Successfully")
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(404,"Video id is invalid")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    await Video.findOneAndUpdate(
    { _id: videoId },
    { $inc: { views: 1 } },
    { new: true }
    )


    return res.status(200)
    .json(new ApiResponse(200,video,"Video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail


    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(404,"Video id is invalid")
    }

    const user=req.user
    
    const video=await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }


    if(user._id.toString()!== video.owner.toString()){
        throw new ApiError(400,"Unauthorized access")
    }

    const updatedvideoFile=req.files?.videoFile?.[0]?.path

    const updatedThumbnail=req.files?.thumbnail?.[0]?.path

    if(!updatedvideoFile){
        throw new ApiError(400,"updated video is required")
    }

    const newVideo=await uploadOnCloudinary(updatedvideoFile)

    if(!newVideo || !newVideo.url){
        throw new ApiError(400,"Error while uploading the updated video")
    }

    const oldVideoUrl=video.videoFile

    video.videoFile=newVideo.url
    video.duration = newVideo.duration
    await video.save({validateBeforeSave:false})

    if(oldVideoUrl){
        await deleteFromCloudinary(oldVideoUrl)
    }

    return res.status(200)
    .json(new ApiResponse(200,video,"Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const user =req.user

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Video id not correct")
    }

    const video=await Video.findById(videoId)

    if (!video) {
    throw new ApiError(404, "Video not found")
    }


    if(user._id.toString()!=video.owner.toString()){
        throw new ApiResponse(403,"Unautorized access")
    }

    const videoUrl=video.videoFile
    const thumbnailUrl = video.thumbNail

    await Video.findByIdAndDelete(videoId)
    await deleteFromCloudinary(videoUrl);
    await deleteFromCloudinary(thumbnailUrl);

    return res.status(200)
    .json(new ApiResponse(200,{},'video deleted successfully'))


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Video id not correct")
    }

    const video= await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    const user=req.user
    if(user._id.toString()!== video.owner.toString()){
        throw new ApiError(403,'Unauthorized access')
    }

    video.isPublished = !video.isPublished

    await video.save({validateBeforeSave:false})


    return res.status(200).
    json(new ApiResponse(200,video,"Toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}