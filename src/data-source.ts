import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Book } from "./entity/Book";
import { Review } from "./entity/Review";
import * as dotenv from 'dotenv';
import { Category } from "./entity/Category";


dotenv.config();
const CURRRENT_ENVIRONMENT = process.env.CURRRENT_ENVIRONMENT;
let POSTGRESS_PASSWORD = process.env.POSTGRES_PASSWORD;
let POSTGRES_USER = process.env.POSTGRES_USER;
let POSTGRES_DB = process.env.POSTGRES_DB;
const POSTGRES_LOCALHOST_PORT = process.env.POSTGRES_LOCALHOST_PORT;
const POSTGRES_LOCAL_DOCKER_PORT = process.env.POSTGRES_LOCAL_DOCKER_PORT;
const POSTGRES_LOCALHOST_HOST = process.env.POSTGRES_LOCALHOST_HOST;
const POSTGRES_LOCAL_DOCKER_HOST = process.env.POSTGRES_LOCAL_DOCKER_HOST;
let port;
let host;

if (CURRRENT_ENVIRONMENT == "local-docker") {
    port = parseInt(POSTGRES_LOCAL_DOCKER_PORT);
    host = POSTGRES_LOCAL_DOCKER_HOST;
}

else if (CURRRENT_ENVIRONMENT == "local-host") {
    port = parseInt(POSTGRES_LOCALHOST_PORT);
    host = POSTGRES_LOCALHOST_HOST;
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: host,
    port: port,
    username: POSTGRES_USER,
    password: POSTGRESS_PASSWORD,
    database: POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: [User, Book, Review, Category],
    migrations: [],
    subscribers: [],
});
AppDataSource.initialize();
