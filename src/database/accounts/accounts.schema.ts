import { Schema } from "mongoose";
import { findOneOrCreate, findByName } from "./accounts.statics";

const AccountSchema = new Schema({
  accountId: { type: String, unique: true },
  name: String,
  createdDate: {
    type: Date,
    default: new Date(),
  },
});

AccountSchema.statics.findOneOrCreate = findOneOrCreate;
AccountSchema.statics.findByName = findByName;

export default AccountSchema;
