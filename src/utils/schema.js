import Joi from 'joi'

const emailSchema = Joi.object().keys({
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    content: Joi.string().required(),
    html: Joi.boolean().optional().default(false)
})

let availabilityStatus = Joi.object().keys({
    temp: Joi.string().required(),
    status: Joi.boolean().optional().default(false)
  })

const availabilitySchema = Joi.object().keys({
    jour: Joi.string().required(),
    status: Joi.array().items(availabilityStatus),
    userId: Joi.string().required()
})

const userBankDetailsSchema = Joi.object().keys({
    name: Joi.string().required(),
    iban: Joi.string().required(),
    userId: Joi.string().required(),
    type: Joi.string().optional().default('ins')
})

export const ValidationSchema = {
    emailSchema,
    availabilitySchema,
    userBankDetailsSchema
}