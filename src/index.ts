import { ApolloServer } from "apollo-server";
import { schema } from "./api/schema";
import { context } from "./context/context";

const server = new ApolloServer({
    schema,
    context: ({req}) => {
        return context(req)
    }
})

server.listen(8080,() => {
    console.log('server running on port 8080')
})