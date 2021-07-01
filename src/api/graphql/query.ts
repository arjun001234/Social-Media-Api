import {  queryType } from "nexus"
import { authenticate } from "../authentication/auth"

export const Query = queryType({
    definition(t){
        t.crud.user()
        t.crud.users({
            pagination: true,
            ordering: true,
        })
        // t.crud.avatar({
        //     alias: 'myAvatar',
        //     resolve(_parent,_args,{prisma,request}){
        //         const userId = auth(request);
        //         return prisma.avatar.findUnique({
        //             where: {
        //                 ownerId: userId
        //             },
        //             include: {
        //                 owner: true
        //             }
        //         })
        //     }
        // })
        t.crud.comments({
            pagination: true,
            ordering: true,
        })
        t.crud.post()
        t.crud.posts({
            pagination: true,
            ordering: true,
        })
        t.crud.posts({
            alias: 'drafts',
            pagination: true,
            ordering: true,
            resolve(_parent,_args,{prisma,request}){
                const userId = authenticate.auth(request);
                return prisma.post.findMany({
                    where: {
                        authorId: userId,
                        published: false
                    },
                    include: {
                        author: true,
                        comments: true
                    }
                })
            }
        })
        t.crud.posts({
            alias: 'myPosts',
            pagination: true,
            ordering: true,
            resolve(_parent,_args,{prisma,request}){
                const userId = authenticate.auth(request);
                return prisma.post.findMany({
                    where: {
                        authorId: userId
                    },
                    include: {
                        author: true,
                        comments: true
                    }
                })
            }
        })
        t.crud.comments({
            alias: "myComments",
            pagination: true,
            ordering: true,
            resolve(_parent,_args,{prisma,request}){
                const userId = authenticate.auth(request);
                return prisma.comment.findMany({
                    where: {
                        authorId: userId
                    },
                    include: {
                        author: true
                    }
                })
            }
        })
        t.crud.user({
            alias: 'me',
            async resolve(_parent,_args,{prisma,request}){
                const userId = authenticate.auth(request);
                const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                include: {
                posts: true,
                comments: true,
                savedPosts: true,
                followers: true,
                following: true,
                }
                })
                if(user){
                    return user
                }else{
                    throw new Error("User not found.")
                }
            }
        })
    }
})