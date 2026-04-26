const prisma = require("../../db/prismaClient")

const createSubject = async (req, res) => {
    try {
        const { title, description } = req.body

        if (!title) {
            return res.status(400).json({ message: "Название обязательно" })
        }

        const exists = await prisma.subject.findUnique({
            where: { title }
        })

        if (exists) {
            return res.status(400).json({ message: "Такой предмет уже существует" })
        }

        const subject = await prisma.subject.create({
            data: {
                title,
                description
            }
        })

        res.json(subject)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка создания предмета" })
    }
}

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany({
            include: {
                _count: {
                    select: { materials: true }
                }
            }
        })

        res.json(subjects)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка получения предметов" })
    }
}

const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params

        const subject = await prisma.subject.findUnique({
            where: { id: Number(id) },
            include: {
                materials: {
                    where: { isPublished: true },
                    orderBy: { createdAt: "desc" }
                }
            }
        })

        if (!subject) {
            return res.status(404).json({ message: "Предмет не найден" })
        }

        res.json(subject)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка получения предмета" })
    }
}

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params

        const subject =
            await prisma.subject.findUnique({
                where: {
                    id: Number(id)
                }
            })

        if (!subject) {
            return res.status(404).json({
                message:
                    "Предмет не найден"
            })
        }

        await prisma.material.deleteMany({
            where: {
                subjectId: Number(id)
            }
        })

        await prisma.subject.delete({
            where: {
                id: Number(id)
            }
        })

        res.json({
            message:
                "Предмет удален"
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
            message:
                "Ошибка удаления предмета"
        })
    }
}

module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    deleteSubject,
}