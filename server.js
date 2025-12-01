import express from "express"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "federicosalom@proton.me"
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
})

app.post("/api/lead", async (req, res) => {
  const { dni, telefono, preferencia, localidad, mensaje } = req.body || {}

  if (!dni || !telefono || !preferencia || !localidad) {
    return res.status(400).json({ error: "Faltan datos obligatorios" })
  }
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: "Faltan credenciales del remitente" })
  }

  try {
    await transporter.sendMail({
      from: `"Landing FlexViaSano" <${GMAIL_USER}>`,
      to: CONTACT_EMAIL,
      subject: "Nueva solicitud de diagnóstico express",
      html: `
        <p><strong>DNI/CUIL:</strong> ${dni}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Preferencia de obra social:</strong> ${preferencia}</p>
        <p><strong>Localidad:</strong> ${localidad}</p>
        <p><strong>Mensaje adicional:</strong> ${mensaje || "Sin comentarios"}</p>
      `,
    })

    res.json({ ok: true })
  } catch (error) {
    console.error("Error enviando correo:", error)
    res.status(500).json({ error: "No se pudo enviar el correo" })
  }
})

app.get("/api/health", (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`API /api/lead escuchando en puerto ${PORT}`)
})
