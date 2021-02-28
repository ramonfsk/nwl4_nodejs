import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as yup from 'yup';
import { AppError } from '../errors/AppError';

import { SurveyRepository } from '../repositories/SurveyRepositories';


class SurveyController {
	async create(request: Request, response: Response) {
    const { title, description } = request.body;
    
    try {
      const schema = yup.object().shape({
        title: yup.string().required(),
        description: yup.string().required()
      });
  
      await schema.validate(request.body, { abortEarly: false });
  
      const surveyRepository = getCustomRepository(SurveyRepository);

      const surveyAlreadyExists = await surveyRepository.findOne({
        title
      });

      if (surveyAlreadyExists) {
        throw new AppError('Survey already exists!');
      }

      const survey = surveyRepository.create({
        title, description
      });

      await surveyRepository.save(survey);
  
      return response.status(201).json(survey);
    } catch (error) {
      throw new AppError(error);
    }
  };

	async show(_: Request, response: Response) {
    try {
      const surveyRepository = getCustomRepository(SurveyRepository);

			const all = await surveyRepository.find();

			return response.json(all);
		} catch (error) {
      throw new AppError(error);
		}
	};
};

export { SurveyController };