const prisma = require("../../db/prismaClient")
const fs = require("fs")
const path = require("path")
const uploadToSupabase = require("../../utils/supabase/uploadToSupabase")
const deleteFromSupabase = require("../../utils/supabase/deleteToSupabase.js")

const createMaterial = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            category,
            subcategory,
            subjectId,
            url
        } = req.body

        if (!title || !type || !category || !subjectId) {
            return res.status(400).json({
                message: "Заполните обязательные поля"
            })
        }

        let fileUrl = null
        let fileName = null

        if (req.file) {
            const uploadResult = await uploadToSupabase(req.file)

            fileUrl = uploadResult.url

            fileName = Buffer.from(
                req.file.originalname,
                "latin1"
            ).toString("utf8")
        }

        if (type === "LINK") {
            if (!url) {
                return res.status(400).json({
                    message: "Для LINK нужен url"
                })
            }

            fileUrl = url
        }

        const material = await prisma.material.create({
            data: {
                title,
                description,
                type,
                category,
                subcategory,
                url: fileUrl,
                fileName,
                subjectId: Number(subjectId),
                authorId: req.user.sub
            }
        })

        res.status(201).json(material)

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Ошибка загрузки материала"
        })
    }
}

const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params

        const {
            title,
            description
        } = req.body

        const material =
            await prisma.material.findUnique({
                where: {
                    id: Number(id)
                }
            })

        if (!material) {
            return res.status(404).json({
                message:
                    "Материал не найден"
            })
        }

        let updatedUrl = material.url
        let updatedFileName =
            material.fileName

        if (req.file) {
            const uploadResult =
                await uploadToSupabase(
                    req.file
                )

            updatedUrl =
                uploadResult.url

            updatedFileName =
                Buffer.from(
                    req.file.originalname,
                    "latin1"
                ).toString("utf8")
        }

        const updatedMaterial =
            await prisma.material.update({
                where: {
                    id: Number(id)
                },
                data: {
                    title:
                        title ||
                        material.title,
                    description:
                        description ||
                        material.description,
                    url: updatedUrl,
                    fileName:
                    updatedFileName
                }
            })

        res.json(updatedMaterial)

    } catch (err) {
        console.log(err)

        res.status(500).json({
            message:
                "Ошибка обновления материала"
        })
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
        const { category } = req.query

        const materials = await prisma.material.findMany({
            where: {
                subjectId: Number(subjectId),
                isPublished: true,
                ...(category && { category })
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

const downloadMaterial = async (req, res) => {
    try {
        const { id } = req.params

        const material = await prisma.material.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!material) {
            return res.status(404).json({
                message: "Материал не найден"
            })
        }

        return res.redirect(
            `${material.url}?download=${encodeURIComponent(
                material.fileName || material.title
            )}`
        )

    } catch (err) {
        console.log(err)

        res.status(500).json({
            message: "Ошибка скачивания"
        })
    }
}

module.exports = {
    createMaterial,
    getAllMaterials,
    getMaterialsBySubject,
    deleteMaterial,
    downloadMaterial,
    updateMaterial
}