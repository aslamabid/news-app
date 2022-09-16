import Joi from "joi";
import bcrypt from "bcrypt";
import CustomErrorHandler from "../service/CustomErrorHandler";
import { User } from "../models";
import UserWithOutPassword from "../Response/UserWithOutPassword";
import { comparePassword } from "../utils";

const userController = {
  async signup(req, res, next) {
    const { email, password } = req.body;

    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(20).required(),
      repeat_password: Joi.ref("password"),
    });

    const { error } = userSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      const exists = await User.exists({ email });

      if (exists) {
        return next(
          CustomErrorHandler.alreadyExists("This email is already taken")
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        email,
        password: hashedPassword,
      });

      await user.save();

      res.json({
        success: true,
        ...new UserWithOutPassword(user)
      });
    } catch (err) {
      return next(err);
    }
  },

  async login(req, res, next) {
    const { email, password } = req.body;

    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(20).required(),
    });

    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      const emailExist = await User.findOne({ email });
      console.log(emailExist);
      if (!emailExist) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      //compare password
      const match = await comparePassword(password, emailExist.password);

      if (!match) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      res.json({
        success: true,
        ...new UserWithOutPassword(emailExist)
      });
    } catch (err) {
      return next(err);
    }
  },
};

export { userController };
