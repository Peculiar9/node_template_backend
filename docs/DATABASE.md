# Database Management and API Integrations

This document provides an overview of how the **Node Express Backend (TypeScript)** project manages databases and integrates with external APIs. The application supports both **MongoDB** and **PostgreSQL**, allowing flexibility and scalability depending on the use case. Additionally, the **Infrastructure** layer includes various external integrations for seamless interactions with third-party services.

[Back to main README](../README.md)

## Database Management

### Supported Databases
- **MongoDB**: Used for managing unstructured or semi-structured data. MongoDB's flexible schema design makes it ideal for managing dynamic and evolving data models.
- **PostgreSQL**: A relational database that ensures data integrity and supports advanced querying capabilities. PostgreSQL is used for structured data, ensuring consistency across the system.

### Connection Management
- **MongoConnectionManager**: Manages connections to MongoDB, ensuring that each database operation is handled efficiently. This connection manager ensures pooling of MongoDB connections to minimize resource consumption and maximize performance.
- **SQLConnectionManager**: Handles connections to the PostgreSQL database using connection pooling. This prevents the exhaustion of database connections and ensures that the system can handle multiple requests concurrently.

### Repositories
Repositories are used to abstract data access logic, making it easy to switch between different databases without changing the core business logic.
- **MongoDB Repositories**: Responsible for CRUD operations on MongoDB collections. The MongoDB repository pattern abstracts all data manipulation, ensuring that switching to another database or adding another data store requires minimal changes.
- **PostgreSQL Repositories**: Handle CRUD operations on PostgreSQL tables. These repositories abstract SQL queries, providing a consistent interface for data operations regardless of the underlying database.

### Benefits of Database Abstraction
- **Flexibility**: The ability to use both MongoDB and PostgreSQL enables the system to take advantage of the strengths of both databases—scalability and schema flexibility from MongoDB and the reliability and integrity of relational data from PostgreSQL.
- **Scalability**: By abstracting database operations into repositories, the system can be scaled horizontally by distributing data between different databases.
- **Maintainability**: Changes to the database schema or migration between databases are simplified due to the abstraction provided by repositories.

## API Integrations

### Overview
The **Infrastructure** layer of the application includes integrations with various external APIs, enabling the backend to interact with third-party services for different functionalities, such as file management, payments, and more.

### API Integration Services
- **AWS Integration (AWSHelper)**: The application uses `AWSHelper` to interact with AWS services, such as S3, for file management. This service abstracts all AWS-related logic, making it easier to manage file uploads and retrieval without needing to worry about the underlying AWS SDK.

#### Example: AWSHelper for File Management
The **AWSHelper** provides methods for uploading, downloading, and managing files in an S3 bucket. This abstraction hides the complexities of interacting with the AWS SDK and provides a simple API for the rest of the application.

```typescript
import AWS from 'aws-sdk';

class AWSHelper {
    private s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        });
    }

    async uploadFile(bucketName: string, key: string, body: Buffer): Promise<void> {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: body,
        };
        await this.s3.upload(params).promise();
    }

    async getFile(bucketName: string, key: string): Promise<AWS.S3.GetObjectOutput> {
        const params = {
            Bucket: bucketName,
            Key: key,
        };
        return this.s3.getObject(params).promise();
    }
}
```

### HTTP Clients
The application also uses HTTP clients to communicate with external REST APIs. These clients are implemented as services and injected wherever needed using **Inversify** for dependency injection.

#### Example: BaseHTTPClient
The **BaseHTTPClient** service is used to make HTTP requests to external services. This could be useful for making calls to third-party APIs for payment processing, authentication, or data retrieval.

```typescript
import axios, { AxiosInstance } from 'axios';

class BaseHTTPClient {
    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
        });
    }

    async get(endpoint: string, params?: any): Promise<any> {
        return this.client.get(endpoint, { params });
    }

    async post(endpoint: string, data: any): Promise<any> {
        return this.client.post(endpoint, data);
    }
}
```
- **BaseURL Configuration**: Each instance of `BaseHTTPClient` can be configured with a different base URL, allowing easy management of multiple external services.
- **Error Handling**: The client can also include error-handling logic to ensure that failed requests are handled gracefully.

### Benefits of API Abstraction
- **Reusability**: By creating generic clients like `AWSHelper` and `BaseHTTPClient`, the application can reuse these components across multiple services, reducing redundancy.
- **Maintainability**: Centralizing API interactions in dedicated services makes the application more maintainable, as changes to an API or its authentication method can be updated in one place.
- **Dependency Injection**: Using **Inversify** to inject these services allows for better testing, as the services can be easily mocked during unit testing.

## Summary
This document outlines how the **Node Express Backend (TypeScript)** project handles database management and external API integrations. By leveraging a combination of **MongoDB** and **PostgreSQL**, the system gains flexibility and scalability. Repositories abstract data access, making the core application logic database-agnostic. The **Infrastructure** layer integrates with external APIs using services like `AWSHelper` and `BaseHTTPClient`, ensuring that the application is modular, maintainable, and easy to extend.

The architecture aims to provide:
- **Clean Database Abstraction**: Through repositories and connection managers.
- **Seamless API Integrations**: Using helpers and HTTP clients for easy interaction with third-party services.
- **Scalability and Flexibility**: By combining different database technologies and providing modular integrations.
