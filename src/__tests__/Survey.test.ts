import request from 'supertest';
import { getConnection } from 'typeorm';

import { app } from '../app';
import createConnection from '../db';

describe('Survey', async () => {
	beforeAll(async () => {
		const connection = await createConnection();
		await connection.runMigrations();
	});

	afterAll(async () => {
		const connection = getConnection();
		await connection.dropDatabase();
		await connection.close();
	});

	it('Should be able to create a new survey', async () => {
		const response = await request(app).post('/surveys')
		.send({
			title: 'title',
			description: 'description'
		});
		expect(response.status).toBe(201);
	});

	it('Should not be able to create a survey with exists title', async () => {
		const response = await request(app).post('/surveys')
		.send({
			title: 'title',
			description: 'description'
		});
		expect(response.status).toBe(400);
	});

	it('Should be able to get all surveys', async () => {
		await request(app).post('/surveys')
		.send({
			title: 'title',
			description: 'description'
		});

		const response = await request(app).get('/surveys');

		expect(response.body.length).toBe(1);
	});
});