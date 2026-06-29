import Reveal from './Reveal.jsx'
import AnnotationLayer from './AnnotationLayer.jsx'

function buildAnns(rows, on) {
  return rows
    .filter(r => r.ann && r.ann.on === on)
    .map(r => ({
      id: r.id,
      ref: r.cells[0],
      element: r.cells[1],
      build: r.cells[2],
      fix: r.fix,
      priority: r.cells[4],
      specialPriority: r.specialPriority,
      x: r.ann.x,
      y: r.ann.y,
      w: r.ann.w,
      h: r.ann.h,
    }))
}

export default function NavCompare({ compare, rows, onLightbox, highlightId }) {
  const figmaAnns = buildAnns(rows, 'figma')
  const liveAnns = buildAnns(rows, 'live')

  return (
    <Reveal as="section" className="scene" y={20} delay={0.05}>
      <div className="sm">
        <div className="lbl">
          <span className="desc">{compare.desc}</span>
        </div>
        <span className="stag">{compare.tag}</span>
      </div>

      <div className="compare">
        {/* Figma pane */}
        <div className="pane">
          <div className="ph">
            <div className="pw">
              <span className="dot" />
              <span className="t">Design</span>
              <span className="src">Figma</span>
            </div>
            <span className="pv">{compare.figma.node}</span>
          </div>
          <div className="browser">
            <div className="bbar">
              <span className="traf"><i /><i /><i /></span>
              <span className="url">{compare.figma.url}</span>
            </div>
            <div className="screen-full">
              <AnnotationLayer
                image={compare.figma.img}
                alt={compare.figma.alt}
                annotations={figmaAnns}
                highlightId={highlightId}
                onImageClick={() => onLightbox && onLightbox(compare.figma.img, compare.figma.alt, figmaAnns)}
              />
            </div>
          </div>
        </div>

        {/* Live pane */}
        <div className="pane">
          <div className="ph">
            <div className="pw">
              <span className="dot" />
              <span className="t">Build</span>
              <span className="src">Web</span>
            </div>
            <span className="pv">{compare.live.node}</span>
          </div>
          <div className="browser">
            <div className="bbar">
              <span className="traf"><i /><i /><i /></span>
              <span className="url">{compare.live.url}</span>
            </div>
            <div className="screen-full">
              <AnnotationLayer
                image={compare.live.img}
                alt={compare.live.alt}
                annotations={liveAnns}
                highlightId={highlightId}
                onImageClick={() => onLightbox && onLightbox(compare.live.img, compare.live.alt, liveAnns)}
              />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
