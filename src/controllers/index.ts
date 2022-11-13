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
                builder.andWhere("(book.name ILIKE :search OR book.description ILIKE :search)", { search: `%${req.query.search}%` });
            }

            if (req.query.sort_by) {
                const sort_by = req.query.sort_by;
                if (sort_by === 'price_asc') {
                    builder.orderBy('book.price', 'ASC');
                }

                else if (sort_by === 'price_desc') {
                    builder.orderBy('book.price', 'DESC');
                }

                else if (sort_by === 'popular') {
                    builder.orderBy('book.hitCounter', 'DESC');
                }
            }

            if (req.query.category) {
                const searchCategories = [req.query.category];
                builder.innerJoin('book.categories', 'bookCategory', 'bookCategory.id IN (:...searchCategories)', { searchCategories });
                // builder.innerJoin("book.categories", "category", "category.id = :bookCategory", { bookCategory: req.query.category });
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

    static async get(req: Request, res: Response) {
        try {
            const bookID: number = parseInt(req.params.bookID);
            const builder = AppDataSource.getRepository(Book)
                .createQueryBuilder('book');
            builder.where("book.id = :bookID", { bookID: bookID });
            builder.select(["book.id", "book.name", "book.description", "book.price", "book.hitCounter", "book.user"]);
            builder.leftJoinAndSelect("book.categories", "category");
            builder.leftJoinAndSelect("book.user", "user");
            const bookObj = await builder.getOne();
            if (bookObj !== null) {
                return res.status(200).json(bookObj);
            }

            return res.status(200).json([]);


        } catch (err) {
            logger.error(`Error in get book, internal server error. Error: ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }

    }
    static async create(req: Request, res: Response) {

    }
}

//TODO
// fetch them randomly for each user