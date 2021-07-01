import { Request } from "express";
import * as jwt from 'jsonwebtoken';

interface jwtVerifyReturnType {
    id: string
}

class AuthClass {
    private static instance: AuthClass;
    constructor(){}

    static getInstance(){
        if(this.instance){
            return this.instance
        }else{
            this.instance = new AuthClass();
            return this.instance
        }
    }

    auth(req: Request){
        const header = req.headers.authorization;
        if(header){
            const token = header.replace('Bearer ','');
            const isValid = jwt.verify(token,process.env.JWT_SECRET!) as jwtVerifyReturnType;
            if(!isValid){
                throw new Error('Authentication Failed.')
            }
            return isValid.id
        }else{
            throw new Error('Authentication Required')
        }
    }

    optionalAuth(req: Request,required: boolean = true){
        const header = req.headers.authorization;
        if(required === false && !header){
            return null
        }else{
            return this.auth(req);
        }
    }

    generateToken(id: string){
        const token = jwt.sign({id: id},process.env.JWT_SECRET!)
        return token
    }
}

export const authenticate = AuthClass.getInstance();
