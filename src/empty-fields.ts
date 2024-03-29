require("dotenv").config();
const fs = require("fs");
import { doLogin, updateBulk } from "./lib/salesforce";
import * as logger from "./lib/logger";

export const emptyFields: any = async () => {
  // Login to Salesforce
  try {
    await doLogin();

    let records = null;
    try {
      records = JSON.parse(fs.readFileSync("cases.json", "utf-8"));
    } catch (ex) {
      logger.error("ERROR: Failed to read data file");
      throw ex;
    }

    const updateList = [];

    let index = 0;
    while (index < records.length) {
      updateList.push({
        Id: records[index],
        SuppliedEmail: null,
        SuppliedPhone: null
      });
      index++;
    }

    try {
      logger.log("Update cases - START");
      await updateBulk("case", updateList);
      logger.log("Update cases - END");
    } catch (ex) {
      logger.error("ERROR: Failed to update records");
      throw ex;
    }
  } catch (ex) {
    logger.error(ex);
  }
};

emptyFields();
