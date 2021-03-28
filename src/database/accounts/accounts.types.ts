import { Document, Model } from "mongoose";
export interface IAccount {
  accountId: string;
  name: string;
  createdDate?: Date;
}
export interface IAccountDocument extends IAccount, Document {}
export interface IAccountModel extends Model<IAccountDocument> {
  findOneOrCreate: (
    this: IAccountModel,
    {
      accountId,
      name,
      createdDate,
    }: { accountId: string; name: string; createdDate?: Date }
  ) => Promise<IAccountDocument>;
  findByName: (
    this: IAccountModel,
    name: string
  ) => Promise<IAccountDocument[]>;
}
