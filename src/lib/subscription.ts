import * as jsforce from "jsforce";
import { Connection, StreamingMessage } from "jsforce";

class Subscription {
  connection: Connection;
  client: any;
  subscription: any;
  topic: string;
  replayId: number;
  callback: (message: StreamingMessage) => void;

  constructor(connection: Connection, topic: string, replayId: number, callback: (message: StreamingMessage) => void) {
    this.connection = connection;
    this.client = null;
    this.subscription = null;
    this.topic = topic;
    this.replayId = replayId;
    this.callback = callback;
  }

  subscribe(replayId: number = -3): Promise<any> {
    this.getClient(replayId);
    this.subscription = this.client.subscribe(this.topic, this.callback);

    return new Promise((resolve) => {
      this.subscription.callback(() => resolve(null));
      this.subscription.errback((error: any) => resolve(error));
    });
  }

  disconnect(): Promise<any> {
    if (this.client !== null) {
      return this.client.disconnect();
    }

    return Promise.resolve();
  }

  private getClient(replayId: number) {
    const replayExtension = new (jsforce as any).StreamingExtension.Replay(
      this.topic,
      replayId > -3 ? replayId : this.replayId
    );

    this.client = (this.connection as any).streaming.createClient([replayExtension]);
  }
}

export default Subscription;
