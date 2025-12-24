import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateMenuItem = [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('description').isString().optional(),
    body('price').isNumeric().withMessage('Price must be a number'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateOrder = [
    body('items').isArray().withMessage('Items must be an array'),
    body('tableId').isString().notEmpty().withMessage('Table ID is required'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateTable = [
    body('tableNumber').isNumeric().withMessage('Table number must be a number'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];