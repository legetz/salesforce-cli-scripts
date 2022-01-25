require("dotenv").config();
import { doLogin, getConnection } from "./lib/salesforce";

export const eventListener: any = async () => {
	// Login to Salesforce
	try {
		await doLogin();

		const eventTable = process.env.PLATFORM_EVENT || "TestEvent__e";

		const sfConn = getConnection();
		sfConn.streaming.topic("/event/" + eventTable).subscribe((message) => {
			console.dir(message);
		});
	} catch (ex) {
		console.log("ERROR: Failed to login Salesforce");
		throw ex;
	}
};

eventListener();
