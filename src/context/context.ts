import { PrismaClient } from "@prisma/client";
import {Request} from 'express';
import { PubSub } from 'apollo-server';

export interface Context {
  prisma: PrismaClient
  request: Request
  pubsub: PubSub
}

// export const context : Context = {
//   prisma: new PrismaClient(),
// };

export function context(request : Request): Context {
    return {
        prisma: new PrismaClient(),
        request,
        pubsub: new PubSub()
    }
}
