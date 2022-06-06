require("dotenv").config();
import { doLogin, getConnection, subscribe } from "./lib/salesforce";
import * as logger from "./lib/logger";
const jsforce = require("jsforce");

const subscribeToEvents = (topicName: string, replayId: number) => {
  subscribe(topicName, replayId, (message: any) => {
    logger.log(
      `Received event ${message.event.EventUuid} with replayId ${message.event.replayId}:\n${JSON.stringify(
        message.payload,
        null,
        2
      )}`
    );
  });
};

export const eventListener: any = async () => {
  try {
    await doLogin();

    const sfConn = getConnection();

    // Specify event name and replayId where to continue
    const eventTable = process.env.PLATFORM_EVENT || "TestEvent__e";
    const topicUrl = "/event/" + eventTable;
    const replayId = -1;

    subscribeToEvents(topicUrl, replayId);
  } catch (ex) {
    logger.error("ERROR: " + ex);
    throw ex;
  }
};

eventListener();
