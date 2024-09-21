export interface IRepository<T> {
    getById(id: string): Promise<T | null | undefined>;
    getAll(): Promise<T[] | null | undefined>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T | null | undefined>;
    isExist(predicate: Partial<T>): Promise<boolean>;
    getByPredicate(predicate: Partial<T>): Promise<T[] | null | undefined>;
    searchKeyword(keyword: string): Promise<T[] | null | undefined>;
    customQuery(query: object, projection?: object): Promise<any[]>;
    delete(id: string): Promise<boolean | null | undefined>;
}