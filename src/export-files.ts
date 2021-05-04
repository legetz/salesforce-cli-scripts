require("dotenv").config();
import { doLogin, getRecords, getContentVersionBody } from "./lib/salesforce";
import * as logger from "./lib/logger";
const fs = require("fs");
const util = require("util");
const path = require("path");
const converter = require("json-2-csv");

const mkdir = util.promisify(fs.mkdir);

export const mainFunc: any = async () => {
	try {
		const sfTableApiName = "Account";

		// Create folder for export
		const exportDir = path.join("export", sfTableApiName.toLowerCase(), "files", new Date().toISOString().slice(0, 10));
		if (!fs.existsSync(exportDir)) {
			await mkdir(exportDir, { recursive: true });
		}

		await doLogin();

		const soql = "SELECT Id FROM " + sfTableApiName;
		const records: any = await getRecords(soql, 1000000);

		const fileList = [];
		const fileMap = {};

		let index = 0;
		const bulkSize = 100;
		while (true) {
			const chunkList = records.slice(index, bulkSize + index);

			const idList = [];
			chunkList.forEach((element) => {
				idList.push(element.Id);
			});

			const soql = `SELECT 
					LinkedEntityId, ContentDocument.Id, ContentDocument.LatestPublishedVersionId, ContentDocument.Title, 
					ContentDocument.CreatedDate, ContentDocument.FileExtension 
				FROM 
					ContentDocumentLink 
				WHERE 
					LinkedEntityId IN ('${idList.join("','")}') AND ContentDocument.FileType != 'SNOTE'`;

			const fileRecords: any = await getRecords(soql, 100000);
			if (fileRecords && fileRecords.length) {
				fileRecords.forEach((elem) => {
					if (!fileMap[elem.LinkedEntityId]) {
						fileMap[elem.LinkedEntityId] = [];
					}

					const fileExtension = "." + elem.ContentDocument.FileExtension.toLowerCase();
					let fileTitle = elem.ContentDocument.Title;

					// Add missing file extension
					if (!fileTitle.toLowerCase().endsWith(fileExtension)) {
						fileTitle += fileExtension;
					}

					const fileData = {
						fileId: elem.ContentDocument.LatestPublishedVersionId,
						fileTitle: fileTitle
					};

					fileMap[elem.LinkedEntityId].push(fileData);

					fileList.push({
						...fileData,
						accountId: elem.LinkedEntityId,
						fileCreatedDate: elem.ContentDocument.CreatedDate.substring(0, 10)
					});
				});
			}

			index += chunkList.length;
			if (index >= records.length) {
				break;
			}
		}

		// Create CSV file out from the fileList
		if (fileList && fileList.length) {
			try {
				const csv = await converter.json2csvAsync(fileList);
				const fileName = path.join(exportDir, "filelist.csv");
				fs.writeFileSync(fileName, csv);
			} catch (err) {
				logger.error("Failed to write CSV from JSON: " + err);
			}
		}

		// Fetch file binaries
		const keyList = Object.keys(fileMap);
		for (let i = 0; i < keyList.length; i++) {
			const parentId = keyList[i];
			logger.log("Fetch file binaries for " + parentId);

			const fileExportDir = path.join(exportDir, parentId);
			if (!fs.existsSync(fileExportDir)) {
				await mkdir(fileExportDir);
			}

			const fileList = fileMap[parentId];
			for (let j = 0; j < fileList.length; j++) {
				const fileData = fileList[j];
				try {
					logger.log(`Fetching binary for ${fileData.fileId} (${fileData.fileTitle})`);
					const fileBodyBuffer = await getContentVersionBody(fileData.fileId);

					const fileWriteName = path.join(fileExportDir, fileData.fileTitle);
					let writeStream = fs.createWriteStream(fileWriteName);
					writeStream.write(fileBodyBuffer);
					writeStream.end();
				} catch (ex) {
					logger.error("ERROR: " + fileData.fileId);
					logger.error(ex);
				}
			}
		}
	} catch (ex) {
		logger.error("ERROR: Failed to export files");
		logger.error(ex);
	}
};

mainFunc();
