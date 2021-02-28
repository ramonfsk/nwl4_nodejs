import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import createConnection from './db';
import { router } from './routers';
import { AppError } from './errors/AppError';

createConnection();
const app = express();

app.use(express.json());
app.use(router);

app.use(
	(error: Error, _: Request, response: Response, _next: NextFunction) => {
		if (error instanceof AppError) {
			return response.status(error.statusCode).json({
				message: error.message
			})
		}

		return response.status(500).json({
			status: 'Error',
			message: `Internal server error: ${error.message}`
		});
	}
);

export { app };