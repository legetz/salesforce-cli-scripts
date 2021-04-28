require("dotenv").config();
import * as logger from "./logger";
import { doLogin, exportRecordsToCSV } from "./salesforce";

/**
 * Export Salesforce SOQL response into CSV file
 */
export const mainFunc: any = async () => {
	try {
		await doLogin();
		/*
		const soql = "SELECT Id, Name FROM Account";
		const csvFileName = "accounts.csv";
		*/

		const soql = "SELECT Id, Name, Card_holder__c, Card_Type__c, YKNO_BA__c, Card_holder__r.PersonContactId FROM Baltic_Card__c WHERE Is_Active__c=TRUE AND MaxxingCard__c=NULL AND Card_holder__c!=NULL AND Card_holder__r.Loyalty_card_number__pc!=NULL LIMIT 1000";
		const csvFileName = "baltic-cards.csv";

		await exportRecordsToCSV(soql, csvFileName);
	} catch (ex) {
		logger.error("ERROR happened during data export:");
		logger.error(ex);
	}
};

mainFunc();
