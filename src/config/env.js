require('dotenv').config()

function must(name) {
    const value = process.env[name]

    if (!value) {
        console.error(`Missing ENV: ${name}`)
        process.exit(1)
    }

    return value
}

module.exports = {
    PORT: process.env.PORT || 5000,

    DATABASE_URL: must('DATABASE_URL'),
    JWT_SECRET: must('JWT_SECRET'),

    SUPABASE_URL: must('SUPABASE_URL'),
    SUPABASE_KEY: must('SUPABASE_KEY'),
}