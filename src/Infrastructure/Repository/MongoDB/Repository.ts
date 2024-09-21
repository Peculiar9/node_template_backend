import { Collection, Document,  ObjectId, PushOperator } from 'mongodb';
import { IRepository } from '../../../Core/Interfaces/Repository/IRepository';
import { APP_NAME } from '../../../Core/appConfig';
import UtilityService from './../../../Services/UtilityService';
import MongoConnectionManager from './MongoConnectionManager';

// dotenv.config();
// const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
// const dbName = process.env.DATABASE_NAME;

// export const initializeMongoClient = async () => {
//   const client = await MongoClient.connect(url);
//   const db = await client.db(dbName);
//   return { client, db };
// }


//TODO: Sanitize these inputs that comes here to prevent NoSQL injections and XSS attacks
// Use sanitize library or the UtilityService method that handles input sanitization
export class Repository<T> implements IRepository<T> {
  private collection: Collection;
  // private client: MongoClient;
  private connectionManager: MongoConnectionManager;

  constructor(private readonly collectionName: string) {
    this.connectionManager = MongoConnectionManager.getInstance();
    this.initializeClient().then(() => {
      console.log(APP_NAME + " Connected to MongoDB!!!");
    }).catch((err: any) => { console.error; console.log("Initialize Connection -> error: ", err.message) });
  }

  private async initializeClient() {
    const { db } = await this.connectionManager.connect();
    this.collection = db.collection(this.collectionName);
  } 

  private async ensureCollection() {
    if (!this.collection) {
      await this.initializeClient()
    }
  }
  
  public async closeConnection(): Promise<void> {
    await this.connectionManager.disconnect();
  }

  public getConnectionCount(): number {
    return this.connectionManager.getConnectionCount();
  }

 
  async createIndexIfNotExists(indexSpec: any): Promise<void> {
    await this.ensureCollection();
    const indexExists = await this.collection.indexExists(indexSpec);
    console.log({ indexExists });
    if (!indexExists) {
      await this.collection.createIndex(indexSpec);
      console.log("Created index on ${this.collectionName}: ", indexSpec.key);
    }
    else {
      console.log("Index already exists on ${this.collectionName}: ", indexSpec.key);
    }
  }

  async getById(id: string): Promise<T | null | undefined> {
    try {
      await this.ensureCollection();
      const result = await this.collection.findOne({ _id: new ObjectId(id) });
      return result as T | any;
    } catch (err: any) {
      console.log('Repository::getById() -> error: ', err.message);
    }
  }

  //recommended for complex findbyId scenarios
  async findById(id: string, projection?: Partial<Record<keyof T, 1 | 0>>): Promise<T | null> {
    try {
      await this.ensureCollection();
      const result = await this.collection.findOne(
        { _id: new ObjectId(id) },
        { projection: projection }
      );
      return result as T | null;
    } catch (error) {
      console.error(`Error in findById: ${error}`);
      return null;
    }
  }

  //use this for predicate based finds
  async find(filter: any): Promise<T | null | undefined> {
    try {
      await this.ensureCollection();
      const result = await this.collection.findOne(filter);
      return result as T | any;
    } catch (err: any) {
      console.log('Repository::getById() -> error: ', err.message);
    }
  }

  async getAll(): Promise<T[] | null | undefined> {
    try {
      await this.ensureCollection();
      const result = await this.collection.find().toArray();
      return (result as T[]) ?? [];
    } catch (err: any) {
      console.log('Repository::getAll() -> error: ', err.message);
    }
  }

  async findByPrefix(fieldName: string, prefix: string): Promise<T[] | null | undefined> {
    try {
      await this.ensureCollection();
      const results = await this.collection.find({ [fieldName]: { $regex: `^${prefix}`, $options: 'i' } })
      .sort({_id: -1})
      .limit(1)
      .toArray();
      return results as T[];
    } catch (err: any) {
      console.log('Repository::findByPrefix -> error: ', err.message);
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      await this.ensureCollection();
      const result = await this.collection.insertOne(data as any);
      return { ...data, _id: result.insertedId } as T;
    } catch (err: any) {
      console.log('Repository::create() -> error: ', err.message);
      throw err;
    }
  }

  async getByPredicate(predicate: Partial<T>): Promise<T[] | null | undefined> {
    try {
      await this.ensureCollection();
      const results = await this.collection.find(predicate).toArray();
      return results as T[];
    } catch (err: any) {
      console.log('Repository::getByPredicate -> error: ', err.message);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null | undefined> {
    try {
      await this.ensureCollection();
      (data as any).updated_at = UtilityService.formatDateToISOFormat(new Date());
      await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' }
      );
      return await this.getById(id);
    } catch (err: any) {
      console.log('Repository::update() -> error: ', err.message);
    }
  }
  async updateAsync(filter: Partial<T>, data: Partial<T>): Promise<T | null | undefined> {
    try {
      await this.ensureCollection();
      (data as any).updated_at = UtilityService.formatDateToISOFormat(new Date());
      const result = await this.collection.findOneAndUpdate(
        filter,
        { $set: data },
        { returnDocument: 'after' }
      );
      return result as T;
      // return await this.getById(id);
    } catch (err: any) {
      console.log('Repository::update() -> error: ', err.message);
    }
  }
  
   /**
   * This method is used to update array fields in an entity that possess objects that have ids.
   * But in this case, it is optimized for string values. But it can also have other value types pushed
   * It might have a usecase in the future
   */
  async pushToArrayField(id: string, arrayFieldName: string, data: any) {
    try {
      await this.ensureCollection();
      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $push: { [arrayFieldName]: data } as PushOperator<Document> },
        { 
          returnDocument: 'after',
          projection: { [arrayFieldName]: 1 }  // Only return the updated array field
        }
      );

      return result as T;
    }
    catch(err: any) {
      console.log("Repository::pushToArrayField() -> error: ", err.message);
    }
  }

   /**
   * This method is used to update array fields in an entity that possess objects that have ids.
   * it's similar to Repository::pushToArrayField() but this pushes in batch instead as opposed on element at a time
   * But in this case, it is optimized for string values. But it can also have other value types pushed
   */
  async batchPushToArrayField(id: string, arrayFieldName: string, dataArray: any[]) {
    try {
      await this.ensureCollection();
      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $push: { [arrayFieldName]: { $each: dataArray } } as PushOperator<Document> },
        {
          returnDocument: 'after',
          projection: { [arrayFieldName]: 1 }  // Only return the updated array field
        }
      );

      return result as T;
    } catch (err: any) {
      console.log("Repository::batchPushToArrayField() -> error: ", err.message);
      throw err; // Re-throw the error for proper error handling
    }
  }

  /**
 * Removes elements from an array field in a document.
 * 
 * @param {string} id - The ID of the document to update.
 * @param {string} arrayFieldName - The name of the array field to modify.
 * @param {RemoveOptions} options - Options specifying how to remove elements.
 * 
 * Use cases:
 * 1. Remove by value:
 *    await repository.removeFromArrayField("60d...f", "image_url", { type: 'value', value: "https://example.com/image.jpg" });
 * 2. Remove by property:
 *    await repository.removeFromArrayField("60d...f", "car_reviews", { type: 'property', propertyName: 'id', propertyValue: "123" });
 * 3. Remove by index:
 *    await repository.removeFromArrayField("60d...f", "car_features", { type: 'index', index: 2 });
 * 
 * This method is optimized for removing multiple values from string arrays (e.g., image_url),
 * but it can also handle other types of array elements.
 */
  async removeFromArrayField(id: string, arrayFieldName: string, options: RemoveOptions) {
    try {
      await this.ensureCollection();
      let updateQuery: any = {};
      let result: T | null = null;
  
      if (options.type === 'value') {
        // Remove by value (optimized for multiple string values)
        updateQuery.$pull = {
          [arrayFieldName]: Array.isArray(options.value)
            ? { $in: options.value }
            : options.value
        };
      } else if (options.type === 'property') {
        // Remove by object property
        updateQuery.$pull = {
          [arrayFieldName]: { [options.propertyName as string]: options.propertyValue }
        };
      } else if (options.type === 'index') {
        // Remove by index (two-step process)
        const elementToUnset = `${arrayFieldName}.${options.index}`;
        await this.collection.updateOne(
          { _id: new ObjectId(id) },
          { $unset: { [elementToUnset]: 1 } }
        );
        // Clean up the null values left behind by $unset
        result = await this.collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $pull: { [arrayFieldName]: null } as any},
          { returnDocument: 'after' }
        ) as any;
        return result as T;
      }
  
      // Perform the update and return the modified document
      result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        updateQuery,
        { returnDocument: 'after' }
      ) as any;
  
      return result;
    } catch (err: any) {
      console.error("Repository::removeFromArrayField() -> error: ", err.message);
      throw err; // Re-throw for proper error handling
    }
  }


  // private buildPullCondition(criteria: RemovalCriteria, arrayFieldName: string): any {
  //   switch (criteria.type) {
  //     case 'index':
  //       return { $position: criteria.value };
  //     case 'id':
  //       return { _id: new ObjectId(criteria.value) };
  //     case 'value':
  //       return criteria.value;
  //     default:
  //       throw new Error('Invalid removal criteria type');
  //   }
  // }

  
   /**
   * This method is used to check array based object fields in the database.
   * to see if the already have elements and if they do returns the number of elements
   */
  async checkArrayField(id: string, arrayFieldName: string, checkEmpty: boolean = false): Promise<number | boolean> {
    try {
      await this.ensureCollection();
      
      const pipeline = [
        { $match: { _id: new ObjectId(id) } },
        { $project: {
            [arrayFieldName]: 1,
            arraySize: { $size: `$${arrayFieldName}` },
            isEmpty: { $eq: [{ $size: `$${arrayFieldName}` }, 0] }
          }
        }
      ];
  
      const result = await this.collection.aggregate(pipeline).toArray();
  
      if (result.length === 0) {
        throw new Error('Document not found');
      }
  
      if (checkEmpty) {
        return result[0].isEmpty;
      } else {
        return result[0].arraySize;
      }
    } catch (err: any) {
      console.error(`Repository::checkArrayField() -> error: ${err.message}`);
      throw err;
    }
  }
  

    /**
   * This method is used to update array fields in an entity that possess objects that have ids.
   * @property {string} id - The id of the entity.
   * @property {number} arrayFieldName - The field of that entity that needs to be updated and is also an array.
   * @property {number} arrayElementId - The id of that object in the array of the field of the entity that needs to be appended to the array.
   * @property {number} data - The data that is being appended.
   * worthy of note is that this was primarily built for trips of a vehicle it had ids prior. For catching a version of that trip in the present time to that vehicle
   * It might have a usecase in the future
   */
  async updateArrayElementField(id: string, arrayFieldName: string, arrayElementId: string, data: Partial<T>): Promise<boolean> {
    try {
      await this.ensureCollection();
      // Define the query to match the document and the specific array element
      const query = {
        _id: new ObjectId(id),
        [`${arrayFieldName}.trip_id`]: new ObjectId(arrayElementId)
      };
      // Define the update using the positional $ operator
      const update = {
        $set: {
          [`${arrayFieldName}.$`]: data
        }
      };
      const updateResult = await this.collection.updateOne(query, update);
      return updateResult.modifiedCount === 1;
    } catch (err: any) {
      console.log(`Repository::updateArrayField() -> error: ${err.message}`);
      return false;
    }
  }


    /**
   * This method is used to update array fields in an entity that possess objects that have Ids.
   * @property {string} id - The id of the entity.
   * @property {number} arrayFieldName - The field of that entity that needs to be updated and is also an array.
   * @property {number} arrayElementIdValue - The value of that field in the entity that needs to be appended to the array.
   */
  async updateArrayElementObject<T, K extends keyof T>(
    id: string,
    arrayFieldName: K,
    arrayElementIdField: keyof T[K] extends (infer U)[] ? keyof U : never,
    arrayElementIdValue: any,
    data: Partial<T[K] extends (infer U)[] ? U : never>
  ): Promise<boolean> {
    try {
      await this.ensureCollection();
  
      // Define the query to match the document and the specific array element
      const query = {
        _id: new ObjectId(id),
        [`${String(arrayFieldName)}.${String(arrayElementIdField)}`]: arrayElementIdValue
      };
  
      // Define the update using the positional $ operator
      const update = {
        $set: {
          [`${String(arrayFieldName)}.$`]: data
        }
      };
  
      const updateResult = await this.collection.updateOne(query, update);
      return updateResult.modifiedCount === 1;
    } catch (err: any) {
      console.log(`Repository::updateArrayElementFieldGeneric() -> error: ${err.message}`);
      return false;
    }
  }

  async updateField<K extends keyof T>(
    id: string,
    field: K,
    value: T[K]
  ): Promise<boolean> {
    try {
      await this.ensureCollection();
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { [field]: value } }
      );
      return result.modifiedCount === 1;
    } catch (error) {
      console.error(`Error updating field: ${error}`);
      return false;
    }
  }

  async updateArrayField<K extends keyof T>(
    id: string,
    field: K,
    operation: '$addToSet' | '$pull' | '$set',
    value: T[K] extends Array<infer U> ? U | U[] : never
  ): Promise<boolean> {
    try {
      await this.ensureCollection();
      const updateOperation = operation === '$set' 
        ? { [operation]: { [field]: value } }
        : { [operation]: { [field]: operation === '$addToSet' ? { $each: Array.isArray(value) ? value : [value] } : value } };
      
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        updateOperation
      );
      return result.modifiedCount === 1;
    } catch (error) {
      console.error(`Error updating array field: ${error}`);
      return false;
    }
  }

  async updateByPredicate(predicate: Partial<T>, data: Partial<T>): Promise<[any, boolean]> {
    try {
      await this.ensureCollection();
      (data as any).updated_at = UtilityService.formatDateToISOFormat(new Date());
      const result = await this.collection.updateMany(predicate, { $set: data });
      console.log("PredicateUpdateCount: ", result.modifiedCount);
      return [result, result.modifiedCount > 0];
    } catch (err: any) {
      console.log('Repository::updateByPredicate() -> error: ', err.message);
      return [null, false];
    }
  }

/**
 * Updates a nested field within a document.
 *
 * @param {string} id - The ID of the document to update.
 * @param {K} field - The name of the parent field.
 * @param {L} nestedField - The name of the nested field.
 * @param {T[K][L]} value - The new value for the nested field.
 * @returns {Promise<boolean>} - True if the update was successful, false otherwise.
 */
  async updateNestedField<K extends keyof T, L extends keyof T[K]>(
    id: string,
    field: K,
    nestedField: L,
    value: T[K] extends Record<string, any> ? T[K][L] : never
  ): Promise<boolean> {
    try {
      await this.ensureCollection();
  
      const updateOperation = {
        $set: {
          [`${String(field)}.${String(nestedField)}`]: value
        }
      };
  
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        updateOperation
      );
  
      return result.modifiedCount === 1;
    } catch (error) {
      console.error(`Error updating nested field: ${error}`);
      return false;
    }
  }
  
/**
 * Updates a nested array element within a document.
 *
 * @param {string} id - The ID of the document to update.
 * @param {K} field - The name of the parent field.
 * @param {L} nestedField - The name of the nested array field.
 * @param {number} arrayIndex - The index of the array element to update.
 * @param {T[K] extends Array<infer U> ? U : never} value - The new value for the array element.
 * @returns {Promise<boolean>} - True if the update was successful, false otherwise.
 */
  async updateNestedArrayElement<K extends keyof T, L extends keyof T[K]>(
    id: string,
    field: K,
    nestedField: L,
    arrayIndex: number,
    value: T[K] extends Array<infer U> ? U : never
  ): Promise<boolean> {
    try {
      await this.ensureCollection();
  
      const updateOperation = {
        $set: {
          [`${String(field)}.${String(nestedField)}.${arrayIndex}`]: value
        }
      };
  
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        updateOperation
      );
  
      return result.modifiedCount === 1;
    } catch (error) {
      console.error(`Error updating nested array element: ${error}`);
      return false;
    }
  }
  

  async searchKeyword(keyword: string): Promise<T[] | null | undefined> {
    try {
      await this.ensureCollection();
      const predicate = {
        $text: { $search: keyword }
      };
      const results = await this.collection.find(predicate).toArray();
      return results as T[];
    } catch (err: any) {
      console.log('Repository::getByPredicate -> error: ', err.message);
    }
  }

  async isExist(predicate: Partial<T>): Promise<boolean> {
    try {
      await this.ensureCollection();
      const result = await this.collection.findOne(predicate);
      return !!result;
    } catch (err: any) {
      console.log(err.message);
      return false;
    }
  }

  async customQuery(query: object, projection?: object | undefined): Promise<any[]> {
    await this.ensureCollection();
    const results = await this.collection.find(query, projection).toArray();
    return results;
  }

  async delete(id: string): Promise<boolean | null | undefined> {
    try {
      await this.ensureCollection();
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (err: any) {
      console.log(err.message);
    }
  }



  /**
   * Perform an aggregation query using the aggregation service.
   * @param {any[]} pipeline - The aggregation pipeline stages.
   * @param {boolean} singleResult - If true, returns a single result, otherwise returns an array of results.
   * @returns {Promise<T | T[] | null>} The aggregation result(s).
   */
  async aggregateQuery(aggregrate: any): Promise<any>{
    await this.ensureCollection();
    const result = await this.collection.aggregate(aggregrate).toArray();
    return result;
  }


}

setInterval(() => {
  const connectionCount = MongoConnectionManager.getInstance().getConnectionCount();
  console.log(`Current active Connections: `, connectionCount);
}, 25000)

export interface PaginationOptions {
  page?: number;
  perpage?: number;
  sortBy?: string;
  sortOrder?: number;
  dateFrom?: string;
  dateTo?: string;
  [key: string | number]: string | number | undefined;
}
export interface PaginatedResult<T>{
   data: T[];
   metadata: {
    currentPage: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
    dateFrom?: string;
    dateTo?: string;
   };
}

export enum SortOrder {
  ASCENDING = 1,
  DESCENDING = -1,
}

export type RemovalCriteria = 
  | { type: 'index'; value: number }
  | { type: 'id'; value: string }
  | { type: 'value'; value: string };

  interface RemoveOptions {
    type: 'value' | 'property' | 'index';
    value?: string | string[]; // For 'value' type
    propertyName?: string; // For 'property' type
    propertyValue?: any; // For 'property' type
    index?: number; // For 'index' type
}