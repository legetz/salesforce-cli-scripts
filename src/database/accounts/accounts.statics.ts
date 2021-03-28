import { IAccountDocument, IAccountModel } from "./accounts.types";
export async function findOneOrCreate(
  this: IAccountModel,
  accountId: string
): Promise<IAccountDocument> {
  const record = await this.findOne({ accountId });
  if (record) {
    return record;
  } else {
    return this.create({ accountId });
  }
}
export async function findByName(
  this: IAccountModel,
  name: string
): Promise<IAccountDocument[]> {
  return this.find({ name: name });
}
