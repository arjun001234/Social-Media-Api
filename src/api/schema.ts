import { makeSchema } from "nexus";
import { nexusPrisma } from "nexus-plugin-prisma";
import { join } from "path";
import * as types from './graphql/index';

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, "..", "./api/generatedSchema/nexus-typegen.ts"),
    schema: join(__dirname, "..", "./api/generatedSchema/schema.graphql"),
  },
  contextType: {
    module: join(__dirname,"../context/context.ts"),
    export: "Context"
  },
  plugins: [nexusPrisma({
    experimentalCRUD: true,
    paginationStrategy: "prisma"
  })]
});
 