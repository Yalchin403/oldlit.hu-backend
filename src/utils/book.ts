import { AppDataSource } from "../data-source";
import { Book } from "../entity/Book";

export type PremiumBookUpdaterType = {
  bookID: number;
};

export async function turnPremiumOffForBook(bookID: number) {
  const book = await AppDataSource.getRepository(Book).findOne({
    where: {
      id: bookID,
    },
  });
  book.isPremium = false;
  book.premiumEndsAt = null;
  return await AppDataSource.manager.save(book);
}
