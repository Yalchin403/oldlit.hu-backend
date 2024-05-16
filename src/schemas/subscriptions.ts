import Joi from "joi";

export const subscriptionSchema = Joi.object({
  bookID: Joi.number().description("ID of the book to subscribe").required(),
  packageID: Joi.number()
    .description("ID of the package to subscribe")
    .required(),
});
