import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react"
import { observeRevealElements } from "./revealObserver"

type ObraSocial = {
  nombre: string
  sello: string
  resumen: string
  beneficios: string[]
  enlace: string
}

type Paso = {
  titulo: string
  detalle: string
}

type FAQ = {
  pregunta: string
  respuesta: string
}

type ConfianzaMetric = {
  valor: string
  etiqueta: string
  detalle: string
}

type Testimonio = {
  mensaje: string
  nombre: string
  rol: string
  resultado: string
}

const obras: ObraSocial[] = [
  {
    nombre: "Obra Social Flex",
    sello: "Aportes flexibles",
    resumen:
      "Ideal para perfiles comerciales, tech y servicios que quieren sumar sanatorios privados sin dejar de estar en relación de dependencia.",
    beneficios: [
      "Derivación de aportes inmediata y sin costo extra",
      "Cartilla odontológica y oftalmológica completa",
      "Descuento de hasta el 100 % en farmacias adheridas",
    ],
    enlace: "https://app.flexsalud.com.ar/",
  },
  {
    nombre: "ViaSano Salud",
    sello: "Cobertura familiar",
    resumen:
      "Pensada para grupos familiares que buscan turnos rápidos y un seguimiento pediátrico cercano usando los mismos aportes.",
    beneficios: [
      "Internaciones en cl�nicas aliadas",
      "Plan materno infantil desde la semana 1",
      "Descuento de hasta el 100 % en farmacias adheridas",
    ],
    enlace: "https://aplicacion-pwa.viasanosalud.com.ar/",
  },
]

const pasos: Paso[] = [
  {
    titulo: "1. Reviso tus recibos",
    detalle: "Analizo tus últimos dos recibos y verifico dónde se están acreditando los aportes que genera tu empleo.",
  },
  {
    titulo: "2. Elegimos la obra",
    detalle: "Te explico la diferencia real entre Flex y ViaSano y definimos cuál conviene según zona, familia y uso esperado.",
  },
  {
    titulo: "3. Seguimiento sin vueltas",
    detalle: "Gestiono la adhesión, monitoreo la primera liquidación y confirmo que ya estés activo para pedir turnos.",
  },
]

const heroHighlights = [
  "Atención demanda espontánea sin turno previo",
  "Telemedicina y cert. médico",
  "Médico a domicilio dentro de AMBA",
  "Guardias y sanatorios abiertos las 24 hs",
  "Odontología preventiva y tratamientos completos",
  "Ortodoncia con brackets incluida",
  "Descuento de hasta el 100 % en farmacias adheridas",
]

const heroStats = ["480+ altas activas en 2024", "72 h de respuesta promedio", "0 costo por trámite"]

const TICKER_BASE_SPEED = 38

const metricasConfianza: ConfianzaMetric[] = [
  { valor: "12 años", etiqueta: "Gestionando aportes", detalle: "Experiencia en payroll y derivaciones para PyMEs" },
  { valor: "98%", etiqueta: "Altas aprobadas", detalle: "Documentación validada por las obras sociales" },
  { valor: "RNOS vigente", etiqueta: "Respaldado", detalle: "Opero con matrículas actualizadas ante SSSalud" },
]

const testimonios: Testimonio[] = [
  {
    mensaje:
      "En mi empresa nunca sabían dónde iba mi aporte. Lucas Dinapoli me pasó un informe para RR. HH. y en dos semanas ya estaba con Flex con toda la cartilla digital.",
    nombre: "Lucia Pereyra",
    rol: "Marketing en fintech",
    resultado: "Derivacion aprobada en 11 dias habiles",
  },
  {
    mensaje:
      "Necesitábamos sumar a nuestro bebé y ViaSano nos dio obstetricia completa. Nos guiaron en cada firma y no pagamos nada extra.",
    nombre: "Familia Rivas",
    rol: "Docencia y retail",
    resultado: "Grupo familiar activo con ViaSano",
  },
  {
    mensaje:
      "Trabajo en dos empresas y pude unificar los aportes para alcanzar el plan corporativo de ViaSano. Toda la gestión fue online.",
    nombre: "Gaston Ibanez",
    rol: "Lider de soporte IT",
    resultado: "Upgrade de plan sin costo adicional",
  },
]

const faqs: FAQ[] = [
  {
    pregunta: "¿Tengo más de un empleo, puedo usar todos los aportes?",
    respuesta: "Sí, sumo los aportes de cada recibo en un mismo legajo para que tengas mejor categoría sin pagar diferencias.",
  },
  {
    pregunta: "¿Cuánto tarda el trámite completo?",
    respuesta: "Entre 10 y 15 días hábiles según la empresa. Te aviso cuando la obra social confirma el alta y te envío la credencial digital.",
  },
  {
    pregunta: "¿Hay costos ocultos o cláusulas raras?",
    respuesta: "No cobro honorarios por el trámite. Solo trabajamos con los aportes que ya te descuentan por ley y firmamos la autorización digital.",
  },
  {
    pregunta: "¿Puedo volver a mi obra social anterior si no me convence?",
    respuesta: "Sí. Toda derivación se asienta en SSSalud y podés revertirla luego de los plazos legales. Te explico el procedimiento antes de firmar.",
  },
]

const CONTACT_EMAIL = "ldinapoli.gonzalez.colmena@gmail.com"
const ASESOR_NOMBRE = "Lucas Dinapoli"

export default function App() {
  const [formData, setFormData] = useState({ dni: "", telefono: "", preferencia: "", localidad: "", mensaje: "" })
  const [formEstado, setFormEstado] = useState<"idle" | "sent" | "error">("idle")
  const [isNavOpen, setIsNavOpen] = useState(false)
  const tickerRef = useRef<HTMLUListElement | null>(null)
  const tickerSpeedRef = useRef(TICKER_BASE_SPEED)
  const tickerTargetSpeedRef = useRef(TICKER_BASE_SPEED)
  const tickerOffsetRef = useRef(0)
  const tickerLastTimeRef = useRef<number | null>(null)
  const tickerDraggingRef = useRef(false)
  const tickerDragLastXRef = useRef(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (window.history.replaceState) {
      const url = `${window.location.origin}${window.location.pathname}`
      window.history.replaceState(null, "", url)
    }
    observeRevealElements()
  }, [])

  useEffect(() => {
    let frame: number
    const step = (time: number) => {
      const last = tickerLastTimeRef.current
      tickerLastTimeRef.current = time
      if (last !== null) {
        const dt = Math.min((time - last) / 1000, 0.05)
        const speed = tickerSpeedRef.current + (tickerTargetSpeedRef.current - tickerSpeedRef.current) * Math.min(1, dt * 3)
        tickerSpeedRef.current = speed
        const list = tickerRef.current
        const wrapWidth = list?.scrollWidth ? list.scrollWidth / 2 : 0
        if (list && wrapWidth > 0) {
          tickerOffsetRef.current = (tickerOffsetRef.current + speed * dt) % wrapWidth
          list.style.transform = `translateX(-${tickerOffsetRef.current}px)`
        }
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!tickerDraggingRef.current || !tickerRef.current) return
      const list = tickerRef.current
      const wrapWidth = list?.scrollWidth ? list.scrollWidth / 2 : 0
      if (!wrapWidth) return
      const delta = event.clientX - tickerDragLastXRef.current
      tickerDragLastXRef.current = event.clientX
      const nextOffset = tickerOffsetRef.current - delta
      tickerOffsetRef.current = ((nextOffset % wrapWidth) + wrapWidth) % wrapWidth
      list.style.transform = `translateX(-${tickerOffsetRef.current}px)`
    }

    const handlePointerUp = () => {
      if (!tickerDraggingRef.current) return
      tickerDraggingRef.current = false
      tickerTargetSpeedRef.current = TICKER_BASE_SPEED
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [])

  const handleChange = (field: keyof typeof formData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
      if (formEstado !== "idle") setFormEstado("idle")
    }

  const handleDiagnostico = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.dni || !formData.telefono || !formData.preferencia || !formData.localidad) {
      setFormEstado("error")
      return
    }

    const subject = encodeURIComponent("Nueva solicitud de diagnostico express")
    const cuerpo = `DNI/CUIL ${formData.dni}\nTelefono: ${formData.telefono}\nPreferencia de obra social: ${formData.preferencia}\nLocalidad: ${formData.localidad}\nMensaje adicional: ${formData.mensaje || "Sin comentarios"}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(cuerpo)}`
    setFormEstado("sent")
  }

  const handleNavNavigate = (value: string) => {
    if (!value) return
    setIsNavOpen(false)
    if (value.startsWith("#")) {
      window.location.hash = value
    } else {
      window.location.href = value
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__grid">
          <div className="hero__copy">
            <div className="hero__title-row">
              <h2 className="hero__title-text">Aportes Flex &amp; ViaSano</h2>
              <div className="hero__title-actions">
                <div className="nav__links nav__links--hero">
                  <a href="#proceso">Proceso</a>
                  <a href="#casos">Casos</a>
                  <a href="#faq">Preguntas</a>
                </div>
                <button
                  type="button"
                  className={`nav__burger ${isNavOpen ? "is-open" : ""}`}
                  aria-label="Abrir menu de navegacion"
                  onClick={() => setIsNavOpen((prev) => !prev)}
                >
                  <span />
                  <span />
                  <span />
                </button>
              </div>
              <div className={`nav__mobile ${isNavOpen ? "is-open" : ""}`} role="menu">
                <button type="button" className="nav__mobile-link" onClick={() => handleNavNavigate("#proceso")}>
                  Proceso
                </button>
                <button type="button" className="nav__mobile-link" onClick={() => handleNavNavigate("#casos")}>
                  Casos
                </button>
                <button type="button" className="nav__mobile-link" onClick={() => handleNavNavigate("#faq")}>
                  Preguntas
                </button>
                <button type="button" className="nav__mobile-link" onClick={() => handleNavNavigate("#contacto")}>
                  Contacto
                </button>
              </div>
            </div>
            <h1>Direcciona tus aportes laborales a Flex o ViaSano sin perder beneficios</h1>
            <p>
              Soy {ASESOR_NOMBRE}, el nexo comercial de ambas obras sociales. Te acompaño paso a paso para que los aportes que ya figuran en tus recibos de sueldo se usen a tu favor, sin pagar doble ni pelearte con administración.
            </p>
            <p className="hero__subcopy">
              Vas a tener tu aplicación para autogestionarte: turnos, recetas, autorizaciones, teleconsultas y citas programadas quedan en un mismo panel para que no dependas de terceros.
            </p>
            <div className="hero__highlights-wrap">
              <ul
                className="hero__highlights"
                aria-label="Beneficios principales"
                ref={tickerRef}
                onMouseEnter={() => {
                  if (!tickerDraggingRef.current) tickerTargetSpeedRef.current = 0
                }}
                onMouseLeave={() => {
                  if (!tickerDraggingRef.current) tickerTargetSpeedRef.current = TICKER_BASE_SPEED
                }}
                onPointerDown={(event) => {
                  if (!tickerRef.current) return
                  tickerDraggingRef.current = true
                  tickerDragLastXRef.current = event.clientX
                  tickerTargetSpeedRef.current = 0
                  tickerSpeedRef.current = 0
                  tickerRef.current.setPointerCapture(event.pointerId)
                }}
                onPointerUp={(event) => {
                tickerDraggingRef.current = false
                tickerTargetSpeedRef.current = TICKER_BASE_SPEED
                tickerRef.current?.releasePointerCapture(event.pointerId)
                }}
                onPointerLeave={() => {
                  if (tickerDraggingRef.current) return
                  tickerTargetSpeedRef.current = TICKER_BASE_SPEED
                }}
              >
                {[...heroHighlights, ...heroHighlights].map((texto, index) => (
                  <li className="hero__highlight" data-reveal key={`${texto}-${index}`}>
                    {texto}
                  </li>
                ))}
              </ul>
            </div>
            <span className="badge badge--floating">Asesoría personalizada para trabajadores en blanco</span>
            <div className="hero__cta-row hero__cta-row--compact">
              <ul className="hero__stats">
                {heroStats.map((stat) => (
                  <li key={stat}>
                    <h3 className="hero__stat-text">{stat}</h3>
                  </li>
                ))}
              </ul>
              <div className="hero__actions hero__actions--right">
                <a className="btn btn--secondary" href="#obras">
                  Comparar Flex vs ViaSano
                </a>
                <a className="btn btn--primary" href="#contacto">
                  Agendar llamada
                </a>
              </div>
            </div>
          </div>

          <div className="hero__form-column">
            <div className="hero__card">
              <div className="hero__card-head">
                <a className="btn btn--secondary hero__card-cta" href="https://wa.me/5491171397320" target="_blank" rel="noreferrer">
                  Hablar con el asesor
                </a>
                <h2>Diagnstico express</h2>
                <p className="hero__card-subtitle">Envame tus datos basicos y te devuelvo un plan de accion para redirigir tus aportes.</p>
              </div>
              <form className="simulador" onSubmit={handleDiagnostico}>
                <label>
                  NNmero de DNI/CUIL
                  <input
                    type="text"
                    placeholder="Ej: 30-12345678-9"
                    value={formData.dni}
                    onChange={handleChange("dni")}
                    required
                  />
                </label>
                <label>
                  Telfono de contacto
                  <input
                    type="tel"
                    placeholder="Ej: 11 5555 5555"
                    value={formData.telefono}
                    onChange={handleChange("telefono")}
                    required
                  />
                </label>
                <label>
                  Obra social preferida
                  <select value={formData.preferencia} onChange={handleChange("preferencia")} required>
                    <option value="" disabled>
                      Seleccionar
                    </option>
                    <option>Quiero Flex</option>
                    <option>Quiero ViaSano</option>
                    <option>Necesito que me recomiedndes</option>
                  </select>
                </label>
                <label>
                  Localidad donde residis
                  <input
                    type="text"
                    placeholder="Ej: Palermo, CABA"
                    value={formData.localidad}
                    onChange={handleChange("localidad")}
                    required
                  />
                </label>
                <label>
                  Mensaje
                  <textarea
                    rows={3}
                    placeholder="Contame si tus familiares o si tenes otra cobertura"
                    value={formData.mensaje}
                    onChange={handleChange("mensaje")}
                  />
                </label>
                <button className="btn btn--primary" type="submit">
                  Enviar mis datos
                </button>
                <span className="simulador__disclaimer">Respondo por WhatsApp o correo en menos de un dia habil.</span>
                {formEstado === "sent" && (
                  <span className="simulador__status" role="status">
                    Abri tu cliente de correo para enviar el mensaje con tus datos.
                  </span>
                )}
                {formEstado === "error" && (
                  <span className="simulador__status simulador__status--error" role="status">
                    Completa los campos obligatorios antes de enviar.
                  </span>
                )}
              </form>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="section section--confidence">
          <div>
            <p className="badge badge--soft">Respaldo real</p>
            <h2>Informes claros para vos y para recursos humanos</h2>
            <p className="section__description">
              Cada paso queda documentado: actas de derivacion, autorizaciones digitales y seguimiento en SSSalud para que no quede nada librado al azar.
            </p>
            <ul className="confidence__stats">
              {metricasConfianza.map((item) => (
                <li className="reveal" data-reveal key={item.etiqueta}>
                  <strong>{item.valor}</strong>
                  <span>{item.etiqueta}</span>
                  <p>{item.detalle}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="obras" className="section">
          <div className="section__header">
            <p className="badge badge--soft">Flex y ViaSano</p>
            <h2>Dos opciones, un solo asesor que pone tus aportes donde mas rinden</h2>
            <p className="section__description">
              No vendo planes cerrados. Te cuento con claridad que cobertura ofrece cada obra social y chequeo que puedas entrar con lo que ya aportas en tus trabajos en blanco.
            </p>
          </div>
          <div className="obras__grid">
            {obras.map((obra, index) => (
              <article className={`obra-card reveal delay-${index}`} data-reveal key={obra.nombre}>
                <p className="pill">{obra.sello}</p>
                <h3>{obra.nombre}</h3>
                <p className="obra-card__resumen">{obra.resumen}</p>
                <ul>
                  {obra.beneficios.map((beneficio) => (
                    <li key={beneficio}>{beneficio}</li>
                  ))}
                </ul>
                <a className="obra-card__link" href={obra.enlace} target="_blank" rel="noreferrer">
                  Ingresar a {obra.nombre}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="proceso" className="section section--alt">
          <div className="section__header">
            <p className="badge badge--soft">Proceso</p>
            <h2>Así aprovechás tus aportes sin pelearte con recursos humanos</h2>
          </div>
          <div className="pasos__grid">
            {pasos.map((paso, index) => (
              <article className={`paso-card reveal delay-${index}`} data-reveal key={paso.titulo}>
                <h3>{paso.titulo}</h3>
                <p>{paso.detalle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--stories" id="casos">
          <div className="section__header">
            <p className="badge badge--soft">Casos</p>
            <h2>Historias de personas que ya redirigieron tus aportes</h2>
          </div>
          <div className="testimonios">
            {testimonios.map((testimonio, index) => (
              <article className={`testimonio-card reveal delay-${index}`} data-reveal key={testimonio.nombre}>
                <p className="testimonio-card__mensaje">{testimonio.mensaje}</p>
                <div className="testimonio-card__footer">
                  <div>
                    <strong>{testimonio.nombre}</strong>
                    <span>{testimonio.rol}</span>
                  </div>
                  <span className="testimonio-card__chip">{testimonio.resultado}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="faq">
          <div className="section__header">
            <p className="badge badge--soft">Preguntas frecuentes</p>
            <h2>Lo que más me consultan antes de derivar aportes</h2>
          </div>
          <div className="faq">
            {faqs.map((faq, index) => (
              <article className="faq__item" key={faq.pregunta} style={{ animationDelay: `${index * 0.12}s` }}>
                <h3 className="faq__title">{faq.pregunta}</h3>
                <p className="faq__answer">{faq.respuesta}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contacto" className="section section--cta">
          <div className="cta__panel">
            <div>
              <p className="badge badge--soft">Contacto directo</p>
              <h2>Coordina ahora mismo tu derivación de aportes</h2>
              <p>
                Trabajo con Flex y ViaSano a nivel nacional. Enviame tus recibos y en el mismo día te confirmo si aplicás y cuándo estarías activo.
              </p>
              <ul className="contacto__notenes">
                <li>Seguimiento por WhatsApp y correo</li>
                <li>Documentación firmada digitalmente</li>
                <li>Sin costos ocultos ni letras chicas</li>
              </ul>
            </div>
            <div className="contacto__actions">
              <a className="btn btn--primary btn--full" href="https://wa.me/5491171397320" target="_blank" rel="noreferrer">
                Escribir por WhatsApp
              </a>
              <a className="btn btn--ghost btn--full" href="mailto:ldinapoli.gonzalez.colmena@gmail.com">
                Enviar correo
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Aportes Flex & ViaSano</span>
        <span>Asesor independiente - Opero en todo el pais</span>
      </footer>
    </div>
  )
}

