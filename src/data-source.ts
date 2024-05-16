import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Book } from "./entity/Book";
import { Review } from "./entity/Review";
import { Category } from "./entity/Category";
import { Contact } from "./entity/Contact";
import { Transaction } from "./entity/Transaction";
import { Package } from "./entity/Package";

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
  entities: [User, Book, Review, Category, Contact, Transaction, Package],
  migrations: [User, Book, Review, Category, Contact, Transaction, Package],
  subscribers: [],
});
AppDataSource.initialize();
