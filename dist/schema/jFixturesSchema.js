"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
exports.jFixturesSchema = Joi.object().keys({
    entity: Joi.string()
        .min(1)
        .required(),
    parameters: Joi.object(),
    processor: Joi.string(),
    items: Joi.object().required(),
});
//# sourceMappingURL=jFixturesSchema.js.map