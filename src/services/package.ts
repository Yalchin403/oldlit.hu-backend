import { AppDataSource } from "../data-source";
import { logger } from "../server";
import { Package } from "../entity/Package";

export class PackageService {
  public async list() {
    logger.info("Listing packages");
    const builder =
      AppDataSource.getRepository(Package).createQueryBuilder("package_");

    return await builder.getMany();
  }
}
