import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';
import * as yup from 'yup';

import { SurveyRepository } from '../repositories/SurveyRepositories';
import { SurveyUserRepository } from '../repositories/SurveyUserRepositories';
import { UserRepository } from '../repositories/UserRepositories';
import SendMailService from '../services/SendMailService';
import { AppError } from '../errors/AppError';


class SendMailController {
	async execute(request: Request, response: Response) {
		const { email, survey_id } = request.body;
		
		try {
			const schema = yup.object().shape({
        email: yup.string().email().required(),
				survey_id: yup.string().uuid().required()
      });
  
      await schema.validate(request.body, { abortEarly: false });

			const userRepository = getCustomRepository(UserRepository);
			const surveyRepository = getCustomRepository(SurveyRepository);
			const surveyUserRepository = getCustomRepository(SurveyUserRepository);

			const userAlreadyExists = await userRepository.findOne({ email });
			if (!userAlreadyExists) {
				throw new AppError('User does not exists!');
			}

			const surveyAlreadyExists = await surveyRepository.findOne({ id: survey_id });
			if (!surveyAlreadyExists) {
				throw new AppError('Survey does not exists!');
			}

			const surveyUserAlreadyExists = await surveyUserRepository.findOne({
				where: { user_id: userAlreadyExists.id, value: null },
				relations: ['user', 'survey']
			});

			const variabels = {
				name: userAlreadyExists.name,
				title: surveyAlreadyExists.title,
				description: surveyAlreadyExists.description,
				id: '',
				link: process.env.URL_MAIL
			}

			const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');
			
			if (surveyUserAlreadyExists) {
				variabels.id = surveyUserAlreadyExists.id;
				await SendMailService.execute(
					email, 
					surveyAlreadyExists.title,
					variabels,
					npsPath
					);
					return response.json(surveyUserAlreadyExists);
				}
				
			const surveyUser = surveyUserRepository.create({
				user_id: userAlreadyExists.id,
				survey_id,
			});
				
			await surveyUserRepository.save(surveyUser);

			variabels.id = surveyUser.id;
			await SendMailService.execute(
				email, 
				surveyAlreadyExists.title, 
				variabels, 
				npsPath
			);

			return response.json(surveyUser);
		} catch (error) {
			throw new AppError(error);
		}
	}
}

export { SendMailController };