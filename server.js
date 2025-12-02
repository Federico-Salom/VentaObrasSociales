import "dotenv/config"
import express from "express"
import cors from "cors"

const app = express()
const PORT = process.env.PORT || 3000

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "federicosalom@proton.me"
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "no-reply@flexviasano.com.ar"
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "FlexViasano"

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://www.flexviasano.com.ar",
  "https://flexviasano.com.ar",
]

if (!BREVO_API_KEY) {
  console.warn("⚠️ BREVO_API_KEY no está definido en .env")
}

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

async function enviarLeadPorBrevo({ dni, telefono, preferencia, localidad, mensaje }) {
  const html = `
    <h2>Nuevo lead FlexViasano</h2>
    <p><strong>DNI/CUIL:</strong> ${dni}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Preferencia:</strong> ${preferencia}</p>
    <p><strong>Localidad:</strong> ${localidad}</p>
    <p><strong>Mensaje:</strong> ${mensaje || "-"}</p>
  `

  const body = {
    sender: {
      email: BREVO_SENDER_EMAIL,
      name: BREVO_SENDER_NAME,
    },
    to: [
      {
        email: CONTACT_EMAIL,
      },
    ],
    subject: "Nuevo lead desde la web",
    htmlContent: html,
    textContent: `
Nuevo lead FlexViasano

DNI/CUIL: ${dni}
Teléfono: ${telefono}
Preferencia: ${preferencia}
Localidad: ${localidad}
Mensaje: ${mensaje || "-"}
    `.trim(),
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Brevo respondió ${res.status}: ${text}`)
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "flexviasano api ok" })
})

app.post("/api/lead", async (req, res) => {
  try {
    const { dni, telefono, preferencia, localidad, mensaje } = req.body || {}

    if (!dni || !telefono || !preferencia || !localidad) {
      return res.status(400).json({ ok: false, error: "Faltan datos obligatorios" })
    }

    console.log("📩 Nuevo lead recibido:", { dni, telefono, preferencia, localidad })

    await enviarLeadPorBrevo({ dni, telefono, preferencia, localidad, mensaje })

    console.log("✅ Lead enviado vía Brevo")

    return res.json({ ok: true })
  } catch (err) {
    console.error("❌ Error enviando lead", err)
    return res.status(500).json({ ok: false, error: "Error interno" })
  }
})

app.listen(PORT, () => {
  console.log(`API FlexViasano escuchando en puerto ${PORT}`)
})
