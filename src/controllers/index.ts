import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Book } from "../entity/Book";
import { logger } from "../server";


const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);


export class BookController {
    static async getAll(req: Request, res: Response) {
        try {
            const builder = AppDataSource.getRepository(Book)
                .createQueryBuilder('book');

            builder.where("book.isVerified = :isVerified", { isVerified: true });

            if (req.query.search) {
                builder.andWhere("(book.name LIKE :search OR book.description LIKE)", { search: `%${req.query.search}%` });
            }

            if (req.query.sort) {
                const sort_by = req.query.sort_by;
                if (sort_by === 'price_asc') {
                    //TODO
                    // order by price asc
                }

                else if (sort_by === 'price_des') {
                    //TODO
                    // order by price desc
                }

                else if (sort_by === 'popular') {
                    //TODO
                    // order by hitCounter
                }
            }

            if (req.query.category) {
                // TODO:
                // filter by exact category
            }

            const page: number = parseInt(req.query.page as any) || 1;
            const perPage = ITEMS_PER_PAGE;
            const total = await builder.getCount();

            builder.offset((page - 1) * perPage).limit(perPage);
            builder.select(["book.id", "book.name", "book.description", "book.price", "book.hitCounter", "book.user"]);
            builder.leftJoinAndSelect("book.categories", "category");
            builder.leftJoinAndSelect("book.user", "user");


            const books = await builder.getMany();
            const responseBody = {
                "boks": books,
                "total": total,
                "page": page,
                lastPage: Math.ceil(total / perPage)
            };

            return res.status(200).json(responseBody);
        } catch (err) {
            logger.error(`Internal server error on get all books, Error: ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }

    }

    static async create(req: Request, res: Response) {

    }
}

//TODO
// fetch books that are isVerified: true
// fetch them randomly for each user