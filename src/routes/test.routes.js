const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const roleMiddleware = require("../middleware/role.middleware")

const {
    createQuestion,
    getQuestionsBySubject,
    submitTest,
    getUserResults,
    getAnalytics
} = require("../controllers/test/test")

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createQuestion
)

router.get(
    "/subject/:subjectId",
    authMiddleware,
    getQuestionsBySubject
)

router.post(
    "/submit",
    authMiddleware,
    submitTest
)

router.get(
    "/my-results",
    authMiddleware,
    getUserResults
)

router.get(
    "/analytics",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    getAnalytics
)

module.exports = router