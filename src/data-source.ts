import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Book } from "./entity/Book";
import { Review } from "./entity/Review";
import * as dotenv from 'dotenv';
import { Category } from "./entity/Category";
import { initializeDotenv } from "./utils/init-dotenv";


initializeDotenv();

let POSTGRESS_PASSWORD = process.env.POSTGRES_PASSWORD;
let POSTGRES_USER = process.env.POSTGRES_USER;
let POSTGRES_DB = process.env.POSTGRES_DB;
const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_PORT = +process.env.POSTGRES_PORT;


export const AppDataSource = new DataSource({
    type: "postgres",
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
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
