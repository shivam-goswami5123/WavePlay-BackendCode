import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const destroyCloudVideo = async (localFilePath) => {
  try {
    const result = await cloudinary.uploader.destroy(localFilePath, { resource_type: 'video' });
    return true
  } catch (error) {
    console.error('Error deleting video:', error);
  }
};

const destroyCloudImage = async (localFilePath)=>{
  try{
      await cloudinary.uploader.destroy(localFilePath)
      return true
  }catch (error){
      return null
  }
}


const uploadOnCloudinary = async(localFilePath) =>{
    try{
        if(!localFilePath) return null;

        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        }); 

        //upload successfull
        console.log("File Uploaded On Cloudinary:",response.url);
        fs.unlinkSync(localFilePath);
        return response; 
        
    }
    catch(error){
        fs.unlinkSync(localFilePath);
        //this will remove the file from our local server if file upload on cloudinary fails
    }
};

/*
const deleteOnCloudinary=async(imageUrl)=>{
  try {
    // Extract public ID from the image URL
    const imageObject = await cloudinary.api.resource(imageUrl);
    console.log(imageObject);
    const publicId=imageObject['public_id'];
    console.log(publicId);
    
    // Delete the image using its public ID
    const result = await cloudinary.uploader.destroy(imageUrl);
    console.log('Image deletion result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
*/

export {destroyCloudImage,destroyCloudVideo,uploadOnCloudinary};

/*Demo Code
cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });
*/