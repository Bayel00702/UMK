

const roleMiddleware = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Нет пользователя" })
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Нет доступа" })
            }

            next()
        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: "Ошибка доступа" })
        }
    }
}

module.exports = roleMiddleware