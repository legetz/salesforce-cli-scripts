require("dotenv").config();
import { AccountModel } from "./database/accounts/accounts.model";
import { connect, disconnect } from "./database/database";
import * as logger from "./logger";

export const dbTest: any = async () => {
  try {
    connect();

    const accountList = [
      { accountId: "1", name: "Test one" },
      { accountId: "2", name: "Test two" },
    ];
    for (const account of accountList) {
      await AccountModel.create(account);
      logger.log(`Created account ${account.accountId} ${account.name}`);
    }
    disconnect();
  } catch (ex) {
    logger.error(ex);
    throw ex;
  }
};

dbTest();
