import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as yup from 'yup';
import { AppError } from '../errors/AppError';

import { UserRepository } from '../repositories/UserRepositories';

class UserController {
  async create(request: Request, response: Response) {
    const { name, email } = request.body;

    try {
      const schema = yup.object().shape({
        name: yup.string().required(),
        email: yup.string().email().required()
      });
  
      await schema.validate(request.body, { abortEarly: false });
      
      const userRepository = getCustomRepository(UserRepository);
      const userAlreadyExists = await userRepository.findOne({
        email
      });

      if (userAlreadyExists) {
        throw new AppError('User already exists!');
      }

      const user = userRepository.create({
        name, email
      });

      await userRepository.save(user);
  
      return response.status(201).json(user);
    } catch (error) {
      throw new AppError(error);
    }
  }
}

export { UserController };
