import { arg, enumType, idArg, inputObjectType, intArg, interfaceType, list, mutationField, nonNull, objectType, queryField, queryType, stringArg, subscriptionField } from "nexus";
import { authenticate } from "../authentication/auth";

export const Post = objectType({
    name: "Post",
    definition(t){
        t.model.id()
        t.model.title()
        t.model.body()
        t.model.published()
        t.model.comments()
        t.model.likes()
        t.model.author()
        t.model.image()
        t.model.postSavedByUser()
        t.model.updatedAt();
        t.model.createdAt();
    }
})

export const PostSubscriptionPayload = objectType({
    name: "PostSubscriptionPayload",
    definition(t){
        t.nonNull.field("post",{
            type: Post
        }),
        t.nonNull.field("type",{
            type: MutationType
        })
    }
})

export const MutationType = enumType({
    name: 'MUTATION_TYPE',
    members: ['CREATED','UPDATED','DELETED']
})

export const CreatePostInput = inputObjectType({
    name: "createPostInput",
    definition(t){
        t.nonNull.string("title"),
        t.nonNull.string("body"),
        t.nonNull.boolean("published")
    }
})

export const UpdatePostInput = inputObjectType({
    name: "updatePostInput",
    definition(t){
        t.string("title"),
        t.string("body"),
        t.boolean("published")
    }
})

export const AddLikeMutation = mutationField("addLikeToPost",{
    type: Post,
    args: {
        id: nonNull(stringArg())
    },
    resolve(_parent,{id},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.post.update({where: {id},data: {
            likes: {
                connect: {
                    id: userId
                }
            }
        }})
    }
})

export const RemoveLikeMutation = mutationField("removeLikeFromPost",{
    type: Post,
    args: {
        id: nonNull(stringArg())
    },
    resolve(_parent,{id},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.post.update({where: {id},data: {
            likes: {
                disconnect: {
                    id: userId
                }
            }
        }})
    }
})

export const SavePostMutation = mutationField("savePost",{
    type: nonNull(Post),
    args: {
        id: nonNull(stringArg())
    },
    resolve(_parent,{id},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.post.update({where: {id},data: {
            postSavedByUser: {
                connect: {id: userId}
            }
        }})
    }
})

export const RemoveSavePostMutation = mutationField("removeSavePost",{
    type: nonNull(Post),
    args: {
        id: nonNull(stringArg())
    },
    resolve(_parent,{id},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.post.update({where: {id},data: {
            postSavedByUser: {
                disconnect: {id: userId}
            }
        }})
    }
})


export const userPostsQuery = queryField("userPosts",{
    type: nonNull(list(nonNull(Post))),
    args: {
        id: nonNull(stringArg()),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({type: "PostOrderByInput"})
    },
    resolve(_parent,{id},{prisma}){
        return prisma.post.findMany({
            where: {
                authorId: id
            },
            include: {
                likes: true,
                image: true,
                comments: true, 
                author: true
            }
        })
    }
})

export const CreatePostMutation = mutationField("createPost",{
    type: nonNull(Post),
    args: {
        data: nonNull(arg({type: CreatePostInput}))
    },
    async resolve(_parent,{data},{prisma,request,pubsub}){
        const userId = authenticate.auth(request);
        const post = await prisma.post.create({
            data: {
                ...data,
                authorId: userId
            }
        })
        // await pubsub.publish("MYPOST_MUTATION",{
        //     type: "CREATED",
        //     post: post
        // })
        return post
    }
})

export const DeletePostMutation = mutationField("deletePost",{
    type: nonNull(Post),
    args: {
        id: nonNull(idArg())
    },
    resolve(_parent,{id},{prisma,request}){
        authenticate.auth(request);
        return prisma.post.delete({
            where: {
                id: id
            }
        })
    }
})

export const UpdatePostMutation = mutationField("updatePost",{
    type: nonNull(Post),
    args: {
        id: nonNull(idArg()),
        data: nonNull(arg({type: UpdatePostInput}))
    },
    async resolve(_parent,{id,data},{prisma,request}){
        authenticate.auth(request);
        const post = await prisma.post.findUnique({
            where: {
                id: id
            }
        })
        if(!post){
            throw new Error("Post not found.")
        }
        if(data.title){
            post.title = data.title
        }
        if(data.body){
            post.body = data.body
        }
        if(data.published === false || data.published === true){
            post.published = data.published
            if(data.published === false){
                prisma.comment.deleteMany({
                    where: {
                        postId: id
                    }
                })
            }
        }
        return prisma.post.update({
            where: {
                id: id
            },
            data: post
        })
    }
})

// `export const PostSubscription = subscriptionField("myPosts",{
//     type: PostSubscriptionPayload,
//     subscribe(_parent,_args,{ prisma, pubsub,request }){
//         //auth(request)
//         return pubsub.asyncIterator(["MYPOST_MUTATION"])
//     },
//     resolve(payload: any) {
//         return payload;
//     } 
// })`
