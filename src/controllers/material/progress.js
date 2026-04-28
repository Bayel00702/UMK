


const markMaterialProgress = async (
    req,
    res
) => {
    try {
        const userId = req.user.id
        const materialId = Number(
            req.params.id
        )

        const existing =
            await prisma.materialProgress.findUnique({
                where: {
                    userId_materialId: {
                        userId,
                        materialId
                    }
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
        res.status(500).json({
            message:
                "Ошибка сохранения прогресса"
        })
    }
}

const getProfileStats = async (
    req,
    res
) => {
    try {
        const userId = req.user.id

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
                where: { userId }
            })

        const avgScore =
            tests.length > 0
                ? tests.reduce(
                (acc, item) =>
                    acc +
                    item.percent,
                0
            ) / tests.length
                : 0

        const totalTime =
            await prisma.materialProgress.aggregate({
                where: {
                    userId
                },
                _sum: {
                    timeSpent: true
                }
            })

        const recentMaterials =
            await prisma.materialProgress.findMany({
                where: { userId },
                include: {
                    material: true
                },
                orderBy: {
                    updatedAt: "desc"
                },
                take: 5
            })

        res.json({
            completedMaterials,
            totalMaterials,
            avgScore:
                Math.round(avgScore),
            totalTime:
                totalTime._sum
                    .timeSpent || 0,
            recentMaterials
        })

    } catch (error) {
        res.status(500).json({
            message:
                "Ошибка профиля"
        })
    }
}

module.exports ={
    markMaterialProgress,
    getProfileStats,
}