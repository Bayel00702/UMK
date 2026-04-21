require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes')
const subjectRoutes = require('./routes/subject.routes')
const materialRoutes = require('./routes/material.routes')
const path = require("path")

const api = express()

api.use(cors())
api.use(express.json())

api.use("/auth", authRoutes)
api.use("/subjects", subjectRoutes)
api.use("/materials", materialRoutes)

api.use("/uploads", express.static(path.join(__dirname, "uploads")))

module.exports = api;