require("dotenv").config();
const fs = require("fs");
import { doLogin, updateBulk } from "./salesforce";

export const emptyFields: any = async () => {
	// Login to Salesforce
	try {
		console.log("Login to Salesforce");
		const session: any = await doLogin();
		console.log("Successfully logged into instance " + session.instanceUrl);

		let records = null;
		try {
			records = JSON.parse(fs.readFileSync("cases.json", "utf-8"));
		} catch (ex) {
			console.log("ERROR: Failed to read data file");
			console.log(ex);
		}

		const updateList = [];

		let index = 0;
		while (index < records.length) {
			updateList.push({
				Id: records[index],
				SuppliedEmail: null,
				SuppliedPhone: null,
			});
			index++;
		}

		try {
			console.log("Update cases - START");
			await updateBulk("case", updateList);
			console.log("Update cases - END");
		} catch (ex) {
			console.log("ERROR: Failed to fetch records");
			console.log(ex);
		}
	} catch (ex) {
		console.log("ERROR: Failed to login Salesforce");
		throw ex;
	}
};

emptyFields();
