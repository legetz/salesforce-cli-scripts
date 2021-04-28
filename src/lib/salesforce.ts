import { Connection } from "jsforce";
import * as logger from "./logger";
const requestpromise = require("request-promise");
const fs = require("fs");

const SF_API_VERSION = "50.0";
const EXPORT_FOLDER = "./export";

let sfConn: any = new Connection({
	version: SF_API_VERSION,
	oauth2: {
		loginUrl: process.env.SF_URL,
	},
});

sfConn.bulk.pollTimeout = 60000 * 15; // 15 minute timeout for BULK API

if (!fs.existsSync(EXPORT_FOLDER)) {
	fs.mkdirSync(EXPORT_FOLDER);
}

export function doLogin() {
	return new Promise(async function (resolve, reject) {
		logger.log("Login to Salesforce");
		sfConn.login(
			process.env.SF_USER,
			process.env.SF_PASS,
			async function (err: any, userInfo: any) {
				if (err || !userInfo) {
					reject(err);
				} else {
					let sessionData = {
						accessToken: sfConn.accessToken,
						instanceUrl: sfConn.instanceUrl,
						userId: userInfo.id,
					};
					logger.log("Successfully logged into instance " + sfConn.instanceUrl);
					resolve(sessionData);
				}
			}
		);
	});
}

export function checkBulkJob(jobId: string) {
	return new Promise(async function (resolve, reject) {
		try {
			const job: any = await sfConn.bulk.job(jobId).check();
			resolve(job);
		} catch (err) {
			reject(err);
		}
	});
}

export function abortBulkJob(jobId: string) {
	return new Promise(async function (resolve, reject) {
		try {
			const job: any = await sfConn.bulk.job(jobId).abort();
			resolve(job);
		} catch (err) {
			reject(err);
		}
	});
}

export function update(tableName: string, record: any) {
	return new Promise((resolve, reject) => {
		sfConn.sobject(tableName).update(record, function (err: any, ret: any) {
			if (err || !ret.success) {
				reject(err);
			} else {
				resolve(ret.id);
			}
		});
	});
}

export function updateBulk(tableName: string, records: any[]) {
	return new Promise((resolve, reject) => {
		let returnMap: any = {};
		sfConn
			.sobject(tableName)
			.updateBulk(records, function (err: any, rets: any[]) {
				if (err) {
					reject(err);
				} else {
					for (var i = 0; i < rets.length; i++) {
						if (rets[i].success) {
							//logger.log("Updated " + rets[i].id)
							returnMap[rets[i].id] = rets[i].success;
						} else {
							if (!rets[i].id) {
								rets[i].id = records[i].Id;
							}
							logger.log(`ERROR, Line ${i}: ${JSON.stringify(rets[i])}`);
						}
					}
					resolve(returnMap);
				}
			});
	});
}

export function updateBulkCsv(tableName: string, filepath: string) {
	return new Promise((resolve, reject) => {
		const csvFileIn = fs.createReadStream(filepath);

		let returnMap: any = {};
		sfConn.bulk.load(
			tableName,
			"update",
			csvFileIn,
			function (err: any, rets: any[]) {
				if (err) {
					reject(err);
				} else {
					for (var i = 0; i < rets.length; i++) {
						if (rets[i].success) {
							//logger.log("Upsert " + rets[i].id)
							returnMap[rets[i].id] = rets[i].success;
						} else {
							logger.log(`ERROR, Line ${i}: ${JSON.stringify(rets[i])}`);
						}
					}
					resolve(returnMap);
				}
			}
		);
	});
}

export function getCases() {
	return new Promise(async function (resolve, reject) {
		const records: any = [];

		try {
			await sfConn.bulk
				.query("SELECT Id FROM Case")
				.stream()
				.pipe(fs.createWriteStream(EXPORT_FOLDER + "/cases.csv"));
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}

export function exportRecordsToCSV(soql: string, fileName: string) {
	return new Promise(async function (resolve, reject) {
		const records: any = [];

		const fName = EXPORT_FOLDER + "/" + fileName;

		try {
			await sfConn.bulk.query(soql).stream().pipe(fs.createWriteStream(fName));
			resolve(fName);
		} catch (e) {
			reject(e);
		}
	});
}

export function getRecords(soql: string, maxFetch?: number) {
	return new Promise((resolve, reject) => {
		const records: any = [];

		maxFetch = maxFetch || 10000;

		const query = sfConn
			.query(soql)
			.on("record", (record: any) => {
				records.push(record);
			})
			.on("end", () => {
				/*
                logger.log("Total in database : " + query.totalSize);
                logger.log("Total fetched : " + query.totalFetched);
                */
				resolve(records);
			})
			.on("error", (err: any) => {
				reject(err);
			})
			.run({ autoFetch: true, maxFetch: maxFetch });
	});
}

export function getContentVersionBody(documentId) {
	const options = {
		method: "GET",
		uri:
			sfConn.instanceUrl +
			"/services/data/v" +
			SF_API_VERSION +
			"/sobjects/ContentVersion/" +
			documentId +
			"/VersionData",
		encoding: null,
		headers: {
			authorization: "Bearer " + sfConn.accessToken,
			"cache-control": "no-cache",
		},
	};

	return requestpromise(options);
}
