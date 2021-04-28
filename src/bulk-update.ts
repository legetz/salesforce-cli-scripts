require("dotenv").config();
const fs = require("fs");
import { doLogin, updateBulk } from "./lib/salesforce";

export const bulkUpdate: any = async () => {
	// Login to Salesforce
	try {
		await doLogin();

		let records = null;
		try {
			records = JSON.parse(fs.readFileSync("./account-data.json", "utf-8"));
		} catch (ex) {
			console.log("ERROR: Failed to read data file");
			console.log(ex);
		}

		records = records.slice(0, 100);

		try {
			console.log(`Update ${records.length} records using BULK API`);
			const results = await updateBulk("Account", records);
			console.log(`Updated ${Object.keys(results).length} records`);
		} catch (ex) {
			console.log("ERROR: Failed to update records");
			console.log(ex);
		}
	} catch (ex) {
		console.log("ERROR: Failed to login Salesforce");
		throw ex;
	}
};

bulkUpdate();
