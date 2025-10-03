# backend-prompts.md

## Backend Project Documentation

# Backend Project

This is a minimal Node.js and Express project that serves as a backend for managing organisations, dispensaires, and data entries. It uses Sequelize for database interactions with PostgreSQL.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.

## Usage

To start the server, run:
```
npm start
```
The server will listen on port 4000.

## API Endpoints

- **GET** `/health` - Check the health of the service.
- **Authentication Routes**
  - **POST** `/auth/register` - Register a new user (admin only).
  - **POST** `/auth/login` - Log in and receive a JWT.
  - **POST** `/auth/logout` - Log out and invalidate the token.

- **Organisations Routes**
  - **GET** `/organisations` - Retrieve all organisations.
  - **GET** `/organisations/:id` - Retrieve a specific organisation.
  - **POST** `/organisations` - Create a new organisation.
  - **PUT** `/organisations/:id` - Update an existing organisation.
  - **DELETE** `/organisations/:id` - Delete an organisation.

- **Dispensaires Routes**
  - **GET** `/dispensaires` - Retrieve all dispensaires.
  - **GET** `/dispensaires/:id` - Retrieve a specific dispensaire.
  - **POST** `/dispensaires` - Create a new dispensaire.
  - **PUT** `/dispensaires/:id` - Update an existing dispensaire.
  - **DELETE** `/dispensaires/:id` - Delete a dispensaire.

- **Data Entries Routes**
  - **GET** `/data_entries` - Retrieve all data entries.
  - **GET** `/data_entries/:id` - Retrieve a specific data entry.
  - **POST** `/data_entries` - Create a new data entry.
  - **PUT** `/data_entries/:id` - Update an existing data entry.
  - **DELETE** `/data_entries/:id` - Delete a data entry.
  - **POST** `/sync` - Synchronize multiple data entries.

## Environment Variables

The following environment variables are required:

- `PORT` - The port on which the server will run.
- `DB_HOST` - The database host.
- `DB_PORT` - The database port.
- `DB_USER` - The database user.
- `DB_PASS` - The database password.
- `DB_NAME` - The name of the database.
- `JWT_SECRET` - The secret key for JWT signing.

## License

This project is licensed under the MIT License.