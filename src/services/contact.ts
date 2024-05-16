import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { logger } from "../server";
import { Contact } from "../entity/Contact";
import { ContactNotFoundError } from "../exceptions/contact";

const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);

export class ContactService {
  public async create(
    phoneNumber: string,
    isDeliverable: boolean,
    notes: string,
    fromAddress: string,
    userID: number
  ) {
    logger.info(`Creating contact for user with ID: ${userID}`);

    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        id: userID,
      },
    });

    const contact = new Contact();
    contact.phoneNumber = phoneNumber;
    contact.isDeliverable = isDeliverable;
    contact.notes = notes;
    contact.fromAddress = fromAddress;
    contact.user = user;

    return await AppDataSource.manager.save(contact);
  }

  public async get(contactID: number, userID: number) {
    const contact = await AppDataSource.getRepository(Contact).findOne({
      where: {
        id: contactID,
        user: { id: userID },
      },
    });

    if (!contact) {
      throw new ContactNotFoundError();
    }

    return contact;
  }
  public async list(userID: number, page: number) {
    const builder =
      AppDataSource.getRepository(Contact).createQueryBuilder("contact");
    builder.where("contact.user.id = :userID", {
      userID: userID,
    });

    // apply pagination
    const total = await builder.getCount();
    builder.offset((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    const contacts = await builder.getMany();

    const responseBody = {
      contacts: contacts,
      total: total,
      page: page,
      lastPage: Math.ceil(total / ITEMS_PER_PAGE),
    };

    return responseBody;
  }

  public async update(
    contactID: number,
    phoneNumber: string,
    isDeliverable: boolean,
    notes: string,
    fromAddress: string,
    userID: number
  ) {
    const contact = await AppDataSource.getRepository(Contact).findOne({
      where: {
        id: contactID,
        user: { id: userID },
      },
    });

    if (!contact) {
      throw new ContactNotFoundError();
    }

    if (phoneNumber !== undefined) contact.phoneNumber = phoneNumber;
    if (isDeliverable !== undefined) contact.isDeliverable = isDeliverable;
    if (notes !== undefined) contact.notes = notes;
    if (fromAddress !== undefined) contact.fromAddress = fromAddress;

    return await AppDataSource.manager.save(contact);
  }

  public async delete(contactID: number, userID: number) {
    const contact = await AppDataSource.getRepository(Contact).findOne({
      where: {
        id: contactID,
        user: { id: userID },
      },
    });

    if (!contact) {
      throw new ContactNotFoundError();
    }

    return await AppDataSource.manager.remove(contact);
  }
}
