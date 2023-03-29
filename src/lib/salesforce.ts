import { Connection, StreamingMessage } from "jsforce";
import * as logger from "./logger";
import Subscription from "./subscription";
const requestpromise = require("request-promise");
const fs = require("fs");

const SF_API_VERSION = "56.0";

let sfConn: any = new Connection({
  version: SF_API_VERSION,
  oauth2: {
    loginUrl: process.env.SF_URL
  }
});

sfConn.bulk.pollTimeout = 60000 * 15; // 15 minute timeout for BULK API

export function getConnection(): Connection {
  return sfConn;
}

export function doLogin() {
  return new Promise(async function (resolve, reject) {
    logger.log("Login to Salesforce");
    sfConn.login(process.env.SF_USER, process.env.SF_PASS, async function (err: any, userInfo: any) {
      if (err || !userInfo) {
        reject(err);
      } else {
        let sessionData = {
          accessToken: sfConn.accessToken,
          instanceUrl: sfConn.instanceUrl,
          userId: userInfo.id
        };
        logger.log("Successfully logged into instance " + sfConn.instanceUrl);
        resolve(sessionData);
      }
    });
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
    sfConn.sobject(tableName).updateBulk(records, function (err: any, rets: any[]) {
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

export function updateBulkV2(tableName: string, records: any[]) {
  return new Promise((resolve, reject) => {
    sfConn.sobject(tableName).updateBulk(records, function (err: any, rets: any[]) {
      if (err) {
        reject(err);
      } else {
        for (var i = 0; i < rets.length; i++) {
          if (!rets[i].success) {
            if (!rets[i].id) {
              rets[i].id = records[i].Id;
            }
          }
        }
        resolve(rets);
      }
    });
  });
}

export function insertBulk(tableName: string, records: any[]) {
  return new Promise((resolve, reject) => {
    sfConn.sobject(tableName).insertBulk(records, function (err: any, rets: any[]) {
      if (err) {
        reject(err);
      } else {
        resolve(rets);
      }
    });
  });
}

export function queryBulk(soql: string) {
  return new Promise((resolve, reject) => {
    let records: any = [];
    sfConn.bulk
      .query(soql)
      .on("record", function (rec: any) {
        records.push(rec);
        if (records.length % 10000 == 0) {
          logger.log("Records retrieved so far: " + records.length);
        }
      })
      .on("end", function () {
        resolve(records);
      })
      .on("error", function (err) {
        logger.error(err);
        reject(err);
      });
  });
}

export function updateBulkCsv(tableName: string, filepath: string) {
  return new Promise((resolve, reject) => {
    const csvFileIn = fs.createReadStream(filepath);

    let returnMap: any = {};
    sfConn.bulk.load(tableName, "update", csvFileIn, function (err: any, rets: any[]) {
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
    });
  });
}

export function exportRecordsToCSV(soql: string, fileName: string) {
  return new Promise(async function (resolve, reject) {
    try {
      await sfConn.bulk.query(soql).stream().pipe(fs.createWriteStream(fileName));
      resolve(fileName);
    } catch (e) {
      reject(e);
    }
  });
}

export function getRecordsV1(soql: string) {
  return new Promise((resolve, reject) => {
    sfConn.query(soql, (err, result) => {
      if (err) {
        reject(err);
      }
      logger.log("Total in database : " + result.totalSize);
      logger.log("Total fetched : " + result.records.length);

      resolve(result.records);
    });
  });
}

export function getRecords(soql: string, maxFetch?: number) {
  return new Promise((resolve, reject) => {
    const records: any = [];

    maxFetch = maxFetch || 10000;

    const query = sfConn
      .query(soql)
      .on("record", (record: any) => {
        logger.log("Adding record to list: " + record.Id);
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
      "cache-control": "no-cache"
    }
  };

  return requestpromise(options);
}

export async function subscribe(
  topic: string,
  replayId: any,
  callback: (message: StreamingMessage) => void
): Promise<void> {
  const subscription = new Subscription(sfConn, topic, replayId, callback);
  logger.log(`Subscribing to '${topic}' topic using replayId ${replayId}`);
  let error: any = await subscription.subscribe();

  if (error === null) {
    logger.log(`Listening events from topic '${topic}'`);
    return;
  }

  // Handle generic Salesforce error
  if (typeof error === "object" && error && error.code) {
    logger.error(`Got Salesforce error. code = '${error.code}', message = '${error.message}'`);
  } else if (error.message.indexOf("400::") > -1) {
    // Handle expired replayId
    logger.error(error);
    await subscription.disconnect();
    logger.log(`Replay ID was expired, re-subscribing with -2`);
    error = await subscription.subscribe(-2);

    // Handle retry error
    if (typeof error === "object" && error !== null) {
      logger.error(`Got Salesforce error. code = '${error.code}', message = '${error.message}'`);
    }
  } else {
    logger.error(`Unknown error occurred`);
  }
}
