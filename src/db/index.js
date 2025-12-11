import mongoose from "mongoose";
import { DB_NAME } from "../../src/constants.js"


const connectDB = async ()=>{
    try {
        const connectionnInstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`\n MONGO DB CONNECTED !! DB HOST ${connectionnInstance.connection.host}`)
    } catch (error) {
        console.log("MONGO DB CONNECTION ERROR ",error)
        process.exit(1);
    }
}

export default connectDB
