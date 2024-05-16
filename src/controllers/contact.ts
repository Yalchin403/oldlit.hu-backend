import { Request, Response, NextFunction } from "express";
import { contactSchema } from "../schemas/contact";
import { ValidationError } from "../exceptions/core";
import { ContactService } from "../services/contact";

const service = new ContactService();

export class ContactController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      try {
        await contactSchema.validateAsync(req.body);
      } catch (error) {
        next(new ValidationError(undefined, error.message));
      }
      const { phoneNumber, isDeliverable, notes, fromAddress } = req.body;
      const userID = parseInt(req["user"]["id"]);

      const contact = await service.create(
        phoneNumber,
        isDeliverable,
        notes,
        fromAddress,
        userID
      );
      return res.json(contact).status(201);
    } catch (error) {
      next(error);
    }
  }
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const contactID = parseInt(req.params.contactID);
      const contact = await service.get(contactID, parseInt(req["user"]["id"]));
      return res.json(contact).status(200);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page: number = parseInt(req.query.page as any) || 1;
      const responseBody = await service.list(req["user"]["id"], page);

      return res.json(responseBody).status(200);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const contactID = parseInt(req.params.contactID);
      const { phoneNumber, isDeliverable, notes, fromAddress } = req.body;
      const userID = parseInt(req["user"]["id"]);
      
      const contact = await service.update(
        contactID,
        phoneNumber,
        isDeliverable,
        notes,
        fromAddress,
        userID
      );
      return res.json(contact).status(200);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const contactID = parseInt(req.params.contactID);
      const userID = parseInt(req["user"]["id"]);
      await service.delete(contactID, userID);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
