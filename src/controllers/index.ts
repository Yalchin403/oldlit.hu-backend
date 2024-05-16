import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Book } from "../entity/Book";
import { User } from "../entity/User";
import { logger } from "../server";
import { Category } from "../entity/Category";
import { Contact } from "../entity/Contact";
import path from "path";
import { BookNotFoundError } from "../exceptions/books";
const fs = require("fs");

const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);
const bookPostTimeLimit = parseInt(process.env.BOOK_POST_TIME_LIMIT);
const BOOK_POST_MONTHLY_LIMIT = parseInt(process.env.BOOK_POST_MONTHLY_LIMIT);

export class BookController {
  private static async getBookBuilder(
    search: any,
    categoryIDs: any,
    sortBy: any,
    page: any = 1
  ) {
    const builder =
      AppDataSource.getRepository(Book).createQueryBuilder("book");

    //apply filters
    builder.where("book.isActive = :isActive", { isActive: true });
    builder.andWhere("book.isSold = :isSold", { isSold: false });

    if (categoryIDs) {
      const searchCategories = categoryIDs;
      builder.innerJoin(
        "book.categories",
        "bookCategory",
        "bookCategory.id IN (:...searchCategories)",
        { searchCategories }
      );
    }

    // apply search
    if (search) {
      builder.andWhere(
        "(book.name ILIKE :search OR book.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // apply sort
    if (sortBy) {
      console.log(sortBy);
      sortBy = sortBy.toLowerCase();
      if (sortBy === "price_asc") {
        builder.orderBy("book.price", "ASC");
      } else if (sortBy === "price_desc") {
        builder.orderBy("book.price", "DESC");
      } else if (sortBy === "popular") {
        builder.orderBy("book.hitCounter", "DESC");
      }
    }

    // exclude books that are posted 10 days ago if they are not premium
    const timeLimit = new Date(
      Date.now() - bookPostTimeLimit * 24 * 60 * 60 * 1000
    );
    builder.andWhere(
      "(book.createdAt > :timeLimit OR book.isPremium = :isPremium)",
      {
        timeLimit,
        isPremium: true,
      }
    );

    builder.orderBy("RANDOM()");
    // apply pagination
    builder.offset((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);

    builder.select([
      "book.id",
      "book.name",
      "book.description",
      "book.price",
      "book.hitCounter",
      "book.user",
      "book.isActive",
      "book.isPremium",
      "book.isSold",
      "book.images",
    ]);
    builder.leftJoinAndSelect("book.categories", "category");
    builder.leftJoinAndSelect("book.user", "user");
    builder.leftJoinAndSelect("book.contact", "contact");

    return builder;
  }

  static async getAll(req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page as any) || 1;
      const { search, sortBy, categoryIDs } = req.query;
      const builder = await BookController.getBookBuilder(
        search,
        categoryIDs,
        sortBy,
        page
      );
      const total = await builder.getCount();
      const books = await builder.getMany();

      // make images list of urls instead of showing image names
      books.forEach((book) => {
        book.images = book.images.map((image) => {
          return `${process.env.DOMAIN}/media/books/${image}`;
        });
      });

      const responseBody = {
        books: books,
        total: total,
        page: page,
        lastPage: Math.ceil(total / ITEMS_PER_PAGE),
      };

      return res.status(200).json(responseBody);
    } catch (err) {
      logger.error(`Internal server error on get all books, Error: ${err}`);
      return res.status(500).json({ error: "internal server error" });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const bookID: number = parseInt(req.params.bookID);
      const builder =
        AppDataSource.getRepository(Book).createQueryBuilder("book");

      builder.where("book.id = :bookID", { bookID: bookID });
      builder.andWhere("book.isDeleted = :isDeleted", { isDeleted: false });
      builder.andWhere("book.isActive = :isActive", { isActive: true });
      builder.andWhere("book.isSold = :isSold", { isSold: false });

      builder.select([
        "book.id",
        "book.name",
        "book.description",
        "book.price",
        "book.hitCounter",
        "book.user",
        "book.images",
        "book.isPremium",
        "book.isSold",
      ]);
      builder.leftJoinAndSelect("book.categories", "category");
      builder.leftJoinAndSelect("book.user", "user");

      const bookObj = await builder.getOne();

      if (!bookObj) {
        return res.status(404).json({ detail: "Book not found" });
      }

      bookObj.hitCounter += 1;
      await AppDataSource.getRepository(Book).save(bookObj);
      // make images list of urls instead of showing image names
      bookObj.images = bookObj.images.map((image) => {
        return `${process.env.DOMAIN}/media/books/${image}`;
      });
      if (!bookObj) {
        throw new BookNotFoundError();
      }
      return res.status(200).json(bookObj);
    } catch (err) {
      logger.error(`Error in get book, internal server error. Error: ${err}`);
      return res.status(500).json({ error: "internal server error" });
    }
  }
  static async create(req: Request, res: Response) {
    try {
      const { name, description, price, contactId, categoryNames, images } =
        req.body;

      const user = await AppDataSource.getRepository(User).findOne({
        where: {
          id: parseInt(req["user"]["id"]),
        },
      });

      // check if user has reached the limit of posting books this month
      const numberOfBooksPostedThisMonth = await AppDataSource.getRepository(
        Book
      ).count({
        where: {
          user: { id: parseInt(req["user"]["id"]) },
          createdAt: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ),
        },
      });

      if (numberOfBooksPostedThisMonth >= BOOK_POST_MONTHLY_LIMIT) {
        return res.status(403).json({
          detail: `You have reached the limit of posting ${BOOK_POST_MONTHLY_LIMIT} books this month`,
        });
      }

      const book = new Book();
      book.name = name;
      book.description = description;
      book.price = parseFloat(price);
      book.images = images;
      book.isActive = false;

      const contact = await AppDataSource.getRepository(Contact).findOne({
        where: {
          id: contactId,
          user: { id: parseInt(req["user"]["id"]) },
        },
      });

      if (!contact) {
        return res.status(404).json({ detail: "Contact not found" });
      }

      const builder =
        AppDataSource.getRepository(Category).createQueryBuilder("category");
      builder.where("LOWER(category.name) IN (:...categoryNames)", {
        categoryNames: categoryNames.map((name) => name.toLowerCase()),
      });
      const categories = await builder.getMany();
      book.contact = contact;
      // contact.books = [book];
      book.user = user;
      book.categories = categories;

      await AppDataSource.manager.save(book);

      // show images as urls instead of image names
      book.images = book.images.map((image) => {
        return `${process.env.DOMAIN}/media/books/${image}`;
      });
      return res.json(book).status(200);
    } catch (error) {
      logger.error(error);
      return res.json("Internal server error").status(500);
    }
  }

  static async upload(req, res) {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send("No files were uploaded.");
        }

        const uploadPath = path.join(__dirname, "../media/books/");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const uploadedImages = [];

        // Handle single or multiple files uniformly
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        for (const file of files) {
            const filePath = path.join(uploadPath, file.name);

            // Use try-catch for better error handling
            try {
                await file.mv(filePath);
                uploadedImages.push({
                    name: file.name,
                    path: `/media/books/${file.name}`,
                });
            } catch (error) {
                console.error(error);
                return res.status(500).send("Image upload failed.");
            }
        }

        res.status(201).send({ images: uploadedImages });
    } catch (error) {
        console.error(`Error in upload book images: ${error}`);
        logger.error(`Error in upload book images, internal server error. Error: ${error}`);
        res.status(500).send("Internal Server Error");
    }
}

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const bookID: number = parseInt(req.params.bookID);
      const { name, description, price, contactId, categoryNames, images } =
        req.body;

      const book = await AppDataSource.getRepository(Book).findOne({
        where: {
          id: bookID,
          user: { id: parseInt(req["user"]["id"]) },
          isDeleted: false,
          isActive: true,
        },
      });

      if (!book) {
        return res.status(404).json({ detail: "Book not found" });
      }

      // Update book properties if provided
      if (name !== undefined) book.name = name;
      if (description !== undefined) book.description = description;
      if (price !== undefined) book.price = parseFloat(price);
      if (images !== undefined) book.images = images;

      // Update contact if provided
      if (contactId !== undefined) {
        const contact = await AppDataSource.getRepository(Contact).findOne({
          where: { id: contactId, user: { id: parseInt(req["user"]["id"]) } },
        });
        if (contact) {
          book.contact = contact;
        } else {
          return res.status(404).json({ detail: "Contact not found" });
        }
      }

      // Update categories if provided
      if (categoryNames !== undefined) {
        const builder =
          AppDataSource.getRepository(Category).createQueryBuilder("category");
        builder.where("LOWER(category.name) IN (:...categoryNames)", {
          categoryNames: categoryNames.map((name) => name.toLowerCase()),
        });
        const categories = await builder.getMany();
        book.categories = categories;
      }
      await AppDataSource.getRepository(Book).save(book);

      return res.status(200).json(book);
    } catch (err) {
      logger.error(
        `Error in update book, internal server error. Error: ${err}`
      );
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const bookID: number = parseInt(req.params.bookID);
      const book = await AppDataSource.getRepository(Book).findOne({
        where: {
          id: bookID,
          user: { id: parseInt(req["user"]["id"]) },
          isDeleted: false,
          isActive: true,
        },
      });

      if (!book) {
        return res.status(404).json({ detail: "Book not found" });
      }

      book.isActive = false;
      book.isPremium = false;
      book.isDeleted = true;

      await AppDataSource.getRepository(Book).save(book);

      return res.status(204).send();
    } catch (err) {
      logger.error(
        `Error in delete book, internal server error. Error: ${err}`
      );
      next(err);
    }
  }

  static async getMyBooks(req: Request, res: Response) {
    try {
      const userID: number = parseInt(req["user"]["id"]);
      const builder =
        AppDataSource.getRepository(Book).createQueryBuilder("book");
      builder.where("book.isDeleted = :isDeleted", { isDeleted: false });
      builder.leftJoinAndSelect("book.user", "user");
      builder.andWhere("book.user.id = :userID", { userID: userID });

      // apply pagination
      const page: number = parseInt(req.query.page as any) || 1;
      const perPage = ITEMS_PER_PAGE;
      const total = await builder.getCount();

      builder.offset((page - 1) * perPage).limit(perPage);
      builder.select([
        "book.id",
        "book.name",
        "book.description",
        "book.price",
        "book.hitCounter",
      ]);
      builder.leftJoinAndSelect("book.categories", "category");
      builder.leftJoinAndSelect("book.contact", "contact");

      const currentUsersBooks = await builder.getMany();
      const responseData = {
        books: currentUsersBooks,
        total: total,
        page: page,
        lastPage: Math.ceil(total / perPage),
      };

      return res.status(200).json(responseData);
    } catch (err) {
      logger.error(
        `Internal server error occured in getMyBooks. Error: ${err}`
      );
      return res.status(500).json({ error: "internal server error" });
    }
  }

  static async sold(req: Request, res: Response, next: NextFunction) {
    try {
      const bookID: number = parseInt(req.params.bookID);
      const book = await AppDataSource.getRepository(Book).findOne({
        where: {
          id: bookID,
          user: { id: parseInt(req["user"]["id"]) },
          isDeleted: false,
          isActive: true,
        },
      });

      if (!book) {
        return res.status(404).json({ detail: "Book not found" });
      }

      book.isSold = true;

      await AppDataSource.getRepository(Book).save(book);

      return res.status(204).send();
    } catch (err) {
      logger.error(`Error in sold book, internal server error. Error: ${err}`);
      next(err);
    }
  }
}
