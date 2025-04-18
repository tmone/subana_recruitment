# subana_recruitment
Here is the mime full code for require from HR of Subana company. I would like join your comppany for improving my caree in the future.

# Location Tree Management API

A RESTful API system for managing hierarchical location structures using NestJS and TypeORM.

## Project Description

This project is a RESTful API system that allows users to perform CRUD operations on locations structured in a hierarchical tree. The system is designed to manage building locations with the following information:
- Location Name
- Location Number
- Area

## Technologies

- NestJS: NodeJS Framework
- TypeScript: Programming Language
- PostgreSQL: Database
- TypeORM: Object-Relational Mapping
- Docker: Containerization

## Project Structure

```
location-tree-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── common/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   ├── modules/
│   │   ├── location/
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── interfaces/
│   │   │   └── location.module.ts
│   └── shared/
├── test/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Database Design

The database is designed to support a location tree structure with the main table:

### Location Table

| Column Name      | Data Type    | Description                               |
|------------------|--------------|-------------------------------------------|
| id               | UUID         | Primary key                               |
| name             | VARCHAR      | Location name                             |
| location_number  | VARCHAR      | Location identifier code                  |
| area             | DECIMAL      | Area in square meters                     |
| parent_id        | UUID         | Foreign key referencing Location table    |
| level            | INTEGER      | Node level in the tree                    |
| path             | VARCHAR      | Full path to support queries              |
| created_at       | TIMESTAMP    | Creation timestamp                        |
| updated_at       | TIMESTAMP    | Update timestamp                          |

## Implementation Steps

### 1. Install Required Tools

- Node.js (>= 18.x)
- Docker and Docker Compose
- Git

### 2. Clone the Project

```bash
git clone https://github.com/username/location-tree-api.git
cd location-tree-api
```

### 3. Install Dependencies

```bash
yarn
```

### 4. Configure Environment

Create a `.env` file from the `.env.example`:

```bash
cp .env.example .env
```

Open the `.env` file and update the configuration:

```
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=location_tree_db

# App
PORT=3000
NODE_ENV=development
```

### 5. Run PostgreSQL with Docker

```bash
docker-compose up -d postgres
```

Docker-compose.yml will contain the following configuration:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: location_tree_postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  pgadmin:
    image: dpage/pgadmin4
    container_name: location_tree_pgadmin
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - app-network
    depends_on:
      - postgres

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  pgadmin_data:
```

### 6. Create Database Schema

TypeORM will automatically create the schema when running the application with migration configuration. To manually create tables, run:

```bash
yarn run migration:run
```

### 7. Run the NestJS Application

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

### 8. Test the API

After the application is running successfully, you can test the API by accessing:

- http://localhost:3000/api - Default API page
- http://localhost:3000/api/docs - Swagger UI (if configured)

### 9. Run the Entire Project with Docker Compose

```bash
docker-compose up -d
```

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## API Documentation (Swagger UI)

The project includes Swagger UI for API documentation and testing. To access the Swagger UI:

```bash
# First start the application
$ yarn run start:dev

# Then open in your browser
http://localhost:3000/api/docs
```

You can test all API endpoints directly from the Swagger UI interface.

## Run tests

```bash
# unit tests
$ yarn run test

# unit tests with watch mode
$ yarn run test:watch

# e2e tests
$ yarn run test:e2e

# integration tests
$ yarn run test:integration

# test coverage
$ yarn run test:cov
```

## API Endpoints

### Locations

- `GET /api/locations` - Get list of locations
- `GET /api/locations/:id` - Get location details
- `POST /api/locations` - Create a new location
- `PATCH /api/locations/:id` - Update a location
- `DELETE /api/locations/:id` - Delete a location
- `GET /api/locations/tree` - Get the location tree structure
- `GET /api/locations/children/:id` - Get the list of child locations

## API Examples

### Create a New Location

**Request:**

```http
POST /api/locations
Content-Type: application/json

{
  "name": "Building A",
  "locationNumber": "A",
  "area": 1000,
  "parentId": null
}
```

**Response:**

```json
{
  "id": "a87ff679-a2f3-4718-8f37-95deb3c916f9",
  "name": "Building A",
  "locationNumber": "A",
  "area": 1000,
  "parentId": null,
  "level": 0,
  "path": "a87ff679-a2f3-4718-8f37-95deb3c916f9",
  "createdAt": "2023-06-22T09:00:00Z",
  "updatedAt": "2023-06-22T09:00:00Z"
}
```

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
