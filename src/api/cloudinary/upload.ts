import {v2} from 'cloudinary';

class PhotoUpload {
    private static instance : PhotoUpload;

    constructor(){
        v2.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY, 
            api_secret: process.env.API_SECRET
        });
    }

    static getInstance(){
        if(this.instance){
            return this.instance
        }else{
            this.instance = new PhotoUpload();
            return this.instance
        }
    }

    async uploadPhoto(image: string){
        try {
            const response = await v2.uploader.upload(image,{
                allowed_formats: ["jpg","png","jpeg"],
                folder: 'graphql-blogging-app'
            });
            return response
        } catch (error) {
            throw new Error(error)
        }
    }

    async destroyPhoto(publicId: string){
        try {
            const response = await v2.uploader.destroy(publicId);
            return response
        } catch (error) {
            throw new Error(error)
        }
    }
}

export const upload = PhotoUpload.getInstance();