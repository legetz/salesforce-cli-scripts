import { Connection } from "jsforce";
const requestpromise = require('request-promise')

const SF_API_VERSION = "49.0";

let sfConn: any = new Connection({
	version: SF_API_VERSION,
	oauth2: {
		loginUrl: process.env.SF_URL,
	},
});

sfConn.bulk.pollTimeout = 60000 * 15; // 15 minute timeout for BULK API

export function doLogin() {
	return new Promise(async function (resolve, reject) {
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
							//console.log("Upsert " + rets[i].id)
							returnMap[rets[i].id] = rets[i].success;
						} else {
							if (!rets[i].id) {
								rets[i].id = records[i].Id;
							}
							console.log(`ERROR, Line ${i}: ${JSON.stringify(rets[i])}`);
						}
					}
					resolve(returnMap);
				}
			});
	});
}

export function updateBulkCsv(tableName: string, filepath: string) {
	return new Promise((resolve, reject) => {
		const csvFileIn = require("fs").createReadStream(filepath);

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
							//console.log("Upsert " + rets[i].id)
							returnMap[rets[i].id] = rets[i].success;
						} else {
							console.log(`ERROR, Line ${i}: ${JSON.stringify(rets[i])}`);
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

		const fs = require("fs");
		try {
			await sfConn.bulk
				.query("SELECT Id FROM Case")
				.stream()
				.pipe(fs.createWriteStream("./export/cases.csv"));
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}

export function exportRecordsToCSV(soql: string, fileName: string) {
	return new Promise(async function (resolve, reject) {
		const records: any = [];

		const fName = "./export/" + fileName;

		const fs = require("fs");
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
                console.log("Total in database : " + query.totalSize);
                console.log("Total fetched : " + query.totalFetched);
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
		"method": "GET",
		"uri": sfConn.instanceUrl + "/services/data/v" + SF_API_VERSION + "/sobjects/ContentVersion/" + documentId + "/VersionData",
		"encoding" : null,
		"headers": {
			"authorization": "Bearer " + sfConn.accessToken,
			"cache-control": "no-cache"
		}
	}

	return requestpromise(options);
}