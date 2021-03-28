import * as Mongoose from "mongoose";
import { AccountModel } from "./accounts/accounts.model";
let database: Mongoose.Connection;
export const connect = () => {
  // add your own uri below
  const uri = "mongodb://admin:test@localhost:27888/?authSource=admin";
  if (database) {
    return;
  }
  Mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  database = Mongoose.connection;
  database.once("open", async () => {
    console.log("Connected to database");
  });
  database.on("error", () => {
    console.log("Error connecting to database");
  });
};
export const disconnect = () => {
  if (!database) {
    return;
  }
  Mongoose.disconnect();
};
