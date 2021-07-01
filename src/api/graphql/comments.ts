
import { arg, idArg, inputObjectType, intArg, list, mutationField, nonNull, objectType, queryField, stringArg } from "nexus";
import { authenticate } from "../authentication/auth";

export const Comment = objectType({
    name: "Comment",
    definition(t){
        t.model.id()
        t.model.text()
        t.model.post()
        t.model.author()
        t.model.likes()
        t.model.updatedAt();
        t.model.createdAt();
    }
})

export const CreateCommentInput = inputObjectType({
    name: "createCommentInput",
    definition(t){
        t.nonNull.string("text")
    }
})

export const AddLikeCommentMutation = mutationField("addLikeToComment",{
    type: nonNull(Comment),
    args: {
        id: nonNull(stringArg())
    },
    resolve(_parent,{id},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.comment.update({where: {id},data: {
            likes: {
                connect: {
                    id: userId
                }
            }
        }})
    }
})

export const RemoveLikeCommentMutation = mutationField("removeLikeFromComment",{
    type: nonNull(Comment),
    args: {
        id: nonNull(stringArg())
    },
    resolve(_parent,{id},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.comment.update({where: {id},data: {
            likes: {
                disconnect: {
                    id: userId
                }
            }
        }})
    }
})

export const userCommentsQuery = queryField("userComments",{
    type: nonNull(list(nonNull(Comment))),
    args: {
        id: nonNull(stringArg()),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({type: "CommentOrderByInput"})
    },
    resolve(_parent,{id},{prisma}){
        return prisma.comment.findMany({
            where: {
                authorId: id
            },
            include: {
                likes: true,
                author: true
            }
        })
    }
})

export const CreateCommentMutation = mutationField("createComment",{
    type: nonNull(Comment),
    args: {
        data: nonNull(arg({type: CreateCommentInput})),
        postId: nonNull(idArg())
    },
    resolve(_parent,{data,postId},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.comment.create({
            data: {
                ...data,
                postId,
                authorId: userId
            }
        })
    }
})

export const DeleteCommentMutation = mutationField("deleteComment",{
    type: nonNull(Comment),
    args: {
        id: nonNull(idArg())
    },
    resolve(_parent,{id},{prisma,request}){
        authenticate.auth(request);
        return prisma.comment.delete({
            where: {
                id: id,
            }
        })
    }
})

export const UpdateCommentMutation = mutationField("updateComment",{
    type: nonNull(Comment),
    args: {
        data: arg({type: CreateCommentInput}),
        id: nonNull(idArg())
    },
    resolve(_parent,{id,data},{prisma,request}){
        authenticate.auth(request);
        return prisma.comment.update({
            where: {
                id: id
            },
            data: {...data}
        })
    }
})
