const prisma = require("../../db/prismaClient")


const markMaterialProgress = async (req, res) => {
    try {
        const userId = Number(
            req.user?.sub
        )
        const materialId = Number(req.params.id)

        if (!userId) {
            return res.status(401).json({
                message: "Пользователь не найден"
            })
        }

        const material = await prisma.material.findUnique({
            where: {
                id: materialId
            }
        })

        if (!material) {
            return res.status(404).json({
                message: "Материал не найден"
            })
        }

        const existing =
            await prisma.materialProgress.findFirst({
                where: {
                    userId,
                    materialId
                }
            })

        if (existing) {
            return res.json(existing)
        }

        const progress =
            await prisma.materialProgress.create({
                data: {
                    userId,
                    materialId,
                    progress: 100,
                    completed: true,
                    timeSpent: 45
                }
            })

        res.json(progress)

    } catch (error) {
        console.log(
            "PROGRESS ERROR:",
            error
        )

        res.status(500).json({
            message:
                "Ошибка сохранения прогресса",
            error: error.message
        })
    }
}

const getProfileStats = async (req, res) => {
    try {
        const userId = Number(
            req.user.sub
        )

        const totalMaterials =
            await prisma.material.count()

        const completedMaterials =
            await prisma.materialProgress.count({
                where: {
                    userId,
                    completed: true
                }
            })

        const tests =
            await prisma.testResult.findMany({
                where: {
                    userId
                }
            })

        let avgScore = 0

        if (tests.length > 0) {
            avgScore = Math.round(
                tests.reduce(
                    (acc, item) =>
                        acc + item.percent,
                    0
                ) / tests.length
            )
        }

        const totalTimeResult =
            await prisma.materialProgress.aggregate({
                where: {
                    userId
                },
                _sum: {
                    timeSpent: true
                }
            })

        const totalTime =
            totalTimeResult?._sum
                ?.timeSpent || 0

        const recentMaterials =
            await prisma.materialProgress.findMany({
                where: {
                    userId
                },
                include: {
                    material: true
                },
                orderBy: {
                    updatedAt: "desc"
                },
                take: 5
            })

        return res.json({
            completedMaterials,
            totalMaterials,
            avgScore,
            totalTime,
            recentMaterials
        })

    } catch (error) {
        console.log(
            "PROFILE ERROR:",
            error
        )

        return res.status(500).json({
            message:
                "Ошибка профиля",
            error:
            error.message
        })
    }
}

const getMaterialsProgress = async (req, res) => {
    try {
        const materials = await prisma.material.findMany({
            include: {
                progress: true
            }
        })

        const formatted = materials.map(material => ({
            materialId: material.id,
            title: material.title,
            views: material.progress.length,
            uniqueUsers: new Set(
                material.progress.map(p => p.userId)
            ).size
        }))

        res.json({
            progress: formatted
        })

    } catch (error) {
        console.log("MATERIAL ANALYTICS ERROR:", error)

        res.status(500).json({
            message: "Ошибка статистики материалов"
        })
    }
}

module.exports ={
    markMaterialProgress,
    getProfileStats,
    getMaterialsProgress
}