const Joi=require("joi")
//vo schema likhojisme hum validate karna hai
module.exports. listingSchema=Joi.object({
    listing:Joi.object({// har schema ke under isting object honga jab bhi request aaye to usme listing object hona hi chaiye
        title:Joi.string().required(),
        description:Joi.string().required(),//ab listig object mein bhi bahutt sare  object hai jaise title ,description
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.string().allow("",null)//image is allowable for empty string and null value

    }).required()
})//joi ke under ek ya bhauttt sare object aana chaiye  obejct aana chauye us object ka naam listing hona chaiye 


module.exports.reviewSchema=Joi.object({
    review:Joi.object({//har reviewSchema ke under review object hona hi chaiye  or review bhi ek object hai 
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),

    }).required()
})