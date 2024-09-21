export interface IUserRepository<User>{
    getUserById(id: string): Promise<User | null | undefined>;
    create(data: Partial<User>): Promise<User>;
    updateUser(data: Partial<User>): Promise<User | null | undefined>;
    userExists(data: Partial<User>): Promise<boolean>;
    // getAll(): Promise<T[] | null | undefined>;
    // update(id: string, data: Partial<T>): Promise<T | null | undefined>;
    // isExist(predicate: Partial<T>): Promise<boolean>;
    // getByPredicate(predicate: Partial<T>): Promise<T[] | null | undefined>;
    // customQuery(query: object, projection?: object): Promise<any[]>;
    // delete(id: string): Promise<boolean | null | undefined>;
}
