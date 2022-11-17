import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Book } from "../entity/Book";
import { User } from "../entity/User";
import { logger } from "../server";


const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);


export class BookController {
    static async getAll(req: Request, res: Response) {
        try {
            const builder = AppDataSource.getRepository(Book)
                .createQueryBuilder('book');

            //apply filters
            builder.where("book.isActive = :isActive", { isActive: true });

            if (req.query.search) {
                builder.andWhere("(book.name ILIKE :search OR book.description ILIKE :search)", { search: `%${req.query.search}%` });
            }

            if (req.query.categoryIDs) {
                const searchCategories = req.query.categoryIDs;
                builder.innerJoin('book.categories', 'bookCategory', 'bookCategory.id IN (:...searchCategories)', { searchCategories });
            }

            builder.orderBy('RANDOM()');

            // apply pagination
            const page: number = parseInt(req.query.page as any) || 1;
            const perPage = ITEMS_PER_PAGE;
            const total = await builder.getCount();

            builder.offset((page - 1) * perPage).limit(perPage);

            // apply sort
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

            builder.select(["book.id", "book.name", "book.description", "book.price", "book.hitCounter", "book.user", "book.isActive", "book.isPremiumActive"]);
            builder.leftJoinAndSelect("book.categories", "category");
            builder.leftJoinAndSelect("book.user", "user");
            builder.leftJoinAndSelect("book.contactInfo", "contactInfo");


            const books = await builder.getMany();
            const responseBody = {
                "books": books,
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
            const currentUser = req["user"];
            let currentUserObj = null;

            if (currentUser !== null) {
                const currentUserID: number = parseInt(req["user"]["id"]);
                currentUserObj = await AppDataSource.getRepository(User).findOne({
                    where: {
                        id: currentUserID
                    }
                });
            }

            let filterByActive: boolean = true;
            const bookID: number = parseInt(req.params.bookID);
            const builder = AppDataSource.getRepository(Book)
                .createQueryBuilder('book');

            const tempBuilder = AppDataSource.getRepository(Book).createQueryBuilder('book');
            tempBuilder.leftJoinAndSelect("book.user", "user");
            tempBuilder.where("book.id = :bookID", { bookID: bookID });

            const queriedBook = await tempBuilder.getOne();

            if (currentUserObj !== null) {

                if (queriedBook.user.id === currentUserObj.id)
                    filterByActive = false;
            }

            builder.where("book.id = :bookID", { bookID: bookID });
            if (filterByActive) {
                builder.andWhere("book.isActive = :isActive", { isActive: true });
            }

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

    static async update(req: Request, res: Response) {
        //TODO:
        //  make isActive=false, send it to admin to review changes
        //  let user know about resubmission
        //  shut down isActive and isPremium workers (think how to handle it in the best way)
        //  update the details
        //  let the admin know about pending update (give elaborate description about book id and etc)
    }

    static async delete(req: Request, res: Response) {
        //TODO:
        //  make, isActive=false, shut down isActive and isPremium workers
    }

    static async getMyBooks(req: Request, res: Response) {

        try {
            const userID: number = parseInt(req["user"]["id"]);
            const builder = AppDataSource.getRepository(Book).createQueryBuilder('book');
            builder.where("book.isDeleted = :isDeleted", { isDeleted: false });
            builder.leftJoinAndSelect("book.user", "user");
            builder.andWhere("book.user.id = :userID", { userID: userID });

            // apply pagination
            const page: number = parseInt(req.query.page as any) || 1;
            const perPage = ITEMS_PER_PAGE;
            const total = await builder.getCount();

            builder.offset((page - 1) * perPage).limit(perPage);
            builder.select(["book.id", "book.name", "book.description", "book.price", "book.hitCounter"]);
            builder.leftJoinAndSelect("book.categories", "category");
            builder.leftJoinAndSelect("book.contactInfo", "contactInfo");



            const currentUsersBooks = await builder.getMany();
            const responseData = {
                "books": currentUsersBooks,
                "total": total,
                "page": page,
                "lastPage": Math.ceil(total / perPage)
            };

            return res.status(200).json(responseData);
        } catch (err) {
            logger.error(`Internal server error occured in getMyBooks. Error: ${err}`);
            return res.status(500).json({ "error": "internal server error" });
        }
    }

    static async sold(req: Request, res: Response) {
        //TODO:
        //  make isSold=true, isActive=false, shut down isActive and isPremium worker
    }
}

//TODO
// fetch premiums by is_premium
// have end point to make a book to be sold by owner, when it goes to this endpoint it should make isActive = false