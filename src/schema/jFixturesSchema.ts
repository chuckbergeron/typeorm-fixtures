import * as Joi from 'joi';

export const jFixturesSchema = Joi.object().keys({
    entity: Joi.string()
        .min(1)
        .required(),
    parameters: Joi.object(),
    processor: Joi.string(),
    items: Joi.object().required(),
});
