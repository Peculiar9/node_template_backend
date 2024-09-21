import { Repository } from "../../../Infrastructure/Repository/MongoDB/Repository";
import User from "../../Entities/Models/User";
import { Model } from "../../Enums/Model";
import { IUserRepository } from "../../Interfaces/Repository/IUserRepository";
import { injectable } from "inversify";

import "reflect-metadata";
import { ValidationError } from "../Error/AppError";


@injectable()
class UserRepository implements IUserRepository<User> {

    private readonly _repository: Repository<User>;
    constructor(){
        this._repository = new Repository<User>(Model.User);
    }
    async updateUser(data: Partial<User>): Promise<User | null | undefined> {
        try {
            const userId = data._id?.toString() || "";
            return await this._repository.update(userId, data);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }

    async updateUserById(userId: string, data: Partial<User>): Promise<User | null | undefined> {
        try {
            return await this._repository.update(userId, data);
        } catch (error) {
            console.error('Error updating user by ID:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }

    async getUserById(id: string): Promise<User | null | undefined> {
        try {
            return await this._repository.getById(id);
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }   

    async getUserByPredicate(predicate: any): Promise<User | null | undefined> {
        try {
            return await this._repository.find(predicate);
        } catch (error) {
            console.error('Error getting user by predicate:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }

    async updateUserByPredicate(predicate: any, data: Partial<User>): Promise<User | null | undefined> {
        try {
            const user: any = await this._repository.getByPredicate(predicate);
            console.log("User: ", user[0]);
            console.log("Predicate: ", predicate);
            const userId = user[0]._id;
            return await this._repository.update(userId, data);
        } catch (error) {
            console.error('Error updating user by predicate:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }

    async create(data: Partial<User>): Promise<User> {
        try {
            const result = await this._repository.create(data);
            console.log({result});
            return result;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }
    
    async userExists(data: Partial<User>): Promise<boolean> {
        try {
            return await this._repository.isExist(data);
        } catch (error) {
            console.error('Error checking if user exists:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }

    async removeUser(email: string): Promise<boolean> {
        try {
            const result = await this._repository.find({email: email}) as User;
            if (!result) {
                throw new ValidationError('User does not exist');
            }
            return await this._repository.delete(result._id as string) as boolean;
        } catch (error) {
            console.error('Error removing user:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }
    
    // User Roles
    async addRole(userId: string, role: string): Promise<boolean> {
        try {
            return await this._repository.updateArrayField(userId, 'roles', '$addToSet', role);
        } catch (error) {
            console.error('Error adding role:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }
    
    async removeRole(userId: string, role: string): Promise<boolean> {
        try {
            return await this._repository.updateArrayField(userId, 'roles', '$pull', role);
        } catch (error) {
            console.error('Error removing role:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }

    async updateRoles(userId: string, roles: string[]): Promise<boolean> {
        try {
            return await this._repository.updateArrayField(userId, 'roles', '$set', roles);
        } catch (error) {
            console.error('Error updating roles:', error);
            throw error;
        } finally {
            await this._repository.closeConnection();
        }
    }

    async getRoles(userId: string): Promise<string[] | null> {
        try {
            const user = await this._repository.findById(userId, { roles: 1 });
            return user ? user.roles : null;
        } catch (error) {
            console.error('Error getting roles:', error);
            return null;
        } finally {
            await this._repository.closeConnection();
        }
    }
    
}

export default UserRepository;