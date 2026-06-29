import Reveal from './Reveal.jsx'

export default function Hero() {
  return (
    <section className="hero">
      <Reveal className="eyebrow" y={10} delay={0.05}>
        Design QA · Figma ↔ Build · AY 2026-27
      </Reveal>
      <Reveal as="h1" className="hero-title" y={18} delay={0.13}>
        Tax Filing<br />
        <span className="acc">investigation</span>
      </Reveal>
      <Reveal className="badge" y={10} delay={0.22}>
        <span className="dot" />
        <span className="mono">106 GAPS · 8 SECTIONS · FIGMA za8e35wfWeVkUTqZ8TyJHz</span>
      </Reveal>
    </section>
  )
}
