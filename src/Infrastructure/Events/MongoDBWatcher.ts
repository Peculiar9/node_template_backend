//Without MongoConnectionManager

import { MongoClient, Db, ChangeStream, Collection, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = process.env.DATABASE_NAME;

export class MongoDBWatcher {
  private client: MongoClient;
  private db: Db;
  private changeStream: ChangeStream;
 private changeCallback: (change: any) => void;

  constructor(private readonly collectionName: string) {}

  public async initialize() {
    try {
      this.client = await MongoClient.connect(url);
      this.db = this.client.db(dbName);
      this.watchCollection();
    } catch (err: any) {
      console.error('Error connecting to MongoDB:', err.message);
    }
  }

  private watchCollection() {
    const collection: Collection = this.db.collection(this.collectionName);
    this.changeStream = collection.watch();

    this.changeStream.on('change', (change: any) => {
      console.log(`Change detected in ${this.collectionName}:`, change);
      if(this.changeCallback){
        this.changeCallback(change);
      }
    });

    this.changeStream.on('error', (err: any) => {
      console.error('Change stream error:', err);
      this.restartChangeStream();
    });

    // this.changeStream.on('close', () => {
    //   console.warn('Change stream closed. Restarting...');
    //   this.restartChangeStream();
    // });
  }

  private async restartChangeStream() {
    console.log(`Restarting change stream for ${this.collectionName}...`);
    this.watchCollection();
  }
  
  public registerChangeCallback(callback : (change: any) => void) {
     this.changeCallback = callback;
  }
  public async close() {
    if (this.changeStream) {
      await this.changeStream.close();
    }
    if (this.client) {
      await this.client.close();
    }
  }
}


export interface ChangeInstance {
  _id: any;
  operationType: string;
  clusterTime: any;
  wallTime: Date;
  fullDocument: any; //TODO: Change this to generic type in due time
  ns: any; 
  documentKey: ObjectId | undefined;
}


///With MongoConnectionManager

// import { Db, ChangeStream, Collection, ObjectId } from 'mongodb';
// import dotenv from 'dotenv';
// import MongoConnectionManager from '../Repository/MongoDB/MongoConnectionManager';

// dotenv.config();

// export class MongoDBWatcher {
//   // private client: MongoClient;
//   // private db: Db;
//   private changeStream: ChangeStream;
//   private changeCallback: (change: any) => void;
//   private connectionManager: MongoConnectionManager;

//   constructor(private readonly collectionName: string) {}

//   public async initialize() {
//     try {
//       console.log("Initializing MongoDb Watcher")
//       // this.client = await MongoClient.connect(url);
//       this.connectionManager = MongoConnectionManager.getInstance();
//       const { db } = await this.connectionManager.connect();
//       this.watchCollection(db);
//     } catch (err: any) {
//       console.error('Error connecting to MongoDB from MongoDB Watcher:', err.message);
//     }
//   }

//   private watchCollection(db: Db) {
//     // const collection: Collection = this.db.collection(this.collectionName);
//     const collection: Collection = db.collection(this.collectionName);
//     this.changeStream = collection.watch();

//     this.changeStream.on('change', (change: any) => {
//       console.log(`Change detected in ${this.collectionName}:`, change);
//       if(this.changeCallback){
//         this.changeCallback(change);
//       }
//     });

//     this.changeStream.on('error', (err: any) => {
//       console.error('Change stream error:', err);
//       this.restartChangeStream(db);
//     });

//     //Uncomment if you wanna restart on close. 
//     // this.changeStream.on('close', () => {
//     //   console.warn('Change stream closed. Restarting...');
//     //   this.restartChangeStream();
//     // });
//   }

//   private async restartChangeStream(db: Db) {
//     console.log(`Restarting change stream for ${this.collectionName}...`);
//     this.watchCollection(db);
//   }
  
//   public registerChangeCallback(callback : (change: any) => void) {
//      this.changeCallback = callback;
//   }
//   public async close() {
//     if (this.changeStream) {
//       await this.changeStream.close();
//     }
//    await this.connectionManager.disconnect();
//   }
// }


// export interface ChangeInstance {
//   _id: any;
//   operationType: string;
//   clusterTime: any;
//   wallTime: Date;
//   fullDocument: any; //TODO: Change this to generic type in due time
//   ns: any; 
//   documentKey: ObjectId | undefined;
// }