import Joi from "joi";

export const contactSchema = Joi.object({
  phoneNumber: Joi.string().description("Phone number of the contact"),
  isDeliverable: Joi.bool().description(
    "Can you deliver the book to the reciever?"
  ),
  notes: Joi.string().description("Any additional notes about the contact"),
  fromAddress: Joi.string().description(
    "From where the reciever should pick the book"
  ),
});
