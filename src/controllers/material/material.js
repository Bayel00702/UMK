const prisma = require("../../db/prismaClient")
const fs = require("fs")
const path = require("path")
const uploadToSupabase = require("../../utils/supabase/uploadToSupabase")
const deleteFromSupabase = require("../../utils/supabase/deleteToSupabase")

const createMaterial = async (req, res) => {
    try {
        const { title, description, type, subjectId } = req.body

        if (!title || !type || !subjectId) {
            return res.status(400).json({ message: "Заполните поля" })
        }

        let fileUrl = null

        if (req.file) {
            fileUrl = await uploadToSupabase(req.file)
        }

        const material = await prisma.material.create({
            data: {
                title,
                description,
                type,
                url: fileUrl,
                subjectId: Number(subjectId),
                authorId: req.user.sub
            }
        })

        res.json(material)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка загрузки материала" })
    }
}

const getAllMaterials = async (req, res) => {
    try {
        const materials = await prisma.material.findMany({
            include: {
                subject: true,
                author: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        res.json(materials)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка получения материалов" })
    }
}

const getMaterialsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params

        const materials = await prisma.material.findMany({
            where: {
                subjectId: Number(subjectId),
                isPublished: true
            },
            orderBy: { createdAt: "desc" }
        })

        res.json(materials)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка получения материалов" })
    }
}

const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params

        const material = await prisma.material.findUnique({
            where: { id: Number(id) }
        })

        if (!material) {
            return res.status(404).json({ message: "Материал не найден" })
        }

        if (material.url) {
            await deleteFromSupabase(material.url)
        }

        await prisma.material.delete({
            where: { id: Number(id) }
        })

        res.json({ message: "Материал и файл удалены" })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Ошибка удаления" })
    }
}

module.exports = {
    createMaterial,
    getAllMaterials,
    getMaterialsBySubject,
    deleteMaterial
}