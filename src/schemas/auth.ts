import Joi from "joi";

export const authSigninSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required(),
});

export const authSignUpSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password1: Joi.string()
    .required()
    .min(6)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .message(
      "Password must contain at least one lowercase letter, one uppercase letter, and one special character."
    ),
  password2: Joi.string()
    .required()
    .min(6)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .message(
      "Password must contain at least one lowercase letter, one uppercase letter, and one special character."
    )
    .valid(Joi.ref("password1")),
});
