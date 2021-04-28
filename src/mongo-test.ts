require("dotenv").config();
import { AccountModel } from "./database/accounts/accounts.model";
import { connect, disconnect } from "./database/database";
import * as logger from "./lib/logger";

/**
 * Start MongoDB docker:
 * docker run --name test-mongo -p 27888:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=test -d mongo:latest
 *
 * Use https://nosqlbooster.com/ to see data
 *
 * Article: https://medium.com/swlh/using-typescript-with-mongodb-393caf7adfef
 */
export const dbTest: any = async () => {
	try {
		const db = connect();

		const allAccounts = await AccountModel.find({});
		if (allAccounts && allAccounts.length) {
			logger.log("Found following accounts from database:");
			logger.log(JSON.stringify(allAccounts));
		} else {
			const accountList = [
				{ accountId: "1", name: "Test one" },
				{ accountId: "2", name: "Test two" },
			];
			for (const account of accountList) {
				await AccountModel.create(account);
				logger.log(`Created account ${account.accountId} ${account.name}`);
			}
		}
		disconnect();
	} catch (ex) {
		logger.error(ex);
		throw ex;
	}
};

dbTest();
