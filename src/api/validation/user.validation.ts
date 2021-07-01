import { User } from "@prisma/client";
import Joi, { ObjectSchema } from "joi";
import bcrypt from 'bcrypt';


type userInputType = Pick<User,"name" | "email" | "password">;

class Validation {
    private userInput : ObjectSchema<User>;
    private static instance: Validation;
    constructor(){
        this.userInput = Joi.object<User>({
            name: Joi.string()
                .min(3)
                .max(10)
                .required(),
            password: Joi.string()
                .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$")).required(),
            email: Joi.string().email().required()
        })
    }
    static getInstance(){
        if(this.instance){
            return this.instance
        }else{
            this.instance = new Validation();
            return this.instance
        }
    }
    async ValidateUser(input: userInputType) : Promise<userInputType> {
        const {error,value} = this.userInput.validate(input);
        if(error){
            throw new Error(error.message)
        }
        value.password = await bcrypt.hash(value.password,10);
        return value
    }
    async verifyPassword(password: string,hashedPassword: string) : Promise<void> {
        const isValid = await bcrypt.compare(password,hashedPassword);
        if(!isValid){
            throw new Error("Invalid password.")
        }
    }
}

export const validate = Validation.getInstance();