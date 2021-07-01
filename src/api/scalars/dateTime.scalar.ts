import { GraphQLDate } from 'graphql-iso-date';
import { asNexusMethod } from 'nexus'

export const GQLDate = asNexusMethod(GraphQLDate, 'date')