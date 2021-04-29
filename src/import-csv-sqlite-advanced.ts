require("dotenv").config();
import * as logger from "./lib/logger";
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 * Import Account CSV file into SQLite database new table.
 * Also add Status field and populate that with "draft" value.
 *
 * Use export-data-csv script first to generate accounts.csv and remember to remove header row
 * Header row needs to be deleted since we load records into existing table
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

		logger.log(`Dropping table ${tableName}`);
		await exec(`sqlite3 ${dbPath} "DROP TABLE IF EXISTS ${tableName}"`);

		const tableCreate = `CREATE TABLE ${tableName} (
            "Id" VARCHAR(18) PRIMARY KEY,
            "Name" VARCHAR(255) NOT NULL
            )`;

		logger.log(`Creating table ${tableName}`);
		await exec(`sqlite3 ${dbPath} "${tableCreate}"`);

		const command = `sqlite3 ${dbPath} ".mode csv" ".import ${csvPath} ${tableName}"`;
		logger.log(`Inserting ${csvPath} into ${tableName}`);
		await exec(command);

		logger.log(`Add Status field to table ${tableName}`);
		await exec(
			`sqlite3 ${dbPath} "ALTER TABLE ${tableName} ADD Status TEXT" "UPDATE ${tableName} SET Status='draft'"`
		);

		const { stdout } = await exec(
			`sqlite3 ${dbPath} "SELECT COUNT(*) FROM ${tableName} WHERE Status='draft'"`
		);
		logger.log(
			`${tableName} now contains ${stdout.trim()} records having Status=draft`
		);

		logger.log(
			`Run command to see table schema: sqlite3 ${dbPath} ".schema ${tableName}"`
		);
	} catch (ex) {
		logger.error(ex);
	}
};

mainFunc();
