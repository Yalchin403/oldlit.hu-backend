import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Book } from "./entity/Book"
import { Review } from "./entity/Review"
import * as dotenv from 'dotenv'
import { Category } from "./entity/Category"


dotenv.config()
let POSTGRESS_PASSWORD = process.env.POSTGRES_PASSWORD;
let POSTGRES_USER = process.env.POSTGRES_USER;
let POSTGRES_DB = process.env.POSTGRES_DB;

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: POSTGRES_USER,
    password: POSTGRESS_PASSWORD,
    database: POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: [User, Book, Review, Category],
    migrations: [],
    subscribers: [],
})

AppDataSource.initialize()
