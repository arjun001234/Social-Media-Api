import { idArg, mutationField, nonNull, objectType, queryField, stringArg } from "nexus";
import { authenticate } from "../authentication/auth";
import { upload } from "../cloudinary/upload";

export const Image = objectType({
    name: "Image",
    definition(t){
        t.model.id()
        t.model.url()
        t.model.publicId()
        t.model.owner()
    }
})

export const ImageQuery = queryField("image",{
    type: nonNull(Image),
    args: {
        productId: nonNull(idArg())
    },
    async resolve(_parent,args,{prisma}){
        const image = await prisma.image.findFirst({
            where: {
                ownerId: args.productId
            }
        })
        if(image){
            return image
        }else{
            throw new Error("Image not found.")
        }
    }
})

export const CreateImageMutation = mutationField("createImage",{
    type: nonNull(Image),
    args: {
        postId: nonNull(idArg()),
        image: nonNull(stringArg())
    },
    async resolve(_parent,{postId,image},{prisma,request}){
        authenticate.auth(request);
        const { public_id,secure_url } = await upload.uploadPhoto(image);
        return prisma.image.create({
            data: {
                url: secure_url,
                ownerId: postId,
                publicId: public_id
            },
            include: {
                owner: true
            }
        })
    }
})

export const DeleteImageMutation = mutationField("deleteImage",{
    type: nonNull(Image),
    args: {
        id: nonNull(idArg())
    },
    async resolve(_parent,{id},{prisma,request}){
        authenticate.auth(request);
        const image = await prisma.image.findUnique({
            where: {
                id: id
            }
        })
        if(!image){
            throw new Error("Image not found.")
        }
        await upload.destroyPhoto(image.publicId);
        return prisma.image.delete({
            where: {
                id: id
            }
        })
    }
})