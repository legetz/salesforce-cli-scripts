import { model } from "mongoose";
import { IAccountDocument } from "./accounts.types";
import AccountSchema from "./accounts.schema";
export const AccountModel = model<IAccountDocument>("account", AccountSchema);
