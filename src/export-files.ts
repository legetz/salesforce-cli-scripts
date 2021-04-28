require("dotenv").config();
import { doLogin, getRecords, getContentVersionBody } from "./lib/salesforce";
import * as logger from "./lib/logger";
const fs = require("fs");
const util = require("util");
const path = require("path");
const converter = require("json-2-csv");

const mkdir = util.promisify(fs.mkdir);

export const exportData: any = async () => {
  // Login to Salesforce
  try {
    logger.log("Login to Salesforce");
    const session: any = await doLogin();
    logger.log("Successfully logged into instance " + session.instanceUrl);

    try {
      const fileMap = {};
      const soql = "SELECT Id FROM Case LIMIT 50";
      const records: any = await getRecords(soql);
      const fileList = [];
      for (let i = 0; i < records.length; i++) {
        const element = records[i];
        const fileRecords: any = await getRecords(
          `SELECT ContentDocument.Id, ContentDocument.LatestPublishedVersionId, ContentDocument.Title, ContentDocument.CreatedDate, ContentDocument.FileExtension FROM ContentDocumentLink WHERE LinkedEntityId = '${element.Id}' AND ContentDocument.FileExtension IN ('pdf','docx')`
        );
        if (fileRecords) {
          fileMap[element.Id] = [];
          fileRecords.forEach((elem) => {
            fileMap[element.Id].push({
              contentVersionId: elem.ContentDocument.LatestPublishedVersionId,
              title:
                elem.ContentDocument.Title +
                "." +
                elem.ContentDocument.FileExtension,
              createdDate: elem.ContentDocument.CreatedDate.substring(0, 10),
            });

            fileList.push({
              recordId: element.Id,
              fileId: elem.ContentDocument.LatestPublishedVersionId,
              fileTitle:
                elem.ContentDocument.Title +
                "." +
                elem.ContentDocument.FileExtension,
              fileCreatedDate: elem.ContentDocument.CreatedDate.substring(
                0,
                10
              ),
            });
          });
        }
      }

      // Create CSV file out from the fileList
      try {
        const csv = await converter.json2csvAsync(fileList);
        fs.writeFileSync("export/case.csv", csv);
      } catch (err) {
        logger.log("Failed to write CSV from JSON: " + err);
      }

      const keyList = Object.keys(fileMap);
      for (let i = 0; i < keyList.length; i++) {
        const recordId = keyList[i];
        logger.log("Fetch file binaries for case " + recordId);

        const contractDir = path.join("export", recordId);
        if (!fs.existsSync(contractDir)) {
          await mkdir(contractDir);
        }

        const fileList = fileMap[recordId];
        for (let j = 0; j < fileList.length; j++) {
          const fileData = fileList[j];
          try {
            logger.log(
              `Fetching binary for ${fileData.contentVersionId} (${fileData.title})`
            );
            const fileBodyBuffer = await getContentVersionBody(
              fileData.contentVersionId
            );

            const fileWriteName = path.join("export", recordId, fileData.title);
            let writeStream = fs.createWriteStream(fileWriteName);
            writeStream.write(fileBodyBuffer);
            writeStream.end();
          } catch (ex) {
            logger.error("ERROR: " + fileData.contentVersionId);
            logger.error(ex);
          }
        }
      }
    } catch (ex) {
      logger.error("ERROR: Failed to get data");
      logger.error(ex);
    }
  } catch (ex) {
    logger.error("ERROR: Failed to login Salesforce");
    logger.error(ex);
  }
};

exportData();
