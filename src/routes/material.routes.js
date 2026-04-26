const express = require("express")
const router = express.Router()
const upload = require("../utils/multer")

const {
    createMaterial,
    getAllMaterials,
    getMaterialsBySubject,
    deleteMaterial,
    downloadMaterial
} = require("../controllers/material/material")

const authMiddleware = require("../middleware/auth.middleware")
const roleMiddleware = require("../middleware/role.middleware")

const { createMaterialValidation } = require("../validation/validation.material")
const { handleValidationErrors } = require("../validation/handleValidationErrors")


// все могут смотреть
router.get("/", getAllMaterials)
router.get("/subject/:subjectId", getMaterialsBySubject)

// только ADMIN
router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    upload.single("file"),
    createMaterialValidation,
    handleValidationErrors,
    createMaterial
)

router.get(
    "/download/:id",
    downloadMaterial
)

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deleteMaterial
)

module.exports = router