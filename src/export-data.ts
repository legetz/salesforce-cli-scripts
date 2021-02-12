require("dotenv").config();
const fs = require("fs");
import { doLogin, exportRecordsToCSV } from "./salesforce";

export const exportData: any = async () => {
	// Login to Salesforce
	try {
		console.log("Login to Salesforce");
		const session: any = await doLogin();
		console.log("Successfully logged into instance " + session.instanceUrl);

		try {
			const soql = "SELECT Id, Name FROM Account";
			await exportRecordsToCSV(soql, "accounts.csv");
		} catch (ex) {
			console.log("ERROR: Failed to get data");
			console.log(ex);
		}
	} catch (ex) {
		console.log("ERROR: Failed to login Salesforce");
		throw ex;
	}
};

exportData();
