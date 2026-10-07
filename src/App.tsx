import { useState, Fragment, useRef, useEffect } from 'react'
import logoMiLDC from './assets/logo-mildc.png'

const T  = '#007CAA'
const TD = '#004D71'
const TL = '#e6f4f9'

interface DayInfo {
  key: string; label: string; short: string; disponibles: number
  programs: { name: string; disp: number }[]
}

// Datos de ejemplo coherentes: Disponibles del día = suma de sus programas.
// Los contratos solo usan combinaciones de programas que existen en la bolsa y la suma de lo generado no supera lo pendiente por cupear.
const RAW_DAYS: Omit<DayInfo, 'disponibles'>[] = [
  { key:'d1', label:'Martes 06/10', short:'Mar 06/10', programs:[{name:'Libre',disp:10},{name:'EUDR',disp:5},{name:'EPA',disp:5},{name:'2BSvs',disp:5}] },
  { key:'d2', label:'Miércoles 07/10', short:'Mié 07/10', programs:[{name:'Libre',disp:10},{name:'EUDR',disp:5},{name:'EPA',disp:5},{name:'2BSvs',disp:5}] },
  { key:'d3', label:'Jueves 08/10', short:'Jue 08/10', programs:[{name:'CFR',disp:5},{name:'RTRS',disp:5},{name:'CDR;RTS',disp:5},{name:'2BSvs;EPA',disp:5}] },
  { key:'d4', label:'Viernes 09/10', short:'Vie 09/10', programs:[{name:'Libre',disp:5},{name:'EUDR',disp:5},{name:'EPA',disp:5},{name:'2BSvs',disp:5}] },
  { key:'d5', label:'Sábado 10/10', short:'Sáb 10/10', programs:[{name:'Libre',disp:0},{name:'EUDR',disp:0},{name:'EPA',disp:5},{name:'2BSvs',disp:5}] },
  { key:'d6', label:'Domingo 11/10', short:'Dom 11/10', programs:[{name:'Libre',disp:0},{name:'EUDR',disp:5},{name:'EPA',disp:5},{name:'2BSvs',disp:0}] },
  { key:'d7', label:'Lunes 12/10', short:'Lun 12/10', programs:[{name:'Libre',disp:10},{name:'EUDR',disp:5},{name:'EPA',disp:5},{name:'2BSvs',disp:5}] },
  { key:'d8', label:'Martes 13/10', short:'Mar 13/10', programs:[{name:'Libre',disp:5},{name:'EUDR',disp:5},{name:'EPA',disp:5},{name:'2BSvs',disp:5}] },
  { key:'d9', label:'Miércoles 14/10', short:'Mié 14/10', programs:[{name:'Libre',disp:10},{name:'EUDR',disp:5},{name:'EPA',disp:5},{name:'2BSvs',disp:5}] },
  { key:'d10', label:'Jueves 15/10', short:'Jue 15/10', programs:[{name:'Libre',disp:5},{name:'EUDR',disp:5},{name:'EPA',disp:5},{name:'2BSvs',disp:5}] },
]
const ALL_DAYS: DayInfo[] = RAW_DAYS.map(d => ({ ...d, disponibles: d.programs.reduce((t, x) => t + x.disp, 0) }))

interface ContractRow {
  rowId: string; contractId: string; programas: string; porCupear: number; cliente: string
  gen: Record<string, number>
}

const CONTRACTS: ContractRow[] = [
  { rowId:'r1', contractId:'001CP029019785', programas:'2BSvs', porCupear:60, cliente:'ACA', gen:{d1:6,d2:3,d3:8,d4:4,d5:2,d6:0,d7:2,d8:2,d9:6,d10:5} },
  { rowId:'r2', contractId:'001CP029019784', programas:'2BSvs', porCupear:100, cliente:'ACA', gen:{d1:0,d2:12,d3:4,d4:6,d5:0,d6:0,d7:8,d8:2,d9:4,d10:2} },
  { rowId:'r3', contractId:'001CP029019783', programas:'EUDR', porCupear:40, cliente:'Coop3', gen:{d1:12,d2:8,d3:0,d4:10,d5:0,d6:0,d7:4,d8:0,d9:2,d10:0} },
  { rowId:'r4', contractId:'001CP029019782', programas:'EUDR', porCupear:50, cliente:'Coop3', gen:{d1:15,d2:15,d3:8,d4:0,d5:0,d6:0,d7:4,d8:3,d9:0,d10:2} },
  { rowId:'r5', contractId:'001CP029019781', programas:'2BSvs', porCupear:100, cliente:'Coop3', gen:{d1:3,d2:12,d3:2,d4:10,d5:0,d6:3,d7:12,d8:3,d9:2,d10:15} },
  { rowId:'r6', contractId:'001CP029019780', programas:'EUDR', porCupear:20, cliente:'Coop3', gen:{d1:10,d2:5,d3:0,d4:0,d5:0,d6:0,d7:0,d8:3,d9:0,d10:0} },
  { rowId:'r7', contractId:'001CP029019779', programas:'2BSvs;EPA', porCupear:30, cliente:'Coop3', gen:{d1:4,d2:10,d3:0,d4:6,d5:0,d6:0,d7:2,d8:5,d9:0,d10:0} },
  { rowId:'r8', contractId:'001CP029019778', programas:'2BSvs;EPA', porCupear:20, cliente:'Coop3', gen:{d1:5,d2:4,d3:0,d4:4,d5:0,d6:0,d7:0,d8:3,d9:2,d10:0} },
  { rowId:'r9', contractId:'001CP029019777', programas:'CFR', porCupear:20, cliente:'Coop3', gen:{d1:5,d2:5,d3:3,d4:2,d5:0,d6:0,d7:0,d8:3,d9:0,d10:0} },
  { rowId:'r10', contractId:'001CP029019776', programas:'CFR', porCupear:20, cliente:'Coop3', gen:{d1:4,d2:2,d3:3,d4:2,d5:0,d6:0,d7:0,d8:4,d9:0,d10:2} },
  { rowId:'r11', contractId:'001CP029019775', programas:'ISCC EU', porCupear:40, cliente:'Coop3', gen:{d1:6,d2:4,d3:0,d4:5,d5:0,d6:0,d7:3,d8:2,d9:0,d10:4} },
  { rowId:'r12', contractId:'001CP029019774', programas:'RTRS', porCupear:30, cliente:'Coop3', gen:{d1:3,d2:5,d3:0,d4:2,d5:0,d6:0,d7:0,d8:3,d9:0,d10:2} },
  { rowId:'r13', contractId:'001CP029019773', programas:'ProTerra', porCupear:25, cliente:'Coop3', gen:{d1:0,d2:4,d3:2,d4:0,d5:0,d6:0,d7:3,d8:0,d9:3,d10:0} },
]

type Mode = 'generar' | 'solicitar'

// ─── Sidebar (collapsible) ───────────────────────────────────────────────────

function ChevronDown() {
  return <svg className="w-4 h-4 text-white opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
}
function ChevronUp() {
  return <svg className="w-4 h-4 text-white opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
}

function SidebarLogo({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex justify-center items-center py-3">
        <img src={logoMiLDC} alt="Mi LDC" style={{ height: 22, objectFit: 'contain' }} />
      </div>
    )
  }
  return (
    <div className="flex items-center px-4 py-4">
      <img src={logoMiLDC} alt="Mi LDC" style={{ height: 28, objectFit: 'contain' }} />
    </div>
  )
}

function Sidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const w = expanded ? 232 : 56

  return (
    <div
      className="flex-shrink-0 overflow-hidden flex flex-col"
      style={{ width: w, background: T, minHeight:'100vh', transition:'width 0.22s ease' }}
    >
      {/* Logo */}
      <button onClick={onToggle} className="w-full text-left focus:outline-none" title={expanded ? 'Colapsar menú' : 'Expandir menú'}>
        <SidebarLogo compact={!expanded} />
      </button>

      {/* Nav items */}
      {expanded ? (
        <div className="flex flex-col gap-0.5 px-2 pb-4 overflow-y-auto">
          {/* Inicio */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer" style={{ background: TD }}>
            <IcoHome /><span className="text-sm font-semibold text-white whitespace-nowrap">Inicio</span>
          </div>
          {/* Negocios */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10">
            <div className="flex items-center gap-3"><IcoChart /><span className="text-sm text-white whitespace-nowrap">Negocios</span></div>
            <ChevronDown />
          </div>
          {/* Logística */}
          <div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10">
              <div className="flex items-center gap-3"><IcoTruck /><span className="text-sm font-semibold text-white whitespace-nowrap">Logística</span></div>
              <ChevronUp />
            </div>
            <div className="pl-9 pr-2 mt-0.5 space-y-0.5">
              <div className="py-2 px-3 text-sm font-semibold text-white cursor-pointer hover:bg-white/10 rounded-lg">Movimientos</div>
              <div>
                <div className="flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-white/10 rounded-lg">
                  <span className="text-sm font-semibold text-white">Cupos</span>
                  <ChevronUp />
                </div>
                <div className="pl-3 mt-0.5 space-y-0.5">
                  <div className="py-1.5 px-3 text-sm cursor-pointer rounded-lg hover:bg-white/10" style={{ color:'rgba(255,255,255,0.7)' }}>Consulta</div>
                  <div className="py-1.5 px-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: TD }}>
                    Gestión de cupos
                  </div>
                </div>
              </div>
              <div className="py-2 px-3 text-sm font-semibold text-white cursor-pointer hover:bg-white/10 rounded-lg">Órdenes de carga</div>
            </div>
          </div>
          {/* Finanzas */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10">
            <div className="flex items-center gap-3"><IcoFinanzas /><span className="text-sm text-white whitespace-nowrap">Finanzas</span></div>
            <ChevronDown />
          </div>
          {/* Sustentabilidad */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10">
            <IcoLeaf /><span className="text-sm text-white whitespace-nowrap">Sustentabilidad</span>
          </div>
          {/* Mi organización */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10">
            <IcoPeople /><span className="text-sm text-white whitespace-nowrap">Mi organización</span>
          </div>
          {/* Soporte */}
          <div className="mt-auto pt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10">
            <IcoSupport /><span className="text-sm text-white whitespace-nowrap">Soporte</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {[
            { id:'home',    icon:<IcoHome />,    active:false },
            { id:'chart',   icon:<IcoChart />,   active:false },
            { id:'truck',   icon:<IcoTruck />,   active:true  },
            { id:'fin',     icon:<IcoFinanzas />,active:false },
            { id:'leaf',    icon:<IcoLeaf />,    active:false },
            { id:'people',  icon:<IcoPeople />,  active:false },
            { id:'support', icon:<IcoSupport />, active:false },
          ].map(ic => (
            <div key={ic.id} className="flex items-center justify-center" style={{ width: 56, height: 56 }}>
              <button
                className="flex items-center justify-center transition-colors"
                style={{
                  width: 40, height: 40,
                  borderRadius: ic.active ? '50%' : 10,
                  background: ic.active ? '#005D89' : 'transparent',
                  color: '#fff',
                }}
              >
                {ic.icon}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Top bar ─────────────────────────────────────────────────────────────────

function TopBar({ breadcrumb }: { breadcrumb: string[] }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-5" style={{ background: T, height: 48, zIndex:10 }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color:'rgba(255,255,255,0.8)' }}>
        {breadcrumb.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            <span className={i === breadcrumb.length-1 ? 'text-white font-medium' : ''}>{seg}</span>
          </span>
        ))}
      </nav>
      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="text-white opacity-75 hover:opacity-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
        </button>
        {/* Help */}
        <button className="text-white opacity-75 hover:opacity-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
        {/* Headset/support */}
        <button className="text-white opacity-75 hover:opacity-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>
        </button>
        <span className="text-white text-xs font-medium">LARTIRIGOYEN Y CIA S.A.</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: TD, color:'#fff' }}>OP</div>
      </div>
    </div>
  )
}

// ─── Programs modal (design4) ────────────────────────────────────────────────

const PROGRAM_CATALOG: { name: string; desc: string }[] = [
  { name:'Libre',      desc:'Sin programa de sustentabilidad asociado' },
  { name:'EUDR',       desc:'Libre de deforestación (Reglamento UE)' },
  { name:'2BSvs',      desc:'Esquema voluntario 2BS para biocombustibles (UE)' },
  { name:'ISCC EU',    desc:'Certificación de sustentabilidad y trazabilidad (UE)' },
  { name:'ISCC PLUS',  desc:'Cadenas de suministro sustentables fuera de RED' },
  { name:'RTRS',       desc:'Mesa Redonda de Soja Responsable' },
  { name:'ProTerra',   desc:'Certificación social y ambiental, non-GMO' },
  { name:'CFR',        desc:'Clean Fuel Regulations (Canadá)' },
  { name:'2BSvs;EPA',  desc:'Combinación 2BSvs + EPA' },
  { name:'EPA',        desc:'Renewable Fuel Standard (EE.UU.)' },
  { name:'CDR;RTS',    desc:'Combinación CDR + RTS' },
]
const ALL_PROGRAMS = PROGRAM_CATALOG.map(x => x.name)
const MAX_PEDIDO = 400

interface ProgModalProps {
  dayLabel: string
  baseNames: string[]
  extraNames: string[]
  values: Record<string,string>
  isValid: (name: string) => boolean
  hasContract: (name: string) => boolean
  onConfirm: (extras: string[], values: Record<string,string>) => void
  onClose: () => void
}

function ProgramsModal({ dayLabel, baseNames, extraNames, values: initValues, isValid, hasContract, onConfirm, onClose }: ProgModalProps) {
  const [extras, setExtras] = useState<string[]>(extraNames)
  const [values, setValues] = useState<Record<string,string>>(initValues)
  const toggle = (p: string) => {
    setExtras(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
    setValues(prev => { const n = { ...prev }; delete n[p]; return n })
  }
  const isOn = (p: string) => baseNames.includes(p) || extras.includes(p)
  const canType = (p: string) => isOn(p) && isValid(p)
  const total = ALL_PROGRAMS.reduce((t, p) => t + (canType(p) ? (parseInt(values[p] || '0') || 0) : 0), 0)
  const hasOver = total > MAX_PEDIDO

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.25)' }}>
      <div className="rounded-2xl shadow-2xl p-6 w-[480px] max-w-[94vw]" style={{ background: TL }}>
        <h2 className="text-lg font-bold" style={{ color: TD }}>Solicitar cupos por códigos</h2>
        <p className="text-xs font-medium mt-0.5 mb-3" style={{ color:'#5a7a8a' }}>{dayLabel}</p>
        <p className="text-sm mb-4" style={{ color:'#1a3a4a' }}>Tildá los que necesitás y cargá la cantidad de cupos.</p>

        <div className="mildc-scroll rounded-xl bg-white mb-5 divide-y divide-gray-100 overflow-y-scroll" style={{ maxHeight: 6 * 52 }}>
          {PROGRAM_CATALOG.map(({ name: p, desc }) => {
            const locked = baseNames.includes(p)
            const on = isOn(p)
            const valid = isValid(p)
            return (
              <div key={p} className="flex items-center gap-3 px-3 py-2">
                <label className={`flex items-center gap-3 flex-1 min-w-0 ${locked || !valid ? 'cursor-default' : 'cursor-pointer'}`} title={valid ? undefined : 'Esta combinación de programas no existe en ningún contrato.'}>
                  <span
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                    style={{ background: on ? T : '#fff', borderColor: on ? T : '#ccc', opacity: locked || !valid ? 0.55 : 1 }}
                  >
                    {on && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <input type="checkbox" className="sr-only" checked={on} disabled={locked || !valid} onChange={() => toggle(p)} />
                  <span className="min-w-0 flex flex-col leading-tight">
                    <span className="text-sm truncate" style={{ color: on && valid ? '#1a1a1a' : '#8a959b' }}>{p}</span>
                    <span className="text-[11px] truncate" style={{ color:'#8a959b' }}>{desc}</span>
                  </span>
                  {!hasContract(p) && <span className="text-[11px] flex-shrink-0 rounded-full px-2 py-0.5" style={{ color:'#5a7a8a', background:'#eef3f5' }}>Sin contrato</span>}
                </label>
                <input
                  type="number" min={0} max={MAX_PEDIDO}
                  disabled={!canType(p)}
                  value={values[p] || ''}
                  onChange={e => setValues(prev => ({ ...prev, [p]: e.target.value }))}
                  placeholder="0"
                  className="w-24 text-right text-sm rounded-full border px-3 py-1"
                  style={canType(p)
                    ? { borderColor: hasOver ? '#c0392b' : '#9aa7ae', color: hasOver ? '#c0392b' : '#1a1a1a', outline:'none', background:'#fff' }
                    : { borderColor:'#e1e7ea', background:'#f3f5f6', outline:'none', cursor:'not-allowed' }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between text-xs mb-4 -mt-2 px-1">
          <span style={{ color: hasOver ? '#c0392b' : '#5a7a8a' }}>
            {hasOver ? `Sin contrato podés solicitar hasta ${MAX_PEDIDO} cupos.` : `Hasta ${MAX_PEDIDO} cupos sin contrato. Sujeto a aprobación.`}
          </span>
          <span className="font-semibold tabular-nums flex-shrink-0 ml-3" style={{ color: hasOver ? '#c0392b' : TD }}>{total} / {MAX_PEDIDO}</span>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: T, color: T, background:'#fff' }}>
            Volver
          </button>
          <button
            onClick={() => onConfirm(extras, values)}
            disabled={hasOver}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:cursor-not-allowed"
            style={{ background: hasOver ? '#c9ced1' : T }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoTip({ text, open, onToggle, onClose }: { text: string; open: boolean; onToggle: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open, onClose])
  return (
    <div ref={ref} className="relative flex items-center">
      <button type="button" onClick={onToggle} aria-label="Más información" aria-expanded={open} className="flex items-center justify-center rounded-full" style={{ color: open ? TD : T }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 11v5.5" /><circle cx="12" cy="7.6" r="0.6" fill="currentColor" /></svg>
      </button>
      {open && (
        <div role="tooltip" className="absolute left-1/2 z-40 rounded-lg shadow-lg text-xs leading-snug px-3 py-2" style={{ top:'calc(100% + 8px)', transform:'translateX(-50%)', width:260, background: TD, color:'#fff', fontWeight:400 }}>
          <span className="absolute -top-1 left-1/2 w-2 h-2 rotate-45" style={{ background: TD, marginLeft:-4 }} />
          {text}
        </div>
      )}
    </div>
  )
}

function PendingCell({ n, onClick }: { n: number; onClick: () => void }) {
  if (n <= 0) return <>0</>
  return (
    <button
      type="button"
      onClick={onClick}
      title="Simular resolución del administrador"
      className="font-semibold underline decoration-dotted underline-offset-2"
      style={{ color: TD }}
    >{n}</button>
  )
}

function ResolveModal({ t, onApply, onClose }: { t: { title: string; pending: number }; onApply: (approved: number) => void; onClose: () => void }) {
  const [approved, setApproved] = useState(String(t.pending))
  const a = Math.min(t.pending, Math.max(0, parseInt(approved) || 0))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.25)' }}>
      <div className="rounded-2xl shadow-2xl p-6 w-[400px] max-w-[94vw]" style={{ background: TL }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color:'#5a7a8a' }}>Simulación · Resolución del administrador</p>
        <p className="text-sm font-semibold mb-4" style={{ color: TD }}>{t.title}</p>
        <div className="rounded-xl bg-white p-4 mb-4 flex flex-col gap-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">En gestión</span><span className="font-semibold tabular-nums">{t.pending}</span></div>
          <label className="flex items-center justify-between gap-3">
            <span className="text-gray-600">Aprobados</span>
            <input type="number" min={0} max={t.pending} value={approved} onChange={e => setApproved(e.target.value)}
              className="w-24 text-right text-sm rounded-full border px-3 py-1" style={{ borderColor:'#9aa7ae', outline:'none' }} />
          </label>
          <div className="flex justify-between"><span className="text-gray-600">Rechazados</span><span className="font-semibold tabular-nums">{t.pending - a}</span></div>
        </div>
        <p className="text-xs mb-4" style={{ color:'#5a7a8a' }}>Los aprobados se descuentan de Disponible. Los rechazados no modifican Disponible.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: T, color: T, background:'#fff' }}>Volver</button>
          <button onClick={() => onApply(a)} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: T }}>Aplicar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Devolución de cupos disponibles ─────────────────────────────────────────

function CheckBox({ checked, onChange, light, label }: { checked: boolean; onChange: () => void; light?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2"
      style={light
        ? { background:'#fff', borderColor:'#fff' }
        : { background: checked ? T : '#fff', borderColor: checked ? T : '#8fa3ad' }}
    >
      {checked && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={light ? T : '#fff'}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

interface DevolverProps {
  days: { key: string; short: string }[]
  programs: string[]
  disp: (dayKey: string, name: string) => number
  onClose: () => void
  onConfirm: (values: Record<string, Record<string, number>>) => void
}

function DevolverModal({ days, programs, disp, onClose, onConfirm }: DevolverProps) {
  const [vals, setVals] = useState<Record<string, Record<string, string>>>({})
  const [sort, setSort] = useState<'asc' | 'desc' | null>(null)
  const [onlyAvail, setOnlyAvail] = useState(false)

  const num = (d: string, p: string) => parseInt(vals[d]?.[p] || '0') || 0
  const setCell = (d: string, p: string, v: string) => setVals(prev => ({ ...prev, [d]: { ...prev[d], [p]: v } }))

  let rows = programs.filter(p => !onlyAvail || days.some(d => disp(d.key, p) > 0))
  if (sort) rows = [...rows].sort((a, b) => sort === 'asc' ? a.localeCompare(b) : b.localeCompare(a))

  const eligible = (d: string, p: string) => disp(d, p) > 0
  const isFull = (d: string, p: string) => eligible(d, p) && num(d, p) === disp(d, p)
  const rowCells = (p: string) => days.filter(d => eligible(d.key, p))
  const colCells = (d: string) => rows.filter(p => eligible(d, p))
  const rowAll = (p: string) => rowCells(p).length > 0 && rowCells(p).every(d => isFull(d.key, p))
  const colAll = (d: string) => colCells(d).length > 0 && colCells(d).every(p => isFull(d, p))
  const allSelected = days.every(d => colCells(d.key).every(p => isFull(d.key, p))) && days.some(d => colCells(d.key).length > 0)

  const fill = (cells: { d: string; p: string }[], on: boolean) =>
    setVals(prev => {
      const next = { ...prev }
      cells.forEach(({ d, p }) => { next[d] = { ...(next[d] || {}), [p]: on ? String(disp(d, p)) : '' } })
      return next
    })
  const toggleRow = (p: string) => fill(rowCells(p).map(d => ({ d: d.key, p })), !rowAll(p))
  const toggleCol = (d: string) => fill(colCells(d).map(p => ({ d, p })), !colAll(d))
  const returnAll = () => fill(days.flatMap(d => colCells(d.key).map(p => ({ d: d.key, p }))), true)

  const dayDisp = (d: string) => rows.reduce((t, p) => t + disp(d, p), 0)
  const dayRet = (d: string) => rows.reduce((t, p) => t + num(d, p), 0)
  const totalRet = days.reduce((t, d) => t + dayRet(d.key), 0)

  function confirm() {
    const out: Record<string, Record<string, number>> = {}
    days.forEach(d => rows.forEach(p => {
      const n = Math.min(num(d.key, p), disp(d.key, p))
      if (n > 0) { out[d.key] = { ...(out[d.key] || {}), [p]: n } }
    }))
    onConfirm(out)
  }

  const SELECTED = '#eef7ea'
  const FIRST_W = 168
  const DAY_W = 164

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.3)' }}>
      <div className="rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full" style={{ maxWidth: 1180, maxHeight:'94vh', background:'#fff' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 flex-shrink-0" style={{ background: T, height: 64 }}>
          <h2 className="text-lg font-bold text-white">Devolución de cupos disponibles</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: TL, color: T }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-4 overflow-auto flex-1 min-h-0" style={{ background:'linear-gradient(180deg,#eaf4fa 0%,#dcebec 100%)' }}>
          <p className="text-sm mb-5" style={{ color:'#5b666d' }}>
            Ingrese la cantidad de cupos que desea devolver. La cantidad ingresada no puede exceder el disponible por programa y por día.
          </p>

          <div className="rounded-xl overflow-auto shadow-sm" style={{ background:'#fff' }}>
            <table style={{ borderCollapse:'separate', borderSpacing:0, width: FIRST_W + days.length * DAY_W }}>
              <thead>
                <tr style={{ background: T }}>
                  <th className="text-left px-3 py-3 text-white font-bold text-sm" style={{ position:'sticky', left:0, zIndex:3, background: T, width: FIRST_W, minWidth: FIRST_W }}>
                    <span className="inline-flex items-center gap-2">
                      Programa
                      <button type="button" aria-label="Ordenar" title="Ordenar" onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')} className="opacity-80 hover:opacity-100">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 4l-4 5h8zM8 20l4-5H4z" opacity={sort === 'desc' ? 0.45 : 1} />
                          <path d="M16 4v16" stroke="none" />
                        </svg>
                      </button>
                      <button type="button" aria-label="Solo programas con disponible" title="Mostrar solo programas con disponible" onClick={() => setOnlyAvail(v => !v)} style={{ opacity: onlyAvail ? 1 : 0.7 }}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18l-7 8v6l-4-2v-4z" /></svg>
                      </button>
                    </span>
                  </th>
                  {days.map(d => (
                    <th key={d.key} className="px-2 py-3 text-white text-sm font-medium" style={{ width: DAY_W, minWidth: DAY_W, borderLeft:'1px solid rgba(255,255,255,0.25)' }}>
                      <span className="inline-flex items-center gap-2">
                        <CheckBox light checked={colAll(d.key)} onChange={() => toggleCol(d.key)} label={`Seleccionar ${d.short}`} />
                        {d.short}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(p => {
                  const ra = rowAll(p)
                  return (
                    <tr key={p}>
                      <td className="px-3 py-2" style={{ position:'sticky', left:0, zIndex:2, background: ra ? SELECTED : '#fff', borderBottom:'1px solid #eef1f3' }}>
                        <span className="inline-flex items-center gap-3 text-sm" style={{ color:'#1a2a33' }}>
                          <CheckBox checked={ra} onChange={() => toggleRow(p)} label={`Seleccionar ${p}`} />
                          {p}
                        </span>
                      </td>
                      {days.map(d => {
                        const av = disp(d.key, p)
                        const can = av > 0
                        const hl = ra || colAll(d.key)
                        return (
                          <td key={d.key} className="px-2 py-1.5" style={{ background: hl ? SELECTED : '#fff', borderBottom:'1px solid #eef1f3', borderLeft:'1px solid #eef1f3' }}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-10 text-center text-sm tabular-nums" style={{ color:'#1a2a33' }}>{av}</span>
                              <input
                                type="number" min={0} max={av}
                                disabled={!can}
                                value={can ? (vals[d.key]?.[p] || '') : ''}
                                placeholder="0"
                                onChange={e => {
                                  const raw = e.target.value
                                  const n = Math.min(av, Math.max(0, parseInt(raw) || 0))
                                  setCell(d.key, p, raw === '' ? '' : String(n))
                                }}
                                aria-label={`${p} ${d.short}: cupos a devolver`}
                                className="w-16 text-center text-sm rounded-xl border px-1 py-1.5"
                                style={can
                                  ? { borderColor:'#7b8a93', background:'#fff', color:'#1a2a33', outline:'none' }
                                  : { borderColor:'#d4dce0', background:'#fff', color:'#b5bec3', outline:'none', cursor:'not-allowed' }}
                              />
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
                <tr>
                  <td className="px-3 py-3 text-sm font-semibold" style={{ position:'sticky', left:0, zIndex:2, background:'#f1f3f4', color:'#1a2a33' }}>Total</td>
                  {days.map(d => (
                    <td key={d.key} className="px-2 py-3" style={{ background:'#f1f3f4', borderLeft:'1px solid #e4e8ea' }}>
                      <div className="flex items-center justify-between gap-2 text-sm tabular-nums" style={{ color:'#1a2a33' }}>
                        <span className="w-10 text-center">{dayDisp(d.key)}</span>
                        <span className="w-16 text-center">{dayRet(d.key)}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="button"
              onClick={returnAll}
              disabled={allSelected}
              className="flex items-center gap-2 text-sm font-bold disabled:cursor-not-allowed"
              style={{ color: allSelected ? '#9cc3d6' : T }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3.5" y="3.5" width="17" height="17" rx="4" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.5 9.5A3.5 3.5 0 1012 15.5M14.5 9.5V7M14.5 9.5H17" /></svg>
              Devolver todos
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-6 px-6 py-4 flex-shrink-0 border-t" style={{ background:'#fff', borderColor:'#e4e8ea' }}>
          <button type="button" onClick={onClose} className="text-base font-bold" style={{ color: T }}>Cancelar</button>
          <button
            type="button"
            onClick={confirm}
            disabled={totalRet === 0}
            className="px-6 py-2.5 rounded-xl text-base font-bold text-white disabled:cursor-not-allowed"
            style={{ background: totalRet === 0 ? '#a7cfe2' : T }}
          >
            Devolver
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Alerts & confirm modal ──────────────────────────────────────────────────

type AlertData = { kind: 'success' | 'error'; title: string; text: React.ReactNode }

function AlertBanner({ alert, onClose }: { alert: AlertData; onClose: () => void }) {
  const ok = alert.kind === 'success'
  const c = ok
    ? { bg:'#f1f8ec', border:'#9ccc7f', title:'#4e8a2b', text:'#6aa843', close:'#8fc06e' }
    : { bg:'#f9e5e5', border:'#e0a0a0', title:'#c0392b', text:'#e08f8f', close:'#e8b4b4' }
  return (
    <div role="alert" className="fixed top-14 right-6 z-50 flex items-start gap-3 rounded-md border px-4 py-3 shadow-md" style={{ width: 560, background:c.bg, borderColor:c.border }}>
      <svg className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color:c.title }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {ok
          ? <><path d="M21 12a9 9 0 11-4.5-7.8" /><path d="M8 11.5l4 4L21 6" /></>
          : <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></>}
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold" style={{ color:c.title }}>{alert.title}</p>
        <p className="text-sm mt-0.5" style={{ color:c.text }}>{alert.text}</p>
      </div>
      <button onClick={onClose} aria-label="Cerrar" style={{ color:c.close }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  )
}

function OverTip({ text = 'El valor ingresado supera la cantidad por cupear del contrato.' }: { text?: string }) {
  return (
    <div className="hidden group-hover:block group-focus-within:block absolute left-1/2 -translate-x-1/2 top-full mt-1 z-30 pointer-events-none">
      <div className="mx-auto w-3 h-3 rotate-45 border-l border-t -mb-1.5 relative" style={{ background:'#fff', borderColor:'#c0392b' }} />
      <div className="rounded-xl border bg-white px-4 py-3 text-sm text-left shadow-md" style={{ width: 240, borderColor:'#c0392b', color:'#333', whiteSpace:'normal' }}>
        {text}
      </div>
    </div>
  )
}

function ConfirmModal({ text, onCancel, onAccept }: { text: string; onCancel: () => void; onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.3)' }}>
      <div className="rounded-2xl shadow-2xl p-6" style={{ width: 480, background: TL }}>
        <p className="text-lg font-bold mb-6" style={{ color: TD }}>{text}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2 rounded-xl border text-sm font-semibold" style={{ borderColor: T, color: T, background:'#fff' }}>Cancelar</button>
          <button onClick={onAccept} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: T }}>Aceptar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Filter select ────────────────────────────────────────────────────────────

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange:(v:string)=>void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <label className="text-xs font-medium mb-1" style={{ color:'#5a7a8a' }}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border appearance-none px-3 py-2.5 text-sm focus:outline-none"
          style={{ borderColor:'#c4d6e0', color:'#1a3a4a', background:'#fff', borderRadius:4, fontWeight:500 }}
        >
          {value === '' && <option value="" disabled hidden></option>}
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:'#7a9aaa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

function EmptySearch() {
  return (
    <div className="rounded-xl border bg-white flex items-center justify-center gap-10 py-12 px-6" style={{ borderColor:'#d5e3ea' }}>
      <svg width="220" height="180" viewBox="0 0 220 180" fill="none" aria-hidden>
        <rect x="52" y="22" width="86" height="120" rx="10" fill="#f3f5f6" stroke="#d5dbdf" />
        <rect x="26" y="38" width="86" height="110" rx="10" fill="#fff" stroke="#6b7680" />
        <rect x="40" y="56" width="26" height="5" rx="2.5" fill={T} />
        <rect x="40" y="70" width="56" height="5" rx="2.5" fill={T} />
        {[84, 96, 108, 120].map(y => <rect key={y} x="40" y={y} width="52" height="5" rx="2.5" fill="#cfd3d6" />)}
        <path d="M38 134c14-8 24 6 36-2" stroke="#4a5560" strokeWidth="1.3" strokeLinecap="round" />
        <ellipse cx="160" cy="146" rx="26" ry="14" fill="#f1f2f3" />
        <path d="M80 160h110" stroke="#9aa3aa" />
        <circle cx="132" cy="62" r="9" fill="#f6b8b0" />
        <path d="M123 60c0-9 14-12 18-3-6-1-12 0-18 3z" fill="#2c2c3a" />
        <path d="M116 84c0-6 5-9 16-9s14 4 15 12l3 36h-34z" fill={T} />
        <path d="M118 90l-24 18" stroke={T} strokeWidth="9" strokeLinecap="round" />
        <rect x="122" y="118" width="12" height="38" fill="#2c2c3a" />
        <rect x="136" y="118" width="12" height="38" fill="#2c2c3a" />
        <rect x="119" y="155" width="16" height="5" rx="2" fill="#2c2c3a" />
        <rect x="136" y="155" width="16" height="5" rx="2" fill="#2c2c3a" />
      </svg>
      <div style={{ maxWidth: 320 }}>
        <h2 className="text-lg font-bold mb-2" style={{ color: TD }}>Realizar una búsqueda</h2>
        <p className="text-sm text-gray-600">Para obtener la información de los cupos disponibles, realiza una búsqueda utilizando los filtros.</p>
      </div>
    </div>
  )
}

const PRODUCTOS = ['CAMELINA','CEBADA CERVECERA','CEBADA FORRAJERA','GIRASOL','MAIZ','MAIZ FLINT','SOJA','SOJA EPA','SORGO','TRIGO','TRIGO GLUTEN','TRIGO PROTEINA']
const PUERTOS = ['BAHIA BLANCA (LDC )','GENERAL LAGOS','TIMBUES']
const CLIENTES = ['ACA BIO COOPERATIVA LIMITADA','ACOPIO BALCARCE S.A.','ADECO AGROPECUARIA S.A.','AGRENCO ARGENTINA S.A.','AGRIC.UNIDOS DE TANCACHA COOP.AGRIC.LTDA','Agricola Ganadera Justiniano Posse','AGRO BAYER S. R. L.','AGRO CORTEVA ARGENTINA SOCIEDAD DE RESPONSABILIDAD LIMITADA']
const PROGRAMAS_SUST = ['2BSvs','CFR','EUDR','Regen Ag','RTRS']

function MultiFilterSelect({ label, values, options, onChange }: { label: string; values: string[]; options: string[]; onChange:(v:string[])=>void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const toggle = (o: string) => onChange(values.includes(o) ? values.filter(v => v !== o) : [...values, o])
  return (
    <div ref={ref} className="flex-1 flex flex-col min-w-0 relative">
      <label className="text-xs font-medium mb-1" style={{ color:'#5a7a8a' }}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border px-3 py-2.5 text-sm text-left flex items-center justify-between focus:outline-none"
        style={{ borderColor: open ? T : '#c4d6e0', color:'#1a3a4a', background:'#fff', borderRadius:4, fontWeight:500, minHeight:42 }}
      >
        <span className="truncate">{values.join(', ')}</span>
        <svg className="w-4 h-4 flex-shrink-0 ml-2" style={{ color:'#7a9aaa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-30 py-1 overflow-y-auto" style={{ borderColor:'#dde8ee', maxHeight:280 }}>
          {options.map(o => {
            const on = values.includes(o)
            return (
              <label key={o} className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50" style={{ color:'#1a3a4a' }}>
                <span className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0" style={{ background: on ? T : '#fff', borderColor: on ? T : '#777' }}>
                  {on && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(o)} />
                {o}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [alert, setAlert] = useState<AlertData | null>(null)
  const [mode, setMode]   = useState<Mode>('generar')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [selectedDays, setSelectedDays]       = useState<Set<string>>(new Set(['d1','d2','d3']))
  const [allDaysSelected, setAllDaysSelected] = useState(false)
  const [pedidos,      setPedidos]      = useState<Record<string,Record<string,string>>>({})
  const [nominaciones, setNominaciones] = useState<Record<string,Record<string,string>>>({})
  const [programInputs, setProgramInputs] = useState<Record<string,Record<string,string>>>({})
  // Lo nominado al confirmar en Generar cupos se descuenta de Por cupear
  const [consumed, setConsumed] = useState<Record<string,number>>({})
  const pcOf = (c: ContractRow) => Math.max(0, c.porCupear - (consumed[c.rowId] || 0))
  const [infoOpen, setInfoOpen] = useState<'contrato'|'nominar'|null>(null)
  const [genAdds, setGenAdds] = useState<Record<string,Record<string,number>>>({})
  // Efecto de "Solicitar pedido": lo pedido pasa a En gestión y descuenta Disponibles
  const [gestionC, setGestionC] = useState<Record<string,Record<string,number>>>({ r3:{ d5:5 }, r5:{ d6:10 } })
  const [gestionP, setGestionP] = useState<Record<string,Record<string,number>>>({})
  const getGestionC = (rowId: string, dayKey: string) => gestionC[rowId]?.[dayKey] || 0
  const getGestionP = (dayKey: string, name: string) => gestionP[dayKey]?.[name] || 0
  const dayTakenC = (dayKey: string) => CONTRACTS.reduce((t, c) => t + getGestionC(c.rowId, dayKey), 0)
  // Aprobados por el administrador: son los que descuentan Disponible
  const [aprobC, setAprobC] = useState<Record<string,Record<string,number>>>({})
  const [aprobP, setAprobP] = useState<Record<string,Record<string,number>>>({})
  const [resolveT, setResolveT] = useState<{ kind:'C'|'P'; dayKey:string; id:string; title:string; pending:number } | null>(null)
  // Cupos devueltos por el cliente: también descuentan Disponible
  const [devueltos, setDevueltos] = useState<Record<string,Record<string,number>>>({})
  const [devolverOpen, setDevolverOpen] = useState(false)
  const dayReturned = (dayKey: string) => Object.values(devueltos[dayKey] || {}).reduce((t, v) => t + v, 0)
  const dayApproved = (dayKey: string) =>
    CONTRACTS.reduce((t, c) => t + (aprobC[c.rowId]?.[dayKey] || 0), 0) + Object.values(aprobP[dayKey] || {}).reduce((t, v) => t + v, 0)
  const dispDay = (d: DayInfo) => Math.max(0, d.disponibles - dayApproved(d.key) - dayReturned(d.key))
  const dispProg = (d: DayInfo, name: string, base: number) => Math.max(0, base - (aprobP[d.key]?.[name] || 0) - (devueltos[d.key]?.[name] || 0))
  function resolvePending(approved: number) {
    if (!resolveT) return
    const t = resolveT
    const rejected = t.pending - approved
    if (t.kind === 'C') {
      setGestionC(prev => ({ ...prev, [t.id]: { ...prev[t.id], [t.dayKey]: 0 } }))
      if (approved > 0) setAprobC(prev => ({ ...prev, [t.id]: { ...prev[t.id], [t.dayKey]: (prev[t.id]?.[t.dayKey] || 0) + approved } }))
    } else {
      setGestionP(prev => ({ ...prev, [t.dayKey]: { ...prev[t.dayKey], [t.id]: 0 } }))
      if (approved > 0) setAprobP(prev => ({ ...prev, [t.dayKey]: { ...prev[t.dayKey], [t.id]: (prev[t.dayKey]?.[t.id] || 0) + approved } }))
    }
    setResolveT(null)
    setAlert({ kind:'success', title:'Resolución registrada', text:<>{t.title}: {approved} aprobado{approved === 1 ? '' : 's'} y {rejected} rechazado{rejected === 1 ? '' : 's'}. Los aprobados se descontaron de Disponible.</> })
  }
  const getGen = (c: ContractRow, dayKey: string) => Math.max(0, (c.gen[dayKey] || 0) + (genAdds[c.rowId]?.[dayKey] || 0))
  const [extraProgs, setExtraProgs] = useState<Record<string,string[]>>({})
  const dayProgs = (d: DayInfo) => [...d.programs, ...(extraProgs[d.key] || []).map(name => ({ name, disp: 5 }))]
  const [progModal, setProgModal] = useState<{ dayKey:string } | null>(null)

  const [producto, setProducto] = useState('')
  const [puerto,   setPuerto]   = useState('')
  const [searched, setSearched] = useState(false)
  const [solicitarTipo, setSolicitarTipo] = useState<'contrato'|'nominar'>('contrato')
  const [programa, setPrograma] = useState<string[]>([])
  const [cliente,  setCliente]  = useState('')

  const [containerWidth, setContainerWidth] = useState(900)
  const matrixRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = matrixRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const visibleDays = allDaysSelected
    ? ALL_DAYS
    : ALL_DAYS.filter(d => selectedDays.has(d.key))

  function toggleDay(key: string) {
    setAllDaysSelected(false)
    setSelectedDays(prev => {
      const s = new Set(prev)
      s.has(key) ? s.delete(key) : s.add(key)
      return s
    })
  }

  function toggleAllDays() {
    if (allDaysSelected) {
      setAllDaysSelected(false)
      setSelectedDays(new Set())
    } else {
      setAllDaysSelected(true)
      setSelectedDays(new Set(ALL_DAYS.map(d => d.key)))
    }
  }

  function updateInput(type: 'pedido'|'nominar', rowId: string, dayKey: string, val: string) {
    if (type === 'pedido') setPedidos(prev => ({ ...prev, [rowId]: { ...prev[rowId], [dayKey]: val } }))
    else setNominaciones(prev => ({ ...prev, [rowId]: { ...prev[rowId], [dayKey]: val } }))
  }

  function getColTotal(type: 'pedido'|'nominar', dayKey: string) {
    const map = type === 'pedido' ? pedidos : nominaciones
    return CONTRACTS.reduce((s,c) => s + (parseInt(map[c.rowId]?.[dayKey] || '0') || 0), 0)
  }

  const activeMap = mode === 'solicitar' ? pedidos : nominaciones
  const rowTotal = (rowId: string) => Object.values(activeMap[rowId] || {}).reduce((s, v) => s + (parseInt(v) || 0), 0)
  // Pendiente por cupear real: en Solicitar se descuenta lo ya pedido (En gestión) y lo aprobado
  const committed = (c: ContractRow) =>
    Object.values(gestionC[c.rowId] || {}).reduce((t, v) => t + v, 0) + Object.values(aprobC[c.rowId] || {}).reduce((t, v) => t + v, 0)
  const limitOf = (c: ContractRow) => mode === 'solicitar' ? Math.max(0, pcOf(c) - committed(c)) : pcOf(c)
  // Un contrato no puede pedir si ese día hay disponible en Libre o en su combinación de programas
  const progKey = (name: string) => name.split(';').map(x => x.trim().toUpperCase().replace(/VS$/, '')).sort().join(';')
  const blockedBy = (c: ContractRow, d: DayInfo): string | null => {
    const progs = dayProgs(d).map(pr => ({ name: pr.name, disp: dispProg(d, pr.name, pr.disp) }))
    const libre = progs.find(pr => pr.name === 'Libre' && pr.disp > 0)
    if (libre) return 'Libre'
    const combo = progs.find(pr => pr.name !== 'Libre' && pr.disp > 0 && progKey(pr.name) === progKey(c.programas))
    return combo ? combo.name : null
  }
  // Solo se puede pedir por programas una combinación que exista en algún contrato (Libre siempre es válida)
  const contractKeys = new Set(CONTRACTS.map(c => progKey(c.programas)))
  const hasContractFor = (name: string) => name === 'Libre' || contractKeys.has(progKey(name))
  const progValid = hasContractFor
  const hasAvail = (c: ContractRow, d: DayInfo) => blocked(c, d) && (parseInt(pedidos[c.rowId]?.[d.key] || '0') || 0) > 0
  const blocked = (c: ContractRow, d: DayInfo) => mode === 'solicitar' && solicitarTipo === 'contrato' && blockedBy(c, d) !== null
  const isOver = (c: ContractRow, dayKey: string) => (parseInt(activeMap[c.rowId]?.[dayKey] || '0') || 0) > 0 && rowTotal(c.rowId) > limitOf(c)
  const progTotal = (dayKey: string) => Object.values(programInputs[dayKey] || {}).reduce((t, v) => t + (parseInt(v) || 0), 0)
  const hasErrors = CONTRACTS.some(c => rowTotal(c.rowId) > limitOf(c)) ||
    (mode === 'solicitar' && solicitarTipo === 'contrato' && CONTRACTS.some(c => ALL_DAYS.some(d => (parseInt(pedidos[c.rowId]?.[d.key] || '0') || 0) > 0 && blockedBy(c, d) !== null))) || (mode === 'solicitar' && solicitarTipo === 'nominar' && ALL_DAYS.some(d => progTotal(d.key) > MAX_PEDIDO))
  const hasProgValues = mode === 'solicitar' && solicitarTipo === 'nominar' && ALL_DAYS.some(d => progTotal(d.key) > 0)
  const hasValues = hasProgValues || CONTRACTS.some(c => rowTotal(c.rowId) > 0)

  function resetAll() {
    setSearched(false)
    setProducto(''); setPuerto(''); setCliente(''); setPrograma([])
    setPedidos({}); setNominaciones({}); setProgramInputs({}); setExtraProgs({})
    setSelectedDays(new Set(['d1','d2','d3'])); setAllDaysSelected(false)
    setMode('generar')
  }

  function submitOrder() {
    setConfirmOpen(false)
    if (mode === 'generar') {
      // Lo nominado se descuenta de Generado y la pantalla se mantiene con la misma búsqueda
      setGenAdds(prev => {
        const next = { ...prev }
        CONTRACTS.forEach(c => {
          const row = { ...(next[c.rowId] || {}) }
          Object.entries(nominaciones[c.rowId] || {}).forEach(([dk, v]) => {
            const n = parseInt(v) || 0
            if (n > 0) row[dk] = (row[dk] || 0) - n
          })
          next[c.rowId] = row
        })
        return next
      })
      setConsumed(prev => {
        const next = { ...prev }
        CONTRACTS.forEach(c => { next[c.rowId] = (next[c.rowId] || 0) + rowTotal(c.rowId) })
        return next
      })
      setNominaciones({})
    } else if (solicitarTipo === 'contrato') {
      setGestionC(prev => {
        const next = { ...prev }
        CONTRACTS.forEach(c => {
          const row = { ...(next[c.rowId] || {}) }
          Object.entries(pedidos[c.rowId] || {}).forEach(([dk, v]) => {
            const n = parseInt(v) || 0
            if (n > 0) row[dk] = (row[dk] || 0) + n
          })
          next[c.rowId] = row
        })
        return next
      })
      setPedidos({})
    } else {
      setGestionP(prev => {
        const next = { ...prev }
        Object.entries(programInputs).forEach(([dk, progs]) => {
          const day = { ...(next[dk] || {}) }
          Object.entries(progs).forEach(([name, v]) => {
            const n = parseInt(v) || 0
            if (n > 0) day[name] = (day[name] || 0) + n
          })
          next[dk] = day
        })
        return next
      })
      setProgramInputs({})
    }
    setAlert({ kind:'success', title:'Operación realizada con éxito', text:<>Para visualizar los códigos generados ingresa a: Logística &gt; Consulta de Cupos.</> })
  }

  // Column widths for sticky left section
  const CW = { contract:128, program:86, cupear:80, client:70 }
  const progMaxLen = visibleDays.length === 0 ? 0 : Math.max(...visibleDays.map(d => dayProgs(d).length))

  const BG = '#e6f4f9'  // unified with TL
  const colBg = (di: number) => di % 2 === 1 ? '#f0f0f0' : undefined  // odd-index cols get gray-25 tint

  const PAD = 0
  const stickyW = CW.contract + CW.program + CW.cupear + CW.client
  const L0 = PAD
  const L1 = PAD + CW.contract
  const L2 = PAD + CW.contract + CW.program
  const L3 = PAD + CW.contract + CW.program + CW.cupear
  const subCols = mode === 'solicitar' ? 3 : 2
  // Fix sub-column width so exactly 4.5 day-groups are visible; rest scrolls
  const DAYS_VISIBLE = mode === 'solicitar' ? 3 : 4.5
  const baseSubColW = Math.max(60, (containerWidth - stickyW) / (DAYS_VISIBLE * subCols))
  const fillSubColW = visibleDays.length > 0 ? (containerWidth - stickyW) / (visibleDays.length * subCols) : baseSubColW
  const DISP_W = 112
  const subColW = mode === 'solicitar'
    ? Math.max(88, ((containerWidth - stickyW) / 3 - DISP_W) / 2)
    : Math.max(baseSubColW, fillSubColW)
  const colW = (si: number) => (mode === 'solicitar' && si === 0 ? DISP_W : subColW)
  const tableW = stickyW + visibleDays.length * (mode === 'solicitar' ? DISP_W + 2 * subColW : subCols * subColW)

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily:"'Inter',sans-serif" }}>
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(p => !p)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar breadcrumb={['Logística','Cupos','Gestión de cupos']} />

        {/* Entire content area: light teal background */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: BG }}>

          {/* Controls */}
          <div className="flex-shrink-0 px-4 pt-4 pb-0" style={{ background: TL }}>
            <div>
              {/* Filters */}
              <div className="flex gap-3 items-end mb-4">
                <FilterSelect label="Producto *"           value={producto} options={PRODUCTOS} onChange={setProducto} />
                <FilterSelect label="Puerto *"             value={puerto}   options={PUERTOS} onChange={setPuerto} />
                <FilterSelect label="Cliente"              value={cliente}  options={CLIENTES} onChange={setCliente} />
                <MultiFilterSelect label="Programa Sustentable" values={programa} options={PROGRAMAS_SUST} onChange={setPrograma} />
                <div className="flex flex-col justify-end flex-shrink-0">
                  <div style={{ height: 20 }} />
                  <button
                    onClick={() => { if (producto && puerto) setSearched(true) }}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white"
                    style={{ background: T, borderRadius: 6, opacity: producto && puerto ? 1 : 0.6 }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="6" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4" /></svg>
                    Buscar
                  </button>
                </div>
              </div>

              {/* Day tabs */}
              {searched && (
                <div className="flex items-center gap-2 overflow-x-auto mb-4">
                  <button
                    onClick={toggleAllDays}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    style={{
                      background: allDaysSelected ? TD : '#fff',
                      borderColor: allDaysSelected ? TD : '#a8c4d4',
                      color: allDaysSelected ? '#fff' : '#4a6878',
                    }}
                  >
                    Todos
                  </button>
                  {ALL_DAYS.map(d => {
                    const active = selectedDays.has(d.key)
                    return (
                      <button
                        key={d.key}
                        onClick={() => toggleDay(d.key)}
                        className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                        style={{
                          background: active ? TD : '#fff',
                          borderColor: active ? TD : '#a8c4d4',
                          color: active ? '#fff' : '#4a6878',
                        }}
                      >
                        {d.short}
                      </button>
                    )
                  })}
                </div>
              )}

            </div>
          </div>

          {/* Matrix */}
          <div ref={matrixRef} className="flex-1 overflow-hidden flex flex-col" style={{ padding: "0 16px" }}>
            {!searched && <EmptySearch />}
            <div className="flex-1 overflow-auto matrix-wrap" style={{ display: searched ? undefined : 'none' }}>
              <table className="matrix-table text-xs" style={{ width: tableW }}>
                <colgroup>
                  <col style={{ width: CW.contract }} />
                  <col style={{ width: CW.program }} />
                  <col style={{ width: CW.cupear }} />
                  <col style={{ width: CW.client }} />
                  {visibleDays.map(d =>
                    Array.from({ length: subCols }).map((_, si) => (
                      <col key={`${d.key}-${si}`} style={{ width: colW(si), minWidth: colW(si) }} />
                    ))
                  )}
                </colgroup>
                <thead>
                  {/* Row 1: toggle cell (rowSpan=2) + day group headers */}
                  <tr>
                    {/* Toggle + devolver in the sticky left area, spans both header rows */}
                    <th
                      className="sticky-col sticky-col-head"
                      colSpan={4}
                      rowSpan={2}
                      style={{
                        left: L0,
                        width: CW.contract + CW.program + CW.cupear + CW.client,
                        minWidth: CW.contract + CW.program + CW.cupear + CW.client,
                        background: BG,
                        verticalAlign: 'middle',
                        padding: '0',
                        boxShadow: 'none',
                        textAlign: 'left',
                      }}
                    >
                      {/* Mode toggle pill */}
                      <div
                        className="flex rounded-full p-1 mb-2"
                        style={{ background:'#fff', border:'1.5px solid #b0c8d8', display:'inline-flex', alignSelf:'flex-start' }}
                      >
                        <button
                          onClick={() => setMode('generar')}
                          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                          style={{
                            background: mode === 'generar' ? T : 'transparent',
                            color: mode === 'generar' ? '#fff' : '#2a6070',
                          }}
                        >
                          Generar cupos
                        </button>
                        <button
                          onClick={() => setMode('solicitar')}
                          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                          style={{
                            background: mode === 'solicitar' ? T : 'transparent',
                            color: mode === 'solicitar' ? '#fff' : '#2a6070',
                          }}
                        >
                          Solicitar cupos
                        </button>
                      </div>
                      {mode === 'solicitar' ? (
                        <div className="flex items-center gap-6 mt-3">
                          {([
                            ['contrato','Por contrato','Solicite cupos asociados a un contrato. Una vez aprobada la solicitud, el cupo se genera automáticamente.'],
                            ['nominar','Por cantidad','Solicite una cantidad sin asociarla a un contrato. Una vez aprobada la solicitud, quedará disponible para que pueda nominarla posteriormente.'],
                          ] as const).map(([val,label,info]) => (
                            <div key={val} className="relative flex items-center gap-1.5">
                              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color:'#1a3a4a', fontWeight:400 }}>
                                <input
                                  type="radio"
                                  name="solicitar-tipo"
                                  checked={solicitarTipo === val}
                                  onChange={() => { setSolicitarTipo(val); if (val === 'contrato') setProgramInputs({}); else setPedidos({}) }}
                                  className="mildc-radio"
                                />
                                {label}
                              </label>
                              <InfoTip text={info} open={infoOpen === val} onToggle={() => setInfoOpen(infoOpen === val ? null : val)} onClose={() => setInfoOpen(null)} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <button onClick={() => setDevolverOpen(true)} className="flex items-center gap-2 text-sm font-semibold mt-2" style={{ color: T }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Devolver cupos disponibles
                          </button>
                        </div>
                      )}
                    </th>
                    {/* Day group headers */}
                    {visibleDays.map((d, di) => (
                      <th
                        key={d.key}
                        colSpan={mode==='solicitar' ? 3 : 2}
                        className="text-center font-bold text-white px-3 py-2.5 border-r"
                        style={{ background: di%2===1 ? '#0b506a' : TD, borderColor:'#0a4d63', whiteSpace:'nowrap', fontSize:12 }}
                      >
                        {d.label}
                      </th>
                    ))}
                  </tr>

                  {/* Row 2: Disponibles sub-header only (left cells covered by rowSpan above) */}
                  <tr>
                    {visibleDays.map((d, di) => {
                      const subBg = di%2===1 ? '#d0e8f0' : TL
                      return mode === 'solicitar' ? (
                        <Fragment key={d.key}>
                          <td className="py-2 px-3 border-r text-xs font-medium" style={{ background: subBg, color: TD, borderColor:'#b8d8e8' }}>
                            <div className="flex items-center justify-between gap-1">
                              <span>Disponibles</span>
                              <span className="font-bold">{dispDay(d)}</span>
                            </div>
                          </td>
                          <td className="text-center py-2 px-3 border-r text-xs font-medium whitespace-nowrap" style={{ background: subBg, color: TD, borderColor:'#b8d8e8' }}>En gestión</td>
                          <td className="text-center py-2 px-3 border-r text-xs font-medium" style={{ background: subBg, color: TD, borderColor:'#b8d8e8' }}>Solicitar</td>
                        </Fragment>
                      ) : (
                        <Fragment key={d.key}>
                          <td colSpan={2} className="py-2 px-3 border-r text-xs font-medium" style={{ background: subBg, color: TD, borderColor:'#b8d8e8' }}>
                            <div className="flex items-center justify-between gap-1">
                              <span>Disponibles</span>
                              <span className="font-bold">{dispDay(d)}</span>
                            </div>
                          </td>
                        </Fragment>
                      )
                    })}
                  </tr>
                </thead>

                <tbody>
                  {/* Program availability rows */}
                  {Array.from({ length: progMaxLen }).map((_, pi) => (
                    <tr key={`prog-${pi}`}>
                      {pi === 0 && (
                        <>
                          <td rowSpan={progMaxLen} className="sticky-col" style={{ left:L0, background:BG }}></td>
                          <td rowSpan={progMaxLen} className="sticky-col" style={{ left:L1, background:BG }}></td>
                          <td rowSpan={progMaxLen} className="sticky-col" style={{ left:L2, background:BG }}></td>
                          <td rowSpan={progMaxLen} className="sticky-col" style={{ left:L3, background:BG, boxShadow:'2px 0 4px rgba(0,0,0,0.08)' }}></td>
                        </>
                      )}
                      {visibleDays.map((d, di) => {
                        const prog = dayProgs(d)[pi]
                        const cb = colBg(di) ?? '#fff'
                        if (mode === 'solicitar') {
                          return prog ? (
                            <Fragment key={d.key}>
                              <td className="px-3 py-1.5 border-r text-gray-700" style={{ background:cb, borderColor:'#dde8ee' }}>
                                <div className="flex items-center justify-between gap-1">
                                  <span>{prog.name}</span>
                                  <span className="font-semibold" style={{ color: TD }}>{dispProg(d, prog.name, prog.disp)}</span>
                                </div>
                              </td>
                              <td className="px-3 py-1.5 border-r text-center text-gray-500" style={{ background:cb, borderColor:'#dde8ee' }}>
                                <PendingCell n={getGestionP(d.key, prog.name)} onClick={() => setResolveT({ kind:'P', dayKey:d.key, id:prog.name, title:`${prog.name} · ${d.label}`, pending:getGestionP(d.key, prog.name) })} />
                              </td>
                              <td className="px-2 py-1 border-r" style={{ background:cb, borderColor:'#dde8ee' }}>
                                <input
                                  type="number" min={0}
                                  value={progValid(prog.name) ? (programInputs[d.key]?.[prog.name] || '') : ''}
                                  onChange={e => setProgramInputs(prev => ({ ...prev, [d.key]: { ...prev[d.key], [prog.name]: e.target.value } }))}
                                  disabled={solicitarTipo === 'contrato' || !progValid(prog.name)}
                                  title={solicitarTipo !== 'contrato' && !progValid(prog.name) ? 'Esta combinación de programas no existe en ningún contrato.' : undefined}
                                  className="w-16 text-right text-xs rounded-md border px-2 py-0.5"
                                  style={solicitarTipo === 'contrato' || !progValid(prog.name)
                                    ? { borderColor:'#e1e7ea', outline:'none', background:'#f3f5f6', color:'#aab4b9', cursor:'not-allowed' }
                                    : { borderColor: progTotal(d.key) > MAX_PEDIDO ? '#c0392b' : '#c0d8e4', color: progTotal(d.key) > MAX_PEDIDO ? '#c0392b' : undefined, outline:'none', background:'#fff' }}
                                  placeholder="0"
                                />
                              </td>
                            </Fragment>
                          ) : (
                            <Fragment key={d.key}>
                              <td className="border-r" style={{ background:cb, borderColor:'#dde8ee' }}></td>
                              <td className="border-r" style={{ background:cb, borderColor:'#dde8ee' }}></td>
                              <td className="border-r" style={{ background:cb, borderColor:'#dde8ee' }}></td>
                            </Fragment>
                          )
                        } else {
                          return prog ? (
                            <Fragment key={d.key}>
                              <td colSpan={2} className="px-3 py-1.5 border-r text-gray-700" style={{ background:cb, borderColor:'#dde8ee' }}>
                                <div className="flex items-center justify-between gap-1">
                                  <span>{prog.name}</span>
                                  <span className="font-semibold" style={{ color: TD }}>{dispProg(d, prog.name, prog.disp)}</span>
                                </div>
                              </td>
                            </Fragment>
                          ) : (
                            <Fragment key={d.key}>
                              <td colSpan={2} className="border-r" style={{ background:cb, borderColor:'#dde8ee' }}></td>
                            </Fragment>
                          )
                        }
                      })}
                    </tr>
                  ))}

                  {/* + add program row (solicitar only) */}
                  {mode === 'solicitar' && (
                    <tr key="add-prog-row">
                      <td className="sticky-col" style={{ left:L0, background:BG, borderBottom:'2px solid #9ec4d6' }}></td>
                      <td className="sticky-col" style={{ left:L1, background:BG, borderBottom:'2px solid #9ec4d6' }}></td>
                      <td className="sticky-col" style={{ left:L2, background:BG, borderBottom:'2px solid #9ec4d6' }}></td>
                      <td className="sticky-col" style={{ left:L3, background:BG, borderBottom:'2px solid #9ec4d6', boxShadow:'2px 0 4px rgba(0,0,0,0.08)' }}></td>
                      {visibleDays.map((d, di) => (
                        <Fragment key={d.key}>
                          <td colSpan={3} className="py-1.5 px-3 border-r" style={{ background: colBg(di) ?? '#fff', borderColor:'#dde8ee', borderBottom:'2px solid #9ec4d6' }}>
                            <button
                              onClick={() => setProgModal({ dayKey: d.key })}
                              disabled={solicitarTipo === 'contrato'}
                              title={solicitarTipo === 'contrato' ? 'Elegí "Por cantidad" para agregar programas.' : undefined}
                              className="text-xl font-bold leading-none disabled:cursor-not-allowed"
                              style={{ color: solicitarTipo === 'contrato' ? '#b9cdd6' : T }}
                            >+</button>
                          </td>
                        </Fragment>
                      ))}
                    </tr>
                  )}

                  {/* Contract section header */}
                  <tr key="contract-header">
                    {[
                      { label:'N° Contrato', left:L0, w:CW.contract },
                      { label:'Programas',   left:L1, w:CW.program  },
                      { label:'Por cupear',  left:L2, w:CW.cupear   },
                      { label:'Cliente',     left:L3, w:CW.client   },
                    ].map((col, ci) => (
                      <th
                        key={col.label}
                        className="sticky-col text-left px-3 py-2.5 font-semibold text-white border-r"
                        style={{
                          left:col.left, width:col.w, minWidth:col.w,
                          background: TD, borderColor:'#0a4d63', fontSize:11,
                          whiteSpace:'nowrap', overflow:'hidden',
                          boxShadow: ci===3 ? '2px 0 4px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        {col.label}
                        {(col.label==='N° Contrato'||col.label==='Programas') && (
                          <svg className="inline-block ml-1 w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
                        )}
                      </th>
                    ))}
                    {visibleDays.map((d, di) => {
                      const hbg = di%2===1 ? '#0b506a' : TD
                      return mode === 'solicitar' ? (
                        <Fragment key={d.key}>
                          <th className="text-center px-3 py-2.5 font-semibold text-white border-r text-xs" style={{ background: hbg, borderColor:'#0a4d63' }}>Generado</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-white border-r text-xs" style={{ background: hbg, borderColor:'#0a4d63' }}>En gestión</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-white border-r text-xs" style={{ background: hbg, borderColor:'#0a4d63' }}>Solicitar</th>
                        </Fragment>
                      ) : (
                        <Fragment key={d.key}>
                          <th className="text-center px-3 py-2.5 font-semibold text-white border-r text-xs" style={{ background: hbg, borderColor:'#0a4d63' }}>Generado</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-white border-r text-xs" style={{ background: hbg, borderColor:'#0a4d63' }}>Nominar</th>
                        </Fragment>
                      )
                    })}
                  </tr>

                  {/* Contract rows */}
                  {CONTRACTS.map((c, ci) => (
                    <tr key={c.rowId} style={{ borderBottom:'1px solid #dde8ee' }}>
                      <td className="sticky-col px-3 py-2 border-r text-gray-800" style={{ left:L0, background: ci%2===0?'#fff':'#f4fafd', fontSize:11, borderColor:'#dde8ee', whiteSpace:'nowrap', overflow:'hidden' }}>{c.contractId}</td>
                      <td className="sticky-col px-3 py-2 border-r text-gray-600" style={{ left:L1, background: ci%2===0?'#fff':'#f4fafd', fontSize:11, borderColor:'#dde8ee', whiteSpace:'nowrap', overflow:'hidden' }}>{c.programas}</td>
                      <td className="sticky-col px-3 py-2 border-r text-gray-700 text-right" style={{ left:L2, background: ci%2===0?'#fff':'#f4fafd', fontSize:11, borderColor:'#dde8ee', whiteSpace:'nowrap', overflow:'hidden' }}>{pcOf(c)}</td>
                      <td className="sticky-col px-3 py-2 border-r text-gray-600" style={{ left:L3, background: ci%2===0?'#fff':'#f4fafd', fontSize:11, borderColor:'#dde8ee', whiteSpace:'nowrap', overflow:'hidden', boxShadow:'2px 0 4px rgba(0,0,0,0.08)' }}>{c.cliente}</td>
                      {visibleDays.map((d, di) => {
                        const gen = getGen(c, d.key)
                        const base = ci%2===0?'#fff':'#f4fafd'
                        const rowBg = colBg(di) ?? base
                        return mode === 'solicitar' ? (
                          <Fragment key={d.key}>
                            <td className="px-3 py-2 text-center border-r text-gray-700" style={{ background:rowBg, borderColor:'#dde8ee' }}>{gen}</td>
                            <td className="px-3 py-2 text-center border-r text-gray-500" style={{ background:rowBg, borderColor:'#dde8ee' }}>
                              <PendingCell n={getGestionC(c.rowId, d.key)} onClick={() => setResolveT({ kind:'C', dayKey:d.key, id:c.rowId, title:`Contrato ${c.contractId} · ${d.label}`, pending:getGestionC(c.rowId, d.key) })} />
                            </td>
                            <td
                              className="px-2 py-1.5 border-r relative group focus-within:z-20 hover:z-20"
                              style={{ background:rowBg, borderColor:'#dde8ee' }}
                            >
                              <input
                                type="number" min={0}
                                value={pedidos[c.rowId]?.[d.key] || ''}
                                onChange={e => updateInput('pedido', c.rowId, d.key, e.target.value)}
                                disabled={solicitarTipo === 'nominar'}
                                className="w-16 text-right text-xs rounded-md border px-2 py-0.5"
                                style={solicitarTipo === 'nominar'
                                  ? { borderColor:'#e1e7ea', outline:'none', background:'#f3f5f6', color:'#aab4b9', cursor:'not-allowed' }
                                  : { borderColor: (isOver(c, d.key) || hasAvail(c, d)) ? '#c0392b' : '#c0d8e4', color: (isOver(c, d.key) || hasAvail(c, d)) ? '#c0392b' : undefined, outline:'none', background:'#fff' }}
                                placeholder="0"
                              />
                              {isOver(c, d.key)
                                ? <OverTip text={`El valor ingresado supera lo pendiente por cupear del contrato (quedan ${limitOf(c)}).`} />
                                : hasAvail(c, d) && <OverTip text={`No se puede solicitar: hay cupos disponibles en ${blockedBy(c, d)} para este día. Usá Generar cupos.`} />}
                            </td>
                          </Fragment>
                        ) : (
                          <Fragment key={d.key}>
                            <td className="px-3 py-2 text-center border-r text-gray-700" style={{ background:rowBg, borderColor:'#dde8ee' }}>{gen}</td>
                            <td className="px-2 py-1.5 border-r text-center relative group focus-within:z-20 hover:z-20" style={{ background:rowBg, borderColor:'#dde8ee' }}>
                              <input
                                type="number" min={0}
                                value={nominaciones[c.rowId]?.[d.key] || ''}
                                onChange={e => updateInput('nominar', c.rowId, d.key, e.target.value)}
                                className="w-16 text-center text-xs rounded-md border px-2 py-0.5"
                                style={{ borderColor: isOver(c, d.key) ? '#c0392b' : '#c0d8e4', color: isOver(c, d.key) ? '#c0392b' : undefined, outline:'none', background:'#fff' }}
                                placeholder="0"
                              />
                              {isOver(c, d.key) && <OverTip text={`No podés nominar más del disponible por cupear del contrato (quedan ${pcOf(c)}).`} />}
                            </td>
                          </Fragment>
                        )
                      })}
                    </tr>
                  ))}

                  {/* TOTAL */}
                  <tr key="total-row" style={{ borderTop:'2px solid #8ab8cc' }}>
                    <td className="sticky-col px-3 py-2.5 font-bold border-r text-gray-900" style={{ left:L0, background:TL, borderColor:'#b8d8e8' }}>TOTAL</td>
                    <td className="sticky-col px-3 py-2.5 border-r" style={{ left:L1, background:TL, borderColor:'#b8d8e8' }}></td>
                    <td className="sticky-col px-3 py-2.5 font-bold text-right border-r text-gray-900" style={{ left:L2, background:TL, borderColor:'#b8d8e8' }}>{CONTRACTS.reduce((s,c)=>s+pcOf(c),0)}</td>
                    <td className="sticky-col px-3 py-2.5 border-r" style={{ left:L3, background:TL, borderColor:'#b8d8e8', boxShadow:'2px 0 4px rgba(0,0,0,0.08)' }}></td>
                    {visibleDays.map((d, di) => {
                      const totBg = colBg(di) ?? TL
                      return mode === 'solicitar' ? (
                        <Fragment key={d.key}>
                          <td className="px-3 py-2.5 text-center font-bold border-r" style={{ background:totBg, borderColor:'#b8d8e8' }}>{CONTRACTS.reduce((s,c)=>s+getGen(c, d.key),0)}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-gray-500 border-r" style={{ background:totBg, borderColor:'#b8d8e8' }}>{dayTakenC(d.key)}</td>
                          <td className="px-3 py-2.5 text-center font-bold border-r" style={{ background:totBg, borderColor:'#b8d8e8' }}>{getColTotal('pedido',d.key)}</td>
                        </Fragment>
                      ) : (
                        <Fragment key={d.key}>
                          <td className="px-3 py-2.5 text-center font-bold border-r" style={{ background:totBg, borderColor:'#b8d8e8' }}>{CONTRACTS.reduce((s,c)=>s+getGen(c, d.key),0)}</td>
                          <td className="px-3 py-2.5 text-center font-bold border-r" style={{ background:totBg, borderColor:'#b8d8e8' }}>{getColTotal('nominar',d.key)}</td>
                        </Fragment>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer bar */}
            <div className="flex-shrink-0 flex items-start gap-3 px-4 py-3 border-t" style={{ background:TL, borderColor:'#a8ccd8' }}>
              {searched ? <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: T }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <span className="flex-1" />}
              <div className="text-xs text-gray-600 flex-1" style={{ display: searched ? undefined : 'none' }}>
                {mode === 'generar' ? (
                  <>
                    <p>Se mostrarán y se podrán gestionar únicamente los contratos abiertos hasta un periodo de entrega de 45 dias.</p>
                    <p className="mt-1">Los cupos disponibles <strong>libres</strong> se pueden utilizar para cualquier combinación de programa sustentable, excepto los limitados.</p>
                  </>
                ) : (
                  <p>Se mostrarán y se podrán gestionar únicamente los contratos abiertos hasta un período de entrega de 30 días.</p>
                )}
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={resetAll}
                  className="px-5 py-2 rounded-xl border text-sm font-medium border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={!searched || hasErrors || !hasValues}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:cursor-not-allowed"
                  style={{ background: searched && !hasErrors && hasValues ? TD : '#c9ced1' }}
                >
                  {mode === 'generar' ? 'Generar códigos' : 'Enviar solicitud'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && <ConfirmModal text={mode === 'generar' ? '¿Confirmás generar los códigos para los cupos nominados?' : '¿Confirmás enviar la solicitud de cupos?'} onCancel={() => setConfirmOpen(false)} onAccept={submitOrder} />}
      {alert && <AlertBanner alert={alert} onClose={() => setAlert(null)} />}
      {devolverOpen && (() => {
        const names: string[] = []
        ALL_DAYS.forEach(d => dayProgs(d).forEach(pr => { if (!names.includes(pr.name)) names.push(pr.name) }))
        const dispOf = (dayKey: string, name: string) => {
          const d = ALL_DAYS.find(x => x.key === dayKey)!
          const pr = dayProgs(d).find(x => x.name === name)
          return pr ? dispProg(d, name, pr.disp) : 0
        }
        return (
          <DevolverModal
            days={ALL_DAYS}
            programs={names}
            disp={dispOf}
            onClose={() => setDevolverOpen(false)}
            onConfirm={vals => {
              setDevueltos(prev => {
                const next = { ...prev }
                Object.entries(vals).forEach(([dk, progs]) => {
                  const day = { ...(next[dk] || {}) }
                  Object.entries(progs).forEach(([name, n]) => { day[name] = (day[name] || 0) + n })
                  next[dk] = day
                })
                return next
              })
              setDevolverOpen(false)
              const total = Object.values(vals).reduce((t, pr) => t + Object.values(pr).reduce((a, b) => a + b, 0), 0)
              setAlert({ kind:'success', title:'Operación realizada con éxito', text:<>Se devolvieron {total} cupos. Ya no figuran como disponibles.</> })
            }}
          />
        )
      })()}
      {resolveT && <ResolveModal t={resolveT} onApply={resolvePending} onClose={() => setResolveT(null)} />}

      {/* Programs modal */}
      {progModal && (() => {
        const day = ALL_DAYS.find(d => d.key === progModal.dayKey)!
        return (
          <ProgramsModal
            dayLabel={day.label}
            baseNames={day.programs.map(x => x.name)}
            extraNames={extraProgs[day.key] || []}
            values={programInputs[day.key] || {}}
            isValid={progValid}
            hasContract={hasContractFor}
            onConfirm={(extras, values) => {
              setExtraProgs(prev => ({ ...prev, [day.key]: extras }))
              const clean: Record<string,string> = {}
              ALL_PROGRAMS.forEach(n => {
                const on = extras.includes(n) || day.programs.some(x => x.name === n)
                if (on && progValid(n) && (parseInt(values[n] || '0') || 0) > 0) clean[n] = values[n]
              })
              setProgramInputs(prev => ({ ...prev, [day.key]: clean }))
              if (Object.keys(clean).length > 0 && solicitarTipo === 'contrato') {
                setSolicitarTipo('nominar'); setPedidos({})
              }
              setProgModal(null)
            }}
            onClose={() => setProgModal(null)}
          />
        )
      })()}
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const S = { fill:"none", stroke:"white", strokeWidth:"1.3", strokeLinecap:"round" as const, strokeLinejoin:"round" as const }

function IcoHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" {...S}/>
      <path d="M9 22V15h6v7" {...S}/>
    </svg>
  )
}

function IcoChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="13" width="4" height="8" rx="0.5" {...S}/>
      <rect x="9.5" y="8" width="4" height="13" rx="0.5" {...S}/>
      <rect x="16.5" y="3" width="4" height="18" rx="0.5" {...S}/>
    </svg>
  )
}

function IcoTruck() {
  return (
    <svg width="22" height="20" viewBox="0 0 26 22" fill="none">
      {/* cargo box */}
      <rect x="1" y="2" width="12" height="11" rx="0.8" {...S}/>
      <line x1="5" y1="2" x2="5" y2="13" {...S}/>
      <line x1="8.5" y1="2" x2="8.5" y2="13" {...S}/>
      {/* cab */}
      <path d="M13 6h5.5l3.5 4.5v4H13V6z" {...S}/>
      <rect x="16.5" y="7.5" width="3" height="3" rx="0.3" fill="white"/>
      {/* base connect */}
      <path d="M1 13h22" {...S}/>
      {/* wheels */}
      <circle cx="5.5" cy="17" r="2.2" {...S}/>
      <circle cx="19" cy="17" r="2.2" {...S}/>
    </svg>
  )
}

function IcoFinanzas() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* coin circle top right */}
      <circle cx="17" cy="7" r="4.5" {...S}/>
      <path d="M17 4.5v.7M17 9.3v.7M15.3 6.4c0-.8.8-1.4 1.7-1.4s1.7.6 1.7 1.4-.8 1.4-1.7 1.4-1.7.6-1.7 1.4.8 1.4 1.7 1.4" {...S}/>
      {/* hand receiving */}
      <path d="M2 14.5h2.5a1 1 0 011 1v4a1 1 0 01-1 1H2V14.5z" {...S}/>
      <path d="M5.5 15.5h3l2.5 1.2h3c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H8.5" {...S}/>
      <path d="M5.5 19.5l5.5 1.8c1.2.4 2.5.2 3.5-.5l5-3.8" {...S}/>
    </svg>
  )
}

function IcoLeaf() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* outer refresh arrows */}
      <path d="M4 4v5h5" {...S}/>
      <path d="M4 9A8 8 0 0120 12" {...S}/>
      <path d="M20 20v-5h-5" {...S}/>
      <path d="M20 15A8 8 0 014 12" {...S}/>
      {/* drop/leaf in center */}
      <path d="M12 7.5c0 0-3 3-3 5.5a3 3 0 006 0c0-2.5-3-5.5-3-5.5z" {...S}/>
    </svg>
  )
}

function IcoPeople() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* main person */}
      <circle cx="10" cy="7" r="3.5" {...S}/>
      <path d="M2.5 20.5c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" {...S}/>
      {/* secondary person */}
      <path d="M17.5 8c1 .7 1.7 1.8 1.7 3.1 0 1.3-.7 2.5-1.7 3.1" {...S}/>
      <path d="M19.5 16c1.5.8 2.5 2.4 2.5 4.5" {...S}/>
    </svg>
  )
}

function IcoSupport() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 14v-3a9 9 0 0118 0v3" {...S}/>
      <path d="M21 16a2 2 0 01-2 2h-1a2 2 0 01-2-2v-2.5a2 2 0 012-2h3V16z" {...S}/>
      <path d="M3 16a2 2 0 002 2h1a2 2 0 002-2v-2.5a2 2 0 00-2-2H3V16z" {...S}/>
      <path d="M19 18c0 2-1.5 3-3.5 3H12" {...S}/>
    </svg>
  )
}
