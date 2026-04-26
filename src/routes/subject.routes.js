const express = require("express")
const router = express.Router()

const {
    createSubject,
    getAllSubjects,
    getSubjectById,
    deleteSubject,
} = require("../controllers/subject/subject")

const authMiddleware = require("../middleware/auth.middleware")
const roleMiddleware = require("../middleware/role.middleware")

//  все могут смотреть предметы
router.get("/", getAllSubjects)
router.get("/:id", getSubjectById)

//  только ADMIN создаёт предмет
router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createSubject
)

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deleteSubject
)

module.exports = router