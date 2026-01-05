import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { use } from "react"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    

    const userId=await User.findById(req.user._id)
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    if(userId.toString()=== channelId.toString()){
        throw new ApiError(403,"You cannot subscribe to yourself")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if (existingSubscription) {
        // unsubscribe
        await Subscription.deleteOne({
            _id: existingSubscription._id
        })

        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        )
    }

    const newSubscription = await Subscription.create({
        subscriber: userId,
        channel: channelId
    })
    return res.status(200)
    .json(new ApiResponse(200,newSubscription,"Subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscription=await Subscription.find({channel:channelId})

    const totalSubscriber= await Subscription.countDocuments({channel:channelId})

    return res.status(200).
    json(new ApiResponse(200,subscription,"Subs fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}