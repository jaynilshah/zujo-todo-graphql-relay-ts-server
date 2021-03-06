"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_relay_1 = require("graphql-relay");
const global_defination_1 = require("../global.defination");
const GraphQLImage = new graphql_1.GraphQLObjectType({
    name: 'Image',
    fields: () => ({
        id: graphql_relay_1.globalIdField('Image'),
        type: { type: graphql_1.GraphQLString },
        path: { type: graphql_1.GraphQLString },
    }),
    interfaces: [global_defination_1.nodeInterface],
});
exports.GraphQLImage = GraphQLImage;
const UploadType = new graphql_1.GraphQLScalarType({
    name: 'UploadImage',
    description: 'The `Upload` scalar type represents a file upload.',
    parseValue: value => value,
    parseLiteral() {
        throw new Error('‘Upload’ scalar literal unsupported.');
    },
    serialize() {
        throw new Error('‘Upload’ scalar serialization unsupported.');
    }
});
exports.UploadType = UploadType;
const { connectionType: TodosConnection, edgeType: GraphQLImageEdge, } = graphql_relay_1.connectionDefinitions({ nodeType: GraphQLImage });
exports.TodosConnection = TodosConnection;
exports.GraphQLImageEdge = GraphQLImageEdge;
//# sourceMappingURL=image.typedef.js.map