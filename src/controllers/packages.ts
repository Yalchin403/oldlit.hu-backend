import { Request, Response, NextFunction } from "express";
import { initializeLogger } from "../utils/inti-logger";
import { PackageService } from "../services/package";

const logger = initializeLogger();
const service = new PackageService();

export class PackageController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Listing packages for user: ", req["user"]["id"]);
      const packages = await service.list();

      return res.json(packages).status(200);
    } catch (error) {
      next(error);
    }
  }
}
