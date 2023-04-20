const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        // check if users exist and will return an error if there no users that exist
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id }).select(
            "-__v -password"
          );
          return userData;
        }
        throw new AuthenticationError("Not logged in");
      },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
          const user = await User.findOne({ email });
          // check if user exists with email a
          if (!user) {
            throw new AuthenticationError("Incorrect credentials");
          }
          // check if password matches
          const correctPassword = await user.isCorrectPassword(password);
    
          if (!correctPassword) {
            throw new AuthenticationError("Incorrect credentials");
          }
    
          const token = signToken(user);
          return { token, user };
        },
        addUser: async (parent, args) => {
          const user = await User.create(args);
          const token = signToken(user);
    
          return { token, user };
        },
        //save book
        saveBook: async (parent, { input }, context) => {
          if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $addToSet: { savedBooks: input } },
              { new: true, runValidators: true }
            );
            return updatedUser;
          }
          throw new AuthenticationError("You need to be logged in!");
        },
        //remove book
        removeBook: async (parent, { bookId }, context) => {
          if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId: bookId } } },
              { new: true }
            );
            return updatedUser;
          }
          throw new AuthenticationError("You need to be logged in!");
        },
      },
    };
    
    module.exports = resolvers;