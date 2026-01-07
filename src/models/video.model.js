import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema= new Schema({
    videoFile:{
        type:String,
        required:true,
    },
    thumbNail:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})


videoSchema.plugin(mongooseAggregatePaginate)


export const Video=mongoose.model("Video",videoSchema)


//userid test@finals
//pass tests

//video id 695e8d587a08c4ac37a2be45

//comment id 695e8dce0d6b931211b617cc

//