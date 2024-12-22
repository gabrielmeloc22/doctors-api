# Doctor's calendar (better name to come)

This is an official Docker starter Turborepo.

## How to setup

### Development

1. Install dependencies using `pnpm install`
2. Add your database url to `.env` file according to the `.env.example` file
3. Run `pnpm dev` to start the server

### Running with Docker

- To run the whole monorepo with docker just do `docker-compose up -d`

### API Documentation

- The API documentation can be found at [/apps/api/src/openapi-docs.json](/apps/api/src/openapi-docs.json) or at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Features

- Create doctors
- Create slots with different repeat types
- Book slots
- View available slots
- View all bookings

## Technologies

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB)](https://expressjs.com)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=fff)](https://vitest.dev/)
[![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?logo=drizzle&logoColor=000)](https://orm.drizzle.team/)
[![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff)](https://www.docker.com/)
