require("dotenv").config();
import { doLogin, getConnection, subscribe } from "./lib/salesforce";
import * as logger from "./lib/logger";
const jsforce = require("jsforce");

const subscriptionConfig = {}

const subscribeToEvents = async (topicName: string, replayId: number) => {
  const subscription = await subscribe(topicName, replayId, (message: any) => {
    logger.log(
      `Received event ${message.event.EventUuid} with replayId ${message.event.replayId}:\n${JSON.stringify(
        message.payload,
        null,
        2
      )}`
    );
  });

  subscriptionConfig['conn'] = subscription;
};

// Disconnect from platform events in case of SIGINT
const handleTermination = async () => {
  console.log('---');
  if(subscriptionConfig['conn']) {
    console.log('Disconnecting platform event subscription');
    await subscriptionConfig['conn'].disconnect();
  }
}

export const eventListener: any = async () => {
  process.on('SIGTERM', () => {
    handleTermination().finally(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    handleTermination().finally(() => process.exit(0));
  });

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
