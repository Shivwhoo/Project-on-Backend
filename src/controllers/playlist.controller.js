import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const userId = req.user._id

    if(!name || !name.trim()){
        throw new ApiError(400,"Playlist name is required")
    }

    if(!description || !description.trim()){
        throw new ApiError(400,"Playlist description is required")
    }

    const playlist= await Playlist.create({
        name,
        description,
        videos:[],
        owner:userId
    })

    if(!playlist){
        throw new ApiError(400,"Something went wrong while creating the playlist")
    }

    return res.status(201)
    .json(new ApiResponse(201,playlist,"Playlist created successfully."))


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const playlist= await Playlist.find({owner:userId})

    if(playlist.length === 0){
        return res.status(200).json(new ApiResponse(200,playlist,"No playlist found"))
    }

    return res.status(200).
    json(new ApiResponse(200,playlist,"User's playlist fetched successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist id is invalid")
    }
    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    return res.status(200).
    json(new ApiResponse(200,playlist,"Playlist by id fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const userId = req.user._id

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const isAlreadyAdded = playlist.videos.some(
        (vid) => vid.toString() === videoId
    )

    if (isAlreadyAdded) {
        throw new ApiError(400, "Video already in playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save({ validateBeforeSave: false })

    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "Video added to the playlist successfully"
        )
    )
})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const playlist= await Playlist.findById(playlistId)

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Unauthorized access")
    }

    if (!playlist) {
    throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(404, "Video not found in playlist");
    }


    const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
    );

    return res.status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video deleted successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Unauthorized access")
    }

    await playlist.deleteOne()

    return res.status(200)
    .json(new ApiResponse(200,{},"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    if(!name || !name.trim()){
        throw new ApiError(400,"Name feild is required")
    }
    if(!description || !description.trim()){
        throw new ApiError(400,"Description feild is required")
    }

    const playlist= await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Unauthorized access")
    }

    const updatedPlaylist =await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description,
        },
        { new: true }

    )

    return res.status(200).
    json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}