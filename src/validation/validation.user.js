const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

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

const materialValidation = [
    body("title", "Название обязательно")
        .isString()
        .isLength({ min: 3, max: 100 }),

    body("description")
        .optional()
        .isString()
        .isLength({ max: 500 }),

    body("type", "Тип файла обязателен")
        .isIn(["PDF", "DOC", "XLS", "VIDEO", "IMAGE", "LINK"]),

    body("url", "Ссылка обязательна")
        .isURL(),

    body("subject")
        .optional()
        .isString(),

    body("isPublished")
        .optional()
        .isBoolean(),
];

module.exports = {
    registerUserValidation,
    loginUserValidation,
    handleValidationErrors,
    materialValidation
};