import { arg, extendType, idArg, inputObjectType, mutationField, nonNull, objectType, queryField, stringArg } from "nexus";
import { validate } from "../validation/user.validation";
import * as jwt from 'jsonwebtoken';
import { authenticate } from "../authentication/auth";

export const User = objectType({
    name: "User",
    definition(t) {
        t.model.id()
        t.model.name()
        t.model.email({
            resolve(parent,_args,{request}){
                const isUser = authenticate.optionalAuth(request,false);
                if(isUser){
                    return parent.email
                }else{
                    return 'null'
                }
            }
        })
        t.model.password()
        t.model.posts()
        t.model.comments()
        t.model.followers()
        t.model.following()
        t.model.likedComments()
        t.model.likedPosts()
        t.model.savedPosts()
        t.model.updatedAt();
        t.model.createdAt();
    }
})

export const loginUserInput = inputObjectType({
    name: "loginUserInput",
    definition(t){
        t.nonNull.string("email")
        t.nonNull.string("password")
    }
})

export const createUserInput = inputObjectType({
    name: "createUserInput",
    definition(t){
        t.nonNull.string("name")
        t.nonNull.string("email"),
        t.nonNull.string("password")
    }
})

export const updateUserInput = inputObjectType({
    name: "updateUserInput",
    definition(t){
        t.nullable.string("name")
        t.nullable.string("email")
        t.nullable.string("password")
    }
})

export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t){
        t.nonNull.field("user",{
            type: User
        }),
        t.nonNull.string("token")
    }
})

export const CreateUserMutation = mutationField("createUser",{
    type: nonNull(AuthPayload),
    args: {
        data: nonNull(arg({type: createUserInput}))
    },
    async resolve(_parent,args,{prisma}): Promise<any>{
        const newUser = {
            name: args.data.name,
            email: args.data.email,
            password: args.data.password
        }
        const value = await validate.ValidateUser(newUser);
        const user = await prisma.user.create({data: value})
        const token = authenticate.generateToken(user.id);
        return {
            user: user,
            token: token
        };
    }
})



export const LoginUserMutation = mutationField("userLogin",{
    type: nonNull(AuthPayload),
    args: {
        data: nonNull(arg({type: loginUserInput}))
    },
    async resolve(_parent,args,{prisma}): Promise<any>{
        const user = await prisma.user.findUnique({where: {
            email: args.data.email
        }})
        if(!user){
            throw new Error("Invalid email.")
        }
        await validate.verifyPassword(args.data.password,user.password);
        const token = authenticate.generateToken(user.id);
            return {
                user: user,
                token: token
        };
    }
})

export const FollowUser = mutationField("followUser",{
    type: nonNull(User),
    args: {
        id: nonNull(stringArg())
    },
    resolve(_parent,{id},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.user.update({where: {id: userId},data: {
            followers: {
                connect: {
                    id
                }
            }
        }})
    }
})

export const UnFollowUser = mutationField("unfollowUser",{
    type: nonNull(User),
    args: {
        id: nonNull(stringArg())
    },
    resolve(_parent,{id},{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.user.update({where: {id: userId},data: {
            followers: {
                disconnect: {
                    id
                }
            }
        }})
    }
})


export const UpdateUser = mutationField("updateUser",{
    type: nonNull(User),
    args: {
        data: nonNull(arg({type: updateUserInput}))
    },
    async resolve(_parent,{data},{prisma,request}){
        const userId = authenticate.auth(request);
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })
        if(!user){
            throw new Error("User not found.");
        }
        if(data.email){
            user.email = data.email
        }
        if(data.name){
            user.name = data.name
        }
        if(data.password){
            user.password = data.password
        }
        return prisma.user.update({
            where: {
                id: userId
            },
            data: user
        })
    }
})

export const DeleteUserMutation = mutationField("deleteUser",{
    type: nonNull(User),
    resolve(_parent,_args,{prisma,request}){
        const userId = authenticate.auth(request);
        return prisma.user.delete({
            where: {
                id: userId
            }
        })
    }
})