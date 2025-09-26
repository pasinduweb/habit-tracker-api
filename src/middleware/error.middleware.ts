import type { NextFunction, Request, Response } from 'express';
import env from '../../env.ts';

export class APIError extends Error {
    status: number;
    name: string;
    message: string;
    constructor(message: string, name: string, status: number) {
        super();
        this.message = message;
        this.name = name;
        this.status = status;
    }
}

export const errorHandler = (err: APIError, req: Request, res: Response, next: NextFunction) => {
    // console.log(err.stack);
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
    }

    if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
    }

    return res.status(status).json({
        error: message,
        ...(env.APP_STAGE === 'dev' && {
            stack: err.stack,
            details: err.message,
        }),
    });
};
