
import dotenv from 'dotenv';
import { APP_NAME } from '../../../Core/appConfig';
import { Db, MongoClient } from 'mongodb';

dotenv.config();

const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = process.env.DATABASE_NAME;

class MongoConnectionManager {
  private static instance: MongoConnectionManager;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionCount: number = 0;

  private constructor() {}

  public static getInstance(): MongoConnectionManager {
    if (!MongoConnectionManager.instance) {
      MongoConnectionManager.instance = new MongoConnectionManager();
    }
    return MongoConnectionManager.instance;
  }

  //this replaces Repository::initializeMongoClient() 
  public async connect(): Promise<{ client: MongoClient; db: Db }> {
    if (!this.client) {
      this.client = await MongoClient.connect(url, {
        maxPoolSize: 75, // Max connection is 80 for M0, the extra 5 is for cuttin tolerance
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
      });
      this.db = this.client.db(dbName);
      console.log(APP_NAME + " Connected to MongoDB!!!");
    }
    this.connectionCount++;
    return { client: this.client, db: this.db as Db};
  }

  public async disconnect(): Promise<void> {
    this.connectionCount--;
    if (this.connectionCount === 0 && this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("Close")
    }
  }

  public getConnectionCount(): number {
    return this.connectionCount;
  }
}


export default MongoConnectionManager;