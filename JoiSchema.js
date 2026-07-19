const Joi = require("joi");



module.exports.schema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object({
      filename: Joi.string().allow("", null),
      url: Joi.string().allow("", null),
    }),

    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});

//* reviews schema for server side validation

module.exports.reviewJoiSchema=Joi.object({
  review: Joi.object(
    //* je pan request yenar tyach review object asaylach pahije
    { rating: Joi.number().required().min(1).max(5) ,
      comment:Joi.string().required()

    },
  ).required(),
});
