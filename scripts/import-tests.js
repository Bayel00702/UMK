const mammoth = require("mammoth")
const path = require("path")

const {
    PrismaClient
} = require("@prisma/client")

const prisma = new PrismaClient()

async function importTests() {

    const filePath = path.join(
        __dirname,
        "../tests/lecture1.docx"
    )

    const result =
        await mammoth.extractRawText({
            path: filePath
        })

    const text = result.value
    console.log(
        text.slice(-5000)
    )

    // =========================
    // Берем только тесты
    // =========================

    const testsOnly =
        text.split(
            "КЛЮЧИ К ТЕСТАМ"
        )[0]


    // =========================
    // Ключи
    // =========================

    const keysSection =
        text.match(
            /КЛЮЧИ К ТЕСТАМ[\s\S]*?СИТУАЦИОННЫЕ/s
        )?.[0]

    if (!keysSection) {
        console.log(
            "Ключи не найдены"
        )

        return
    }

    const keyLines =
        keysSection
            .split("\n")
            .filter(line =>
                line.includes("1-")
            )

    // =========================
    // QUESTION REGEX
    // =========================

    const questionRegex =
        /(\d+)\.\s*(.*?)A\)(.*?)B\)(.*?)C\)(.*?)(?=\d+\.|$)/gs

    const allQuestions = [
        ...testsOnly.matchAll(
            questionRegex
        )
    ]

    const variants = {
        1: allQuestions.slice(0, 20),
        2: allQuestions.slice(20, 40),
        3: allQuestions.slice(40, 60)
    }

    // =========================
    // IMPORT VARIANTS
    // =========================

    await prisma.question.deleteMany({
        where: {
            testTitle: "Лекция 1"
        }
    })

    for (
        let variantIndex = 1;
        variantIndex <= 3;
        variantIndex++
    ) {

        const questions =
            variants[variantIndex]

        console.log(
            `Вариант ${variantIndex}:`,
            questions.length
        )

        const currentKeys =
            keyLines[
            variantIndex - 1
                ]

        const answerRegex =
            /(\d+)-([A-C])/g

        const answersMap = {}

        ;[
            ...currentKeys.matchAll(
                answerRegex
            )
        ].forEach(match => {

            answersMap[
                match[1]
                ] = match[2]
        })

        for (const q of questions) {

            const number = q[1]

            const questionText =
                q[2].trim()

            const optionA =
                q[3].trim()

            const optionB =
                q[4].trim()

            const optionC =
                q[5].trim()

            const correct =
                answersMap[number]

            const createdQuestion =
                await prisma.question.create({
                    data: {

                        text:
                        questionText,

                        testTitle:
                            "Лекция 1",

                        testType:
                            "TEST",

                        subjectId: 1,

                        variant:
                        variantIndex,

                        answers: {
                            create: [
                                {
                                    text:
                                    optionA,

                                    isCorrect:
                                        correct ===
                                        "A"
                                },

                                {
                                    text:
                                    optionB,

                                    isCorrect:
                                        correct ===
                                        "B"
                                },

                                {
                                    text:
                                    optionC,

                                    isCorrect:
                                        correct ===
                                        "C"
                                }
                            ]
                        }
                    }
                })

            console.log(
                `Добавлен [V${variantIndex}]`,
                createdQuestion.text
            )
        }
    }
    await prisma.question.deleteMany({
        where: {
            testTitle: "Лекция 1",
            testType: "SITUATION"
        }
    })

    // =========================
// СИТУАЦИОННЫЕ ЗАДАЧИ
// =========================

    const situationsParts =
        text.split(
            "СИТУАЦИОННЫЕ ЗАДАЧИ"
        )

    const situationsPart =
        situationsParts[
        situationsParts.length - 1
            ]
    console.log(
        situationsPart?.slice(0, 3000)
    )

    if (situationsPart) {

        const situationTitles = [
            ...situationsPart.matchAll(
                /ЗАДАЧА\s+\d+\s+([\s\S]*?)(?=ЗАДАЧА\s+\d+|При сушке|Овощи|$)/g
            )
        ]

        const situationTexts = [
            ...situationsPart.matchAll(
                /(При сушке[\s\S]*?|Овощи[\s\S]*?)(?=При сушке|Овощи|ОТВЕТЫ К СИТУАЦИОННЫМ ЗАДАЧАМ|$)/g
            )
        ]


        console.log(
            "Найдено задач:",
            situationTexts.length
        )

        for (let i = 0;
             i < situationTexts.length;
             i++) {

            const title =
                situationTitles[i]?.[1]?.trim() ||
                `Задача ${i + 1}`

            const body =
                situationTexts[i]?.[1]?.trim()

            const formattedBody =
                body
                    ?.replaceAll(
                        "Вопросы:",
                        "\n\nВопросы:\n"
                    )
                    ?.replaceAll(
                        "1.",
                        "\n1."
                    )
                    ?.replaceAll(
                        "2.",
                        "\n2."
                    )
                    ?.replaceAll(
                        "3.",
                        "\n3."
                    )

            const cleanTitle =
                title.replace(
                    /^\d+\.\s*/,
                    ""
                )

            const situationText =
                `${i + 1}. ${cleanTitle}

            ${formattedBody}`

            await prisma.question.create({
                data: {

                    text:
                    situationText,

                    testTitle:
                        "Лекция 1",

                    testType:
                        "SITUATION",

                    subjectId: 1,

                    keywords: []
                }
            })

            console.log(
                "Добавлена задача"
            )
        }
    }

    console.log(
        "Импорт завершен"
    )

    process.exit()
}

importTests()