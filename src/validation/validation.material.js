const { body } = require("express-validator")

const createMaterialValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Название обязательно"),

    body("type")
        .notEmpty()
        .withMessage("Тип файла обязателен")
        .isIn([
            "PDF",
            "DOC",
            "XLS",
            "PRESENTATION",
            "VIDEO",
            "IMAGE",
            "LINK",
            "METHODICAL"
        ])
        .withMessage("Неверный тип файла"),


    body("subjectId")
        .notEmpty()
        .withMessage("subjectId обязателен")
        .isNumeric()
        .withMessage("subjectId должен быть числом"),

    body("category")
        .notEmpty()
        .withMessage("Категория обязательна")
        .isIn([
            "LECTURE",
            "LAB",
            "PRACTICE",
            "SRS",
            "LITERATURE",
            "SYLLABUS"
        ])
        .withMessage("Неверная категория"),
    body("subcategory")
        .optional()
        .isString()
        .withMessage("Подкатегория должна быть строкой"),
    body("url")
        .if(body("type").equals("LINK"))
        .notEmpty()
        .withMessage("URL обязателен для LINK")
]

module.exports = {
    createMaterialValidation
}