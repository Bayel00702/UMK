const prisma = require("../../db/prismaClient")
const bcrypt = require("bcrypt")
const { generateRefreshToken, hashToken } = require("../../utils/refresh")
const jwt = require("jsonwebtoken")

const registerUser = async (req, res) => {
    try {
        const { email, password, name, surname, phone } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email и пароль обязательны" })
        }

        const exists = await prisma.user.findUnique({
            where: { email }
        })

        if (exists) {
            return res.status(400).json({ message: "Пользователь уже существует" })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                name,
                surname,
                phone,
                passwordHash
            }
        })

        const token = jwt.sign(
            { sub: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        const { passwordHash: _, ...safeUser } = user

        res.json({ user: safeUser, token })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка регистрации" })
    }
}


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email и пароль обязательны" })
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return res.status(400).json({ message: "Неверные данные" })

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return res.status(400).json({ message: "Неверные данные" })

        const accessToken = jwt.sign(
            { sub: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        )

        const refreshToken = generateRefreshToken()
        const refreshHash = hashToken(refreshToken)

        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshHash,
                expiresAt
            }
        })

        res.json({
            accessToken,
            refreshToken
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка входа" })
    }
}

module.exports = { registerUser, loginUser }