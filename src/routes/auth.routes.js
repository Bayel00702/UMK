const express = require("express")
const router = express.Router()
const prisma = require("../db/prismaClient")
const { hashToken, generateRefreshToken } = require("../utils/refresh")
const { registerUser, loginUser } = require("../controllers/auth/auth")
const jwt = require("jsonwebtoken")


const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken || typeof refreshToken !== "string") {
            return res.status(401).json({ message: "Нет refresh token" })
        }

        const tokenHash = hashToken(refreshToken)

        const storedToken = await prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true }
        })

        if (!storedToken) {
            return res.status(403).json({ message: "Невалидный refresh token" })
        }

        if (storedToken.revokedAt) {
            return res.status(403).json({ message: "Token revoked" })
        }

        if (storedToken.expiresAt < new Date()) {
            return res.status(403).json({ message: "Token expired" })
        }

        // ROTATION (secure)
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: {
                revokedAt: new Date()
            }
        })

        const newRefreshToken = generateRefreshToken()
        const newHash = hashToken(newRefreshToken)

        await prisma.refreshToken.create({
            data: {
                userId: storedToken.userId,
                tokenHash: newHash,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        })

        const accessToken = jwt.sign(
            { sub: storedToken.user.id, role: storedToken.user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        )

        return res.json({
            accessToken,
            refreshToken: newRefreshToken
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Refresh error" })
    }
}

router.post("/register", registerUser)
router.post("/login", loginUser)

// refresh endpoint
router.post("/refresh", refresh)

module.exports = router