/**
 * 1 2 3 4 5 6 7 8 9 10
 * Detratores -> 0 - 6
 * Passivos -> 7 - 8
 * Promotores -> 9 - 10
 * 
 * (Promotores - Detratores) / (Respondentes) * 100
 */

import { Request, Response } from 'express';
import { getCustomRepository, Not, IsNull } from 'typeorm';
import * as yup from 'yup';

import { AppError } from '../errors/AppError';
import { SurveyUserRepository } from '../repositories/SurveyUserRepositories';

class NpsController {
	async execute(request: Request, response: Response) {
		const { survey_id } = request.params;

		try {
			const schema = yup.object().shape({
        survey_id: yup.string().uuid().required()
      });
  
      await schema.validate(request.body, { abortEarly: false });

			const surveyUserRepository = getCustomRepository(SurveyUserRepository);

			const surveyUser = await surveyUserRepository.find({
				survey_id,
				value: Not(IsNull())
			});

			if (!surveyUser) {
				throw new AppError('Survey does not exists!');
			}

			const detractors = surveyUser.filter(
				(survey) => survey.value >= 0 && survey.value <= 6
			).length;

			const promoters = surveyUser.filter(
				(survey) => survey.value >= 9 && survey.value <= 10
			).length;

			const passives = surveyUser.filter(
				(survey) => survey.value >= 7 && survey.value <= 8
			).length;

			const totalAnswers = surveyUser.length;

			const caculate = Number(((promoters - detractors) / totalAnswers) * 100).toFixed(2);
			
			return response.json({
				detractors,
				promoters,
				passives,
				totalAnswers,
				nps: caculate
			})
		} catch (error) {
			throw new AppError(error);
		}
	}
}

export { NpsController };