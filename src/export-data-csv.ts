require("dotenv").config();
import * as logger from "./lib/logger";
import { doLogin, exportRecordsToCSV } from "./lib/salesforce";

/**
 * Export Salesforce SOQL response into CSV file
 */
export const mainFunc: any = async () => {
	try {
		await doLogin();

		const soql = "SELECT Id, Name FROM Account";
		const csvFileName = "accounts.csv";
		
		await exportRecordsToCSV(soql, csvFileName);
	} catch (ex) {
		logger.error("ERROR happened during data export:");
		logger.error(ex);
	}
};

mainFunc();
