import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category";

const service = new CategoryService();

export class CategoryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = parseInt(req.query.page as any) || 1;
      const responseBody = await service.list(page);
      return res.json(responseBody).status(200);
    } catch (error) {
      next(error);
    }
  }
}
