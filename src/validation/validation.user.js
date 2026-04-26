const { body } = require("express-validator");


const registerUserValidation = [
    body("email", "Неверный формат почты").isEmail().normalizeEmail(),

    body("password", "Пароль должен быть минимум 8 символов")
        .isLength({ min: 8 })
        .trim(),

    body("name", "Укажите имя")
        .isString()
        .isLength({ min: 2, max: 50 })
        .trim(),

    body("phone", "Неверный номер телефона")
        .isString()
        .isLength({ min: 6, max: 20 })
        .optional(),

    body("role")
        .optional()
        .isIn(["ADMIN", "USER"])
        .withMessage("Недопустимая роль"),

    body("image")
        .optional()
        .isURL()
        .withMessage("Фото должно быть ссылкой"),
];

const loginUserValidation = [
    body("email", "Неверный формат электронной почты").isEmail(),
    body("password", "Пароль должен быть минимум 8 символов").isLength({ min: 8 }),
];

module.exports = {
    registerUserValidation,
    loginUserValidation,
};