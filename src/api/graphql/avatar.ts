import { idArg, mutationField, mutationType, nonNull, objectType, stringArg } from "nexus";
import { authenticate } from "../authentication/auth";
import { upload } from "../cloudinary/upload";

export const Avatar = objectType({
    name: "Avatar",
    definition(t){
        t.model.id()
        t.model.url()
        t.model.publicId()
        t.model.owner()
    }
})

export const CreateAvatarMutation = mutationField("createAvatar",{
    type: nonNull(Avatar),
    args: {
        image: nonNull(stringArg())
    },
    async resolve(_parent,{image},{prisma,request}){
        const userId = authenticate.auth(request);
        const { public_id,secure_url } = await upload.uploadPhoto(image);
        return prisma.avatar.create({
            data: {
                url: secure_url,
                ownerId: userId,
                publicId: public_id
            },
            include: {
                owner: true
            }
        })
    }
})

export const deleteAvatarMutation = mutationField("deleteAvatar",{
    type: nonNull(Avatar),
    args: {
        id: nonNull(idArg())
    },
    async resolve(_parent,args,{prisma,request}){
        const userId = authenticate.auth(request);
        const image = await prisma.avatar.findUnique({
            where: {
                id: args.id
            }
        })
        if(!image){
            throw new Error("Avatar not found.")
        }
        await upload.destroyPhoto(image.publicId);
        return prisma.avatar.delete({
            where: {
                id: args.id
            }
        })
    }
})
