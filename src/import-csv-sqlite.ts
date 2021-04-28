require("dotenv").config();
import * as logger from "./logger";
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 * Import CSV file into SQLite database
 */
export const mainFunc: any = async () => {
	const dbFolder = "./db";
	const dbPath = dbFolder + "/default.db";
	const csvPath = "./export/accounts.csv";
	const tableName = "account";

	try {
		if (!fs.existsSync(dbFolder)) {
			fs.mkdirSync(dbFolder);
		}

		logger.log(`Dropping table ${tableName} at ${dbPath}`);
		await exec(`sqlite3 ${dbPath} "DROP TABLE IF EXISTS ${tableName}"`);

		const command = `sqlite3 ${dbPath} ".mode csv" ".import ${csvPath} ${tableName}"`;
		logger.log(`Inserting ${csvPath} into ${dbPath} as ${tableName}`);
		await exec(command);

		logger.log(
			`Run command to see table record count: sqlite3 ${dbPath} "SELECT COUNT(*) FROM ${tableName}"`
		);
	} catch (ex) {
		logger.error(ex);
	}
};

mainFunc();
