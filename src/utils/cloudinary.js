import {v2 as cloudinary,} from "cloudinary"
import fs from "fs" 



cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
 
    });


const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  // works with folders also
  const match = url.match(/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
};


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary=async (avatarUrl)=>{
        if(!avatarUrl) return
        const publicId=getPublicIdFromUrl(avatarUrl)
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId)
}


export {uploadOnCloudinary,deleteFromCloudinary}