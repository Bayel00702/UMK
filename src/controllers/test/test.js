const prisma = require("../../db/prismaClient")

const submitTest = async (req, res) => {
    try {
        const userId = req.user.sub
        const { answers, subjectId } = req.body

        if (!answers || !answers.length) {
            return res.status(400).json({ message: "Нет ответов" })
        }

        let correct = 0

        for (const item of answers) {
            const answer = await prisma.answer.findUnique({
                where: { id: item.answerId }
            })

            if (answer && answer.isCorrect) {
                correct++
            }
        }

        const total = answers.length
        const percent = (correct / total) * 100

        const result = await prisma.testResult.create({
            data: {
                userId,
                subjectId,
                score: correct,
                total,
                percent
            }
        })

        return res.json({
            correct,
            total,
            percent,
            resultId: result.id
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка теста" })
    }
}

module.exports = { submitTest }