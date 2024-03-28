import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) =>{
    try{
        if(!localFilePath) return null;

        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        });
        console.log("File Uploaded On Cloudinary:",response.url);
        return response;
        
    }
    catch(error){
        fs.unlinkSync(localFilePath);
        //this will remove the file from our local server if file upload on cloudinary fails
    }
};

export {uploadOnCloudinary};

/*Demo Code
cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });
*/