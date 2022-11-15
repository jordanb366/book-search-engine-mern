const express = require("express");
// ApolloServer
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
// Middleware for auth.
const { authMiddleware } = require("./utils/auth");
// Schemas
const { typeDefs, resolvers } = require("./schemas");
// db configuration
const db = require("./config/connection");
// Express app variable
const app = express();
// PORT using localhost or env variables
const PORT = process.env.PORT || 3001;
// Apollo server with typeDefs, resolvers, context for auth.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}
// Servers up client on route "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Starts the Apollo server with the GraphQL schema (typeDefs, resolvers)
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);
