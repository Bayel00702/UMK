const express = require("express")
const router = express.Router()

const { submitTest } = require("../controllers/test/test")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/submit", authMiddleware, submitTest)

module.exports = router