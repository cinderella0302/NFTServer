import { NextFunction, Request, Response } from 'express';
import Tokens from '../models/token.model';
import { getDataFromDB, validateRequired } from '../utils';

export const getAllToken = async (
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await getDataFromDB(Tokens);
        res.status(200).send(data);
    } catch (e) {
        return next(e);
    }
};

export const getTokenById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.query;
    if (!id) return res.status(400).send({ message: 'Invalid parameter' });
    console.log('debug id', id);
    try {
        const found = await Tokens.findOne({ id });
        if (!found)
            return res.status(400).send({ message: "Token doesn't exist." });
        return res.status(200).send(found);
    } catch (err) {
        return next(err);
    }
};

export const addToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const data = req.body;
    const requiredValidationResult = validateRequired(data, ['id', 'chain']);
    if (!requiredValidationResult.status) {
        return res.status(400).send({
            type: 'Validation Error',
            missingFields: requiredValidationResult.missingFields,
        });
    }
    const { id } = data;
    try {
        const existingToken = await Tokens.findOne({ id });
        if (existingToken)
            return res.status(400).send({
                message: 'Token already exists',
            });
        const newToken = new Tokens(data);
        newToken
            .save()
            .then((saved) => res.status(200).send(saved))
            .catch((err) => next(err));
    } catch (err) {
        return next(err);
    }
};

export const updateTokenById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params;
    if (!id) return res.status(400).send({ message: 'Invalid parameter' });

    const updatedData = req.body;
    if (!updatedData) return res.status(400).send({ message: 'Invalid data' });

    try {
        const existingToken = await Tokens.findOne({ id });
        if (!existingToken)
            return res.status(400).send({
                message: "Token doesn't exist! Please add it first.",
            });
        Object.keys(updatedData).forEach((key) => {
            const value = updatedData[key];
            existingToken[key] = value;
        });

        existingToken
            .save()
            .then((saved) => res.status(200).send(saved))
            .catch((err) => next(err));
    } catch (err) {
        return next(err);
    }
};

export const deleteToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params;
    if (!id) return res.status(400).send({ message: 'Invalid parameter' });
    try {
        const deletedToken = await Tokens.findOneAndRemove({ id });
        return res
            .status(200)
            .send({ message: 'Successfully Removed', deleted: deletedToken });
    } catch (err) {
        return next(err);
    }
};
