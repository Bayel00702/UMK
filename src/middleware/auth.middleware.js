const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ message: "Нет токена" })
        }

        // "Bearer TOKEN"
        const token = authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json({ message: "Токен отсутствует" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {
        return res.status(401).json({ message: "Неверный или просроченный токен" })
    }
}

module.exports = authMiddleware