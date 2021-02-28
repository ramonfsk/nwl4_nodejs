import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as yup from 'yup';

import { AppError } from '../errors/AppError';
import { SurveyUserRepository } from '../repositories/SurveyUserRepositories';

class AnswerController {
	async execute(request: Request, response: Response) {
		const { value } = request.params;
		const { u } = request.query;

		try {
			const schema = yup.object().shape({
        value: yup.number().required(),
        u: yup.string().uuid().required()
      });
  
      await schema.validate(request.body, { abortEarly: false });

			const surveyUserRepository = getCustomRepository(SurveyUserRepository);

			const surveyUser = await surveyUserRepository.findOne({
				id: String(u)
			});

			if (!surveyUser) {
				throw new AppError('Survey for User does not exists!');
			}

			surveyUser.value = Number(value);

			await surveyUserRepository.save(surveyUser);

			return response.json(surveyUser);
		} catch (error) {
			throw new AppError(error);
		}
	}
}

export { AnswerController };