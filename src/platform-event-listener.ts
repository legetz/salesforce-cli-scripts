require("dotenv").config();
import { doLogin, getConnection } from "./lib/salesforce";
import * as logger from "./lib/logger";

export const eventListener: any = async () => {
	// Login to Salesforce
	try {
		await doLogin();

		const sfConn = getConnection();

		const eventTable = process.env.PLATFORM_EVENT || "TestEvent__e";
		const topicUrl = "/event/" + eventTable;

		logger.log(`Listening platform events for ${topicUrl}`);
		sfConn.streaming.topic(topicUrl).subscribe((message) => {
			logger.log(message);
		});
	} catch (ex) {
		console.log("ERROR: Failed to login Salesforce");
		throw ex;
	}
};

eventListener();
