import { IRepository } from "../../../Core/Interfaces/Repository/IRepository";

export class SQLRepository<T> implements IRepository<T> {

    constructor(){

    }
    searchKeyword(keyword: string): Promise<T[] | null | undefined> {
        throw new Error("Method not implemented.");
    }

    getById(id: string): Promise<T | null | undefined> {
        throw new Error("Method not implemented.");
    }
    getAll(): Promise<T[] | null | undefined> {
        throw new Error("Method not implemented.");
    }
    create(data: Partial<T>): Promise<T> {
        throw new Error("Method not implemented.");
    }
    update(id: string, data: Partial<T>): Promise<T | null | undefined> {
        throw new Error("Method not implemented.");
    }
    isExist(predicate: Partial<T>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getByPredicate(predicate: Partial<T>): Promise<T[] | null | undefined> {
        throw new Error("Method not implemented.");
    }
    customQuery(query: object, projection?: object): Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<boolean | null | undefined> {
        throw new Error("Method not implemented.");
    }

}

