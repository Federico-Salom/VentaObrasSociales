import "dotenv/config"
import express from "express"
import cors from "cors"
import nodemailer from "nodemailer"

const app = express()
const PORT = process.env.PORT || 3000
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "federicosalom@proton.me"

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://www.flexviasano.com.ar",
  "https://flexviasano.com.ar",
]

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
      return cb(new Error("Origen no permitido por CORS"))
    },
  })
)
app.use(express.json())

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "flexviasano api ok" })
})

app.post("/api/lead", async (req, res) => {
  try {
    const { dni, telefono, preferencia, localidad, mensaje } = req.body || {}

    if (!dni || !telefono || !preferencia || !localidad) {
      return res.status(400).json({ ok: false, error: "Faltan datos obligatorios" })
    }
    const html = `
      <h2>Nuevo lead FlexViasano</h2>
      <p><strong>DNI/CUIL:</strong> ${dni}</p>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      <p><strong>Preferencia:</strong> ${preferencia}</p>
      <p><strong>Localidad:</strong> ${localidad}</p>
      <p><strong>Mensaje:</strong> ${mensaje || "-"}</p>
    `

    await transporter.sendMail({
      from: `"FlexViasano" <${process.env.SMTP_USER}>`,
      to: CONTACT_EMAIL,
      subject: "Nuevo lead desde la web",
      html,
    })

    return res.json({ ok: true })
  } catch (err) {
    console.error("Error enviando lead", err)
    return res.status(500).json({ ok: false, error: "Error interno" })
  }
})

app.listen(PORT, () => {
  console.log(`API FlexViasano escuchando en puerto ${PORT}`)
})
