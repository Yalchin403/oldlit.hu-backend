import { AppDataSource } from "../data-source";
import { Category } from "../entity/Category";


const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);

export class CategoryService {
  public async list(page: number) {
    const builder =
      AppDataSource.getRepository(Category).createQueryBuilder("category");

    // apply pagination
    const total = await builder.getCount();
    builder.offset((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    const categories = await builder.getMany();
    
    const responseBody = {
      categories: categories,
      total: total,
      page: page,
      lastPage: Math.ceil(total / ITEMS_PER_PAGE),
    };

    return responseBody;
  }
}
