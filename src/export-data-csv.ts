require("dotenv").config();
import * as logger from "./lib/logger";
import { doLogin, exportRecordsToCSV } from "./lib/salesforce";
const fs = require("fs");
const path = require("path");
const util = require("util");
const mkdir = util.promisify(fs.mkdir);

/**
 * Export Salesforce SOQL response into CSV file
 */
export const mainFunc: any = async () => {
	try {
		const sfTableApiName = "Account";

		// Create folder for export
		const exportDir = path.join(
			"export",
			sfTableApiName.toLowerCase(),
			new Date().toISOString().slice(0, 10)
		);
		if (!fs.existsSync(exportDir)) {
			await mkdir(exportDir, { recursive: true });
		}

		await doLogin();

		const soql = "SELECT Id, Name FROM " + sfTableApiName;
		const csvFileName = path.join(exportDir, sfTableApiName.toLowerCase() + '.csv');
		
		await exportRecordsToCSV(soql, csvFileName);
	} catch (ex) {
		logger.error("ERROR happened during data export:");
		logger.error(ex);
	}
};

mainFunc();
