const prisma = require("../../db/prismaClient")


// ADMIN - создание вопроса
const createQuestion = async (req, res) => {
    try {
        const {
            text,
            testTitle,
            subjectId,
            answers
        } = req.body

        if (
            !text ||
            !testTitle ||
            !subjectId ||
            !answers ||
            answers.length < 2
        ) {
            return res.status(400).json({
                message:
                    "Заполните все поля"
            })
        }

        const hasCorrectAnswer =
            answers.some(
                answer =>
                    answer.isCorrect
            )

        const hasEmptyAnswers =
            answers.some(
                answer =>
                    !answer.text ||
                    answer.text.trim() === ""
            )

        if (hasEmptyAnswers) {
            return res.status(400).json({
                message:
                    "Все варианты ответа должны быть заполнены"
            })
        }

        if (!hasCorrectAnswer) {
            return res.status(400).json({
                message:
                    "Укажите правильный ответ"
            })
        }

        const question =
            await prisma.question.create({
                data: {
                    text,
                    testTitle,
                    subjectId: Number(
                        subjectId
                    ),
                    answers: {
                        create: answers.map(
                            answer => ({
                                text: answer.text,
                                isCorrect:
                                answer.isCorrect
                            })
                        )
                    }
                },
                include: {
                    answers: true
                }
            })

        res.status(201).json(
            question
        )

    } catch (err) {
        console.log(err)

        res.status(500).json({
            message:
                "Ошибка создания вопроса"
        })
    }
}



// USER - получить тесты по предмету
const getQuestionsBySubject =
    async (req, res) => {
        try {
            const { subjectId } =
                req.params

            const questions =
                await prisma.question.findMany(
                    {
                        where: {
                            subjectId:
                                Number(
                                    subjectId
                                )
                        },
                        include: {
                            answers: {
                                select: {
                                    id: true,
                                    text: true
                                }
                            }
                        }
                    }
                )

            res.json(questions)

        } catch (err) {
            console.log(err)

            res.status(500).json({
                message:
                    "Ошибка получения тестов"
            })
        }
    }



// USER - отправка теста
const submitTest = async (
    req,
    res
) => {
    try {
        const {
            subjectId,
            testTitle,
            answers
        } = req.body

        const questions =
            await prisma.question.findMany({
                where: {
                    subjectId: Number(subjectId),
                    testTitle: testTitle
                },
                include: {
                    answers: true
                }
            })

        if (!questions.length) {
            return res.status(400).json({
                message:
                    "Для этого предмета нет тестов"
            })
        }

        let score = 0

        questions.forEach(question => {
            const correctAnswer =
                question.answers.find(
                    answer => answer.isCorrect
                )

            const userAnswer =
                answers.find(
                    item =>
                        item.questionId === question.id
                )

            if (
                userAnswer &&
                userAnswer.answerId ===
                correctAnswer?.id
            ) {
                score++
            }
        })

        const total =
            questions.length

        const percent =
            total > 0
                ? (
                    (score /
                        total) *
                    100
                ).toFixed(2)
                : 0


        await prisma.testResult.deleteMany({
            where: {
                userId: req.user.sub,
                subjectId: Number(subjectId),
                testTitle: testTitle
            }
        })

        const result =
            await prisma.testResult.create({
                data: {
                    userId: req.user.sub,
                    subjectId: Number(subjectId),
                    testTitle,
                    score,
                    total,
                    percent: Number(percent)
                }
            })

        res.json({
            message:
                "Тест завершен",
            result
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
            message:
                "Ошибка отправки теста"
        })
    }
}



// USER - история результатов
const getUserResults =
    async (req, res) => {
        try {
            const results =
                await prisma.testResult.findMany(
                    {
                        where: {
                            userId:
                            req.user.sub
                        },
                        include: {
                            subject: true
                        },
                        orderBy: {
                            createdAt:
                                "desc"
                        }
                    }
                )

            res.json(results)

        } catch (err) {
            console.log(err)

            res.status(500).json({
                message:
                    "Ошибка получения результатов"
            })
        }
    }



// ADMIN - аналитика успеваемости
const getAnalytics =
    async (req, res) => {
        try {
            const results =
                await prisma.testResult.findMany(
                    {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            },
                            subject: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt:
                                "desc"
                        }
                    }
                )

            const totalAttempts = results.length

            const averageScore =
                totalAttempts > 0
                    ? (
                        results.reduce(
                            (
                                acc,
                                item
                            ) =>
                                acc +
                                item.percent,
                            0
                        ) /
                        totalAttempts
                    ).toFixed(2)
                    : 0

            res.json({
                totalAttempts,
                averageScore,
                results
            })

        } catch (err) {
            console.log(err)

            res.status(500).json({
                message:
                    "Ошибка аналитики"
            })
        }
    }


const deleteQuestion = async (req, res) => {
    try {
        await prisma.question.delete({
            where: {
                id: Number(req.params.id)
            }
        })

        res.json({
            message: "Удалено"
        })

    } catch (error) {
        res.status(500).json({
            message: "Ошибка удаления"
        })
    }
}

const getUsersAnalytics = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                NOT: {
                    role: "ADMIN"
                }
            },
            include: {
                testResults: true
            }
        })

        const formattedUsers = users.map(user => {
            const totalTests = user.testResults.length

            const avgScore =
                totalTests > 0
                    ? user.testResults.reduce(
                    (sum, test) => sum + test.percent,
                    0
                ) / totalTests
                    : 0

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                testsCompleted: totalTests,
                averageScore: Math.round(avgScore),
                materialsViewed: 0,
                lastActive: user.updatedAt
            }
        })

        res.json({
            users: formattedUsers
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: "Ошибка пользователей"
        })
    }
}

const getUserTestHistory = async (req, res) => {
    try {
        const userId = Number(req.params.id)

        const results =
            await prisma.testResult.findMany({
                where: {
                    userId
                },
                orderBy: {
                    createdAt: "desc"
                }
            })

        const formattedResults =
            results.map(result => ({
                id: result.id,
                title: result.testTitle,
                score: result.score,
                maxScore: result.total,
                date: result.createdAt
            }))

        res.json(formattedResults)

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: "Ошибка истории тестов"
        })
    }
}



module.exports = {
    createQuestion,
    getQuestionsBySubject,
    submitTest,
    getUserResults,
    getAnalytics,
    deleteQuestion,
    getUsersAnalytics,
    getUserTestHistory
}