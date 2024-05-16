import { Request, Response, NextFunction } from "express";
import { Review } from "../entity/Review";
import { AppDataSource } from "../data-source";
import { Book } from "../entity/Book";
import { BookNotFoundError } from "../exceptions/books";
import { initializeLogger } from "../utils/inti-logger";
import { User } from "../entity/User";
import { ReviewNotFoundError } from "../exceptions/reviws";

const logger = initializeLogger();

export class ReviewController {
  static async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookID } = req.params;
      if (!(await ReviewController.bookExists(parseInt(bookID)))) {
        logger.error(`Book with id of ${bookID} not found`);
        const err = new BookNotFoundError(
          404,
          `Book with id of ${bookID} not found`
        );
        next(err);
      }

      const builder =
        AppDataSource.getRepository(Review).createQueryBuilder("review");
      builder.where("review.book.id = :bookID", { bookID: bookID });
      builder.select([
        "review.id",
        "review.stars",
        "review.description",
        "review.isVerified",
        "review.user",
      ]);

      builder.leftJoinAndSelect("review.user", "user");
      const bookObjs = await builder.getMany();

      return res.status(200).json(bookObjs);
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const { stars, description, bookID } = body;

      if (!(await ReviewController.bookExists(parseInt(bookID)))) {
        throw new BookNotFoundError();
      }

      const review = new Review();
      const userId = req["user"]["id"];
      const user = await AppDataSource.getRepository(User).findOne({
        where: {
          id: parseInt(userId),
        },
      });

      const book = await AppDataSource.getRepository(Book).findOne({
        where: {
          id: parseInt(bookID),
        },
      });

      review.stars = stars;
      review.description = description;
      review.user = user;
      review.book = book;
      await AppDataSource.manager.save(review);

      return res.json(review).status(201);
    } catch (error) {
      next(error);
    }
  }
  static async bookExists(id: number) {
    const book = await AppDataSource.getRepository(Book).findOne({
      select: ["id"],
      where: {
        id: id,
      },
    });

    if (book != null) {
      return true;
    }

    return false;
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewID } = req.params;
      const { stars, description } = req.body;
      const review = await AppDataSource.getRepository(Review).findOne({
        where: {
          id: parseInt(reviewID),
          user: { id: parseInt(req["user"]["id"]) },
        },
      });

      if (!review) {
        throw new ReviewNotFoundError();
      }

      if (stars !== undefined) review.stars = stars;
      if (description !== undefined) review.description = description;

      await AppDataSource.manager.save(review);

      return res.json(review).status(200);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewID } = req.params;
      const review = await AppDataSource.getRepository(Review).findOne({
        where: {
          id: parseInt(reviewID),
          user: { id: parseInt(req["user"]["id"]) },
        },
      });

      if (!review) {
        throw new ReviewNotFoundError();
      }

      await AppDataSource.manager.remove(review);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
