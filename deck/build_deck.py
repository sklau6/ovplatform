from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_TICK_MARK
from pptx.oxml.ns import qn
from pathlib import Path

ROOT = Path(__file__).resolve().parent
A = ROOT / 'assets'
OUT = ROOT.parent / 'Ophylla_Ventures_OS_Platform_Overview.pptx'

BG = RGBColor(0x05, 0x09, 0x0D)
PANEL = RGBColor(0x09, 0x12, 0x17)
PANEL2 = RGBColor(0x0C, 0x17, 0x1D)
LINE = RGBColor(0x1B, 0x2C, 0x33)
WHITE = RGBColor(0xEA, 0xF2, 0xF0)
MUTED = RGBColor(0x8A, 0xA6, 0xA0)
DIM = RGBColor(0x5F, 0x78, 0x75)
ACCENT = RGBColor(0x53, 0xF0, 0xBE)
CYAN = RGBColor(0x76, 0xC9, 0xC9)
AMBER = RGBColor(0xF4, 0xBD, 0x72)
ROSE = RGBColor(0xFF, 0x70, 0x88)
VIOLET = RGBColor(0xA9, 0x91, 0xFF)
FONT = 'Helvetica Neue'
MONO = 'SF Mono'

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
SW, SH = prs.slide_width, prs.slide_height

def bg(slide):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = BG
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SW, Inches(0.035))
    bar.fill.solid(); bar.fill.fore_color.rgb = ACCENT; bar.line.fill.background()

def footer(slide, n, section='OPHYLLA VENTURES OS'):
    t = slide.shapes.add_textbox(Inches(0.55), Inches(7.16), Inches(9.8), Inches(0.2))
    p = t.text_frame.paragraphs[0]
    r = p.add_run(); r.text = f'{section}   ·   PLATFORM OVERVIEW   ·   OCTOBER 2026'
    r.font.name = MONO; r.font.size = Pt(7.5); r.font.color.rgb = DIM
    p2 = slide.shapes.add_textbox(Inches(11.95), Inches(7.12), Inches(0.85), Inches(0.25))
    pp = p2.text_frame.paragraphs[0]; pp.alignment = PP_ALIGN.RIGHT
    rr = pp.add_run(); rr.text = f'{n:02d}'
    rr.font.name = MONO; rr.font.size = Pt(9); rr.font.color.rgb = MUTED

def panel(slide, x, y, w, h, fill=PANEL, line=LINE, radius=0.06):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    s.fill.solid(); s.fill.fore_color.rgb = fill
    s.line.color.rgb = line; s.line.width = Pt(0.75)
    s.adjustments[0] = radius
    return s

def tb(slide, x, y, w, h, text, size=14, color=WHITE, bold=False, font=FONT, align=PP_ALIGN.LEFT, spacing=1.0, italic=False):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]; p.alignment = align
    p.line_spacing = spacing
    r = p.add_run(); r.text = text
    r.font.name = font; r.font.size = Pt(size); r.font.bold = bold; r.font.italic = italic
    r.font.color.rgb = color
    return box

def lines(slide, x, y, w, h, items, size=11.5, color=MUTED, gap=7, bullet_color=ACCENT, font=FONT):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap); p.line_spacing = 1.15
        b = p.add_run(); b.text = '●  '; b.font.name = FONT; b.font.size = Pt(5.5); b.font.color.rgb = bullet_color
        r = p.add_run(); r.text = item; r.font.name = font; r.font.size = Pt(size); r.font.color.rgb = color
    return box

def kicker(slide, text, color=ACCENT, y=0.55):
    tb(slide, 0.55, y, 11.6, 0.25, text.upper(), 8.5, color, True, MONO, spacing=1.1)

def title(slide, text, size=28, y=0.83, color=WHITE):
    tb(slide, 0.55, y, 12.1, 0.65, text, size, color, True, FONT, spacing=1.0)

def subtitle(slide, text, y=1.48, color=MUTED, size=12.2, w=11.9, x=0.55):
    tb(slide, x, y, w, 0.55, text, size, color, False, FONT, spacing=1.25)

def pic(slide, name, x, y, w, h, border=True):
    p = slide.shapes.add_picture(str(A / f'{name}.jpg'), Inches(x), Inches(y), Inches(w), Inches(h))
    if border:
        p.line.color.rgb = LINE; p.line.width = Pt(1)
    return p

def chip(slide, x, y, w, text, color=ACCENT, size=7.2):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(0.28))
    s.fill.solid(); s.fill.fore_color.rgb = RGBColor(0x0A, 0x1A, 0x17)
    s.line.color.rgb = RGBColor(0x1E, 0x4A, 0x40); s.line.width = Pt(0.5)
    s.adjustments[0] = 0.25
    tf = s.text_frame; tf.margin_left = tf.margin_right = 0; tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = text; r.font.name = MONO; r.font.size = Pt(size); r.font.color.rgb = color; r.font.bold = True

def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text

def stat(slide, x, y, w, label, value, note, color=ACCENT):
    panel(slide, x, y, w, 1.32)
    tb(slide, x+0.18, y+0.16, w-0.36, 0.2, label.upper(), 7.2, DIM, True, MONO)
    tb(slide, x+0.18, y+0.4, w-0.36, 0.5, value, 26, WHITE, True)
    tb(slide, x+0.18, y+1.0, w-0.36, 0.2, note, 7.6, color, False, MONO)

def section_label(slide, n, text):
    tb(slide, 0.55, 0.55, 2.0, 0.25, f'{n:02d}  /  {text}'.upper(), 8.5, ACCENT, True, MONO)

# ---------------------------------------------------------------- 01 title
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
# faint vertical accent
v = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.55), Inches(0.8), Inches(0.05), Inches(4.7)); v.fill.solid(); v.fill.fore_color.rgb = ACCENT; v.line.fill.background()
tb(s, 0.9, 0.8, 6.0, 0.3, 'OPHYLLA VENTURES OS', 10, ACCENT, True, MONO)
tb(s, 0.9, 1.22, 6.1, 2.6, 'The operating system for the built environment.', 32, WHITE, True, FONT, spacing=1.02)
subtitle(s, 'A single command surface for the COO: digital twins, professional BIM, construction delivery, smart-city operations, energy, PropTech and a governed AI agent council.', 1.85+1.25, MUTED, 12.5, 5.7, 0.9)
pic(s, 'home', 6.85, 1.15, 6.0, 3.75)
# stats band
for i, (lab, val, note) in enumerate([('ROUTES','58','one platform'),('3D SCENES','55','real-time'),('LANGUAGES','8','localised'),('CHECKS','116','production')]):
    x = 0.9 + i*2.98
    panel(s, x, 5.45, 2.72, 1.15, PANEL, LINE)
    tb(s, x+0.16, 5.56, 2.4, 0.2, lab, 7, DIM, True, MONO)
    tb(s, x+0.16, 5.74, 2.4, 0.36, val, 20, WHITE, True)
    tb(s, x+0.16, 6.16, 2.4, 0.2, note, 7, ACCENT, False, MONO)
tb(s, 0.9, 6.75, 7.0, 0.25, 'DEMO ENVIRONMENT  ·  ILLUSTRATIVE DATA  ·  HONG KONG', 7.2, DIM, False, MONO)
footer(s, 1, 'OPHYLLA VENTURES OS')
notes(s, 'Open with the thesis: Ophylla is not a dashboard or a model viewer. It is a single operating surface that connects the physical asset, the project model, the operating data and the decisions of the COO. The numbers on this page are the current build: 58 routes, 55 Three.js scenes, eight languages and 116 production checks. Everything is illustrative demo data, not client data.')

# ---------------------------------------------------------------- 02 executive
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 2, 'Executive view')
title(s, 'One operating picture, from model to margin.', 27)
subtitle(s, 'Most built-environment organisations run projects, assets and corporate performance in separate systems. Ophylla joins them on one navigable surface, with the 3D model as the common spatial index.', 1.5, MUTED, 11.5, 12.1)
pic(s, 'twin', 0.55, 2.55, 8.05, 4.35)
# right insight column
panel(s, 8.95, 2.55, 3.83, 4.35, PANEL, LINE)
tb(s, 9.18, 2.72, 3.4, 0.22, 'WHAT THE PLATFORM CONNECTS', 7.2, ACCENT, True, MONO)
items = [
 ('SPATIAL TRUTH','Digital twin, GIS, BIM and site reality in one coordinate system.'),
 ('DELIVERY TRUTH','4D programme, clashes, quantities, RFIs, commissioning and handover.'),
 ('OPERATING TRUTH','Energy, mobility, safety, maintenance and tenant experience.'),
 ('COMMERCIAL TRUTH','Portfolio value, P&L, capital allocation and risk.'),
 ('DECISION TRUTH','Agent council with evidence, confidence and human gates.'),
]
y = 3.05
for lab, txt in items:
    tb(s, 9.18, y, 3.35, 0.2, lab, 7, ACCENT, True, MONO)
    tb(s, 9.18, y+0.18, 3.35, 0.46, txt, 8.4, MUTED, False, FONT, spacing=1.1)
    y += 0.72
footer(s, 2)
notes(s, 'Use this as the executive frame. The platform is organised around five kinds of truth. The value is not any single module; it is that a question such as “why is Tower A late?” can be answered with model, programme, cost, site and market evidence on one screen.')

# ---------------------------------------------------------------- 03 problem
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 3, 'Why now')
title(s, 'The built environment is rich in data and poor in decisions.', 27)
subtitle(s, 'The average asset generates thousands of signals a day, yet the COO still reconciles them by hand. Four gaps recur in every portfolio.', 1.5, MUTED, 11.8)
cards = [
 ('01','FRAGMENTED MODELS','Architecture, structure, MEP, facade and site models live in different authoring tools and versions.','BIM · IFC · CDE', CYAN),
 ('02','DISCONNECTED DELIVERY','Programme, cost, safety and quality are tracked in separate systems with no shared spatial key.','4D · 5D · field', AMBER),
 ('03','OPERATIONS BLIND SPOTS','Energy, access, occupancy, maintenance and tenant experience are reported after the fact.','IoT · BMS · CAFM', VIOLET),
 ('04','AI WITHOUT GOVERNANCE','Agents produce plausible answers without evidence, audit trails or a human decision gate.','agents · ledger', ROSE),
]
for i,(n,h,b,tag,col) in enumerate(cards):
    x = 0.55 + (i%2)*6.2; y = 2.45 + (i//2)*2.12
    panel(s, x, y, 5.95, 1.9, PANEL, LINE)
    tb(s, x+0.22, y+0.18, 0.5, 0.3, n, 11, col, True, MONO)
    tb(s, x+0.78, y+0.2, 4.8, 0.25, h, 9.5, WHITE, True, MONO)
    tb(s, x+0.22, y+0.62, 5.45, 0.8, b, 9.3, MUTED, False, FONT, spacing=1.15)
    tb(s, x+0.22, y+1.52, 4.8, 0.2, tag.upper(), 6.8, col, True, MONO)
footer(s, 3)
notes(s, 'This is the pain thesis. The problem is not a lack of software; it is the absence of a shared operating model. Each gap maps directly to a module in the platform: BIM Studio and BIM on Site, Construction Twin, operations twins, and Agent Operations with the Trust Ledger.')

# ---------------------------------------------------------------- 04 architecture
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 4, 'Architecture')
title(s, 'A four-layer platform with one spatial index.', 27)
subtitle(s, 'The experience, the 3D engine, the domain modules and the governed data layer are deliberately separated so a new asset or workflow can be added without rebuilding the shell.', 1.5, MUTED, 11.8)
layers = [
 ('EXPERIENCE LAYER','React 19 · TypeScript · Vite 8 · Tailwind CSS v4','Command palette, 58 routes, dark/light theme, 8 languages, responsive layout', CYAN, 2.4),
 ('3D ENGINE','Three.js r186 · 55 scene graphs · shared ThreeStage','ACES tone mapping, IBL, PCF soft shadows, PBR materials, adaptive quality, GLTF vehicles', ACCENT, 3.35),
 ('DOMAIN MODULES','Twin · BIM · Construction · Engineering · Mobility · Energy · PropTech · Capital','Each module is a route + data model + 3D scene + operating panel', VIOLET, 4.30),
 ('GOVERNED DATA','Event bus · Trust Ledger · agent council · human gates','Provenance, attestation, audit trail and illustrative live telemetry', AMBER, 5.25),
]
for i,(h, mid, bottom, col, y) in enumerate(layers):
    panel(s, 0.55, y, 8.1, 0.78, PANEL2, LINE)
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.55), Inches(y), Inches(0.07), Inches(0.78)); bar.fill.solid(); bar.fill.fore_color.rgb = col; bar.line.fill.background()
    tb(s, 0.8, y+0.12, 2.1, 0.2, h, 7.6, col, True, MONO)
    tb(s, 2.9, y+0.1, 5.5, 0.25, mid, 9.2, WHITE, True, FONT)
    tb(s, 2.9, y+0.4, 5.5, 0.3, bottom, 7.8, MUTED, False, FONT)
# right stack
panel(s, 8.95, 2.4, 3.83, 3.63, PANEL, LINE)
tb(s, 9.18, 2.58, 3.4, 0.22, 'DELIVERY MODEL', 7.2, ACCENT, True, MONO)
for i,(k,v) in enumerate([('58','routes'),('55','3D scenes'),('116','production checks'),('8','languages'),('1','shared shell')]):
    yy = 2.95 + i*0.55
    tb(s, 9.18, yy, 0.8, 0.3, k, 15, WHITE, True)
    tb(s, 10.0, yy+0.06, 2.5, 0.2, v, 8.5, MUTED, False, MONO)
footer(s, 4)
notes(s, 'Explain the architecture in plain terms. The shell and design system are shared. Every domain module follows the same contract: a route, a data model, a 3D scene and an operating panel. ThreeStage centralises rendering quality so all 55 scenes benefit from the same lighting, shadows and materials. The data layer is intentionally simulated, with provenance and a ledger to show how a real deployment would be governed.')

# ---------------------------------------------------------------- 05 map
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 5, 'Module map')
title(s, 'Fifty-eight routes, grouped around the COO’s day.', 27)
subtitle(s, 'The navigation is organised by decision domain rather than by software vendor. The 3D scene is the spatial index; the panels are the working detail.', 1.5, MUTED, 11.8)
groups = [
 ('COMMAND', 'Twin · Geospatial · Mobility · Traffic · EV · Resilience · Public realm · Heritage', '10', CYAN),
 ('BUILD & OPERATE', 'Construction · Fleet · Commissioning · Quality · Utilities · Safety · Fire · Supply · Procurement · BIM trio', '25', ACCENT),
 ('INTELLIGENCE', 'Data & AI governance · Trust ledger · Cyber · Agents · War room · Intelligence', '7', VIOLET),
 ('ASSETS & CAPITAL', 'Portfolio · Assets · Capital · Deals · Insurance · Contracts · Labs', '8', AMBER),
 ('EXPERIENCE', 'PropTech · Workplace · ESG · Energy · DC ops · Plant · Factory · Water', '8', ROSE),
]
for i,(h, items, n, col) in enumerate(groups):
    x = 0.55 + (i%3)*4.16; y = 2.38 + (i//3)*1.95
    panel(s, x, y, 3.98, 1.72, PANEL, LINE)
    tb(s, x+0.2, y+0.18, 2.6, 0.2, h, 8.4, col, True, MONO)
    tb(s, x+3.45, y+0.15, 0.35, 0.25, n, 14, WHITE, True)
    tb(s, x+0.2, y+0.55, 3.55, 0.95, items, 8.4, MUTED, False, FONT, spacing=1.14)
    tb(s, x+0.2, y+1.42, 3.4, 0.2, 'DOMAIN MODULES', 6.4, DIM, True, MONO)
panel(s, 0.55, 6.4, 12.2, 0.45, PANEL, LINE)
tb(s, 0.75, 6.52, 11.8, 0.2, '58 ROUTES   ·   55 3D SCENES   ·   ONE SHARED SHELL   ·   ONE NAVIGATION', 7.0, ACCENT, True, MONO)
footer(s, 5)
notes(s, 'Do not read every route. Explain the grouping: Command is the daily operating picture, Build & Operate is delivery and assets, Intelligence is evidence and governance, Assets & Capital is the commercial view, Experience is the tenant and building experience. The exact route count is 58; the deck uses rounded group counts to keep the story legible.')

# ---------------------------------------------------------------- 06 twin
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 6, 'Digital twin')
title(s, 'A living model of the precinct.', 28)
subtitle(s, 'The twin is the front door to the portfolio: 19 assets, 4.82M ft² under management and 1,284 live sensor streams in one navigable model.', 1.5, MUTED, 7.3)
pic(s, 'twin', 0.55, 2.55, 8.0, 4.3)
lines(s, 8.85, 2.6, 3.9, 3.4, [
 'Building-level energy, occupancy, availability and sensor health.',
 'District context: Kai Tak, Kowloon East, Central Harbour and TKO.',
 'Night, orbit and level views; resilience scenarios for typhoon and heat.',
 'Asset passport, provenance, open work orders and model variance.',
 'Click any asset to move from spatial context to operating detail.',
], 8.7, MUTED, 8)
chip(s, 8.85, 6.05, 1.65, 'WEBGL2 · LIVE', ACCENT)
chip(s, 10.65, 6.05, 2.0, 'IFC 4.3 · LOD 350', CYAN)
footer(s, 6)
notes(s, 'The Digital Twin is the anchor. It combines BIM geometry, GIS context, sensor telemetry and asset data. Emphasise that the model is the index, not the deliverable: the value is the ability to move from a building to its performance, work orders, provenance and risk in two clicks.')

# ---------------------------------------------------------------- 07 BIM studio
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 7, 'BIM studio')
title(s, 'Model once. Build right.', 28)
subtitle(s, 'Federated architecture, structure, MEP and fire models, coordinated before work starts, with 4D sequencing, clash resolution and COBie handover.', 1.5, MUTED, 7.3)
pic(s, 'bim', 0.55, 2.55, 8.0, 4.3)
lines(s, 8.85, 2.6, 3.9, 3.55, [
 'IFC 4.3 federation with LOD 200 / 350 / 500 switching.',
 'Discipline filters for architecture, structure, MEP, fire and site.',
 'Clash register with distance, owner, severity and recommendation.',
 '4D sequence from mobilise to handover; COBie asset data.',
 'Element inspection: object data, system, level and responsibility.',
], 8.7, MUTED, 7)
chip(s, 8.85, 6.25, 1.45, 'ISO 19650', ACCENT)
chip(s, 10.45, 6.25, 2.2, 'BCF · COBie', CYAN)
footer(s, 7)
notes(s, 'BIM Studio is the design-coordination view. It is a working federated model, not a pretty render: clash markers, LOD switching, discipline filters and 4D stages all change the model. The COBie panel shows how design data becomes an operating asset.')

# ---------------------------------------------------------------- 08 BIM site
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 8, 'BIM on site')
title(s, 'From model to site.', 28)
subtitle(s, 'A professional BIM demo on a live Kai Tak construction site: Tower A, 34 storeys, 62% complete, two tower cranes and a controlled CDE.', 1.5, MUTED, 7.3)
pic(s, 'site', 0.55, 2.55, 8.0, 4.3)
lines(s, 8.85, 2.6, 3.9, 3.55, [
 'Real construction condition: podium, frame, partial facade and scaffolding.',
 'Site logistics: cranes, offices, hoarding, rebar, excavator and deliveries.',
 'Day / dusk and Site / BIM / As-built views.',
 '4D scrub from mobilisation to handover; live clash markers.',
 'Model register, quantities, RFIs, workforce and permits.',
], 8.7, MUTED, 7)
chip(s, 8.85, 6.25, 1.8, 'TOWER A · L21', AMBER)
chip(s, 10.75, 6.25, 1.9, '62% COMPLETE', ACCENT)
footer(s, 8)
notes(s, 'This is the newest module and the one closest to a real site. It deliberately shows the unfinished condition: exposed frame, partial facade, scaffolding, cranes and laydown. The day/dusk toggle makes the same site legible for a morning walk and an evening review. All project data is illustrative; the site context and workflow are modelled on Hong Kong practice.')

# ---------------------------------------------------------------- 09 BIM workflows
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 9, 'BIM toolchain')
title(s, 'Ten tools. One model. One truth.', 28)
subtitle(s, 'The complete BIM workflow from authoring to operations, with Proptech.AI access and occupancy data feeding the digital twin.', 1.5, MUTED, 7.1)
pic(s, 'workflows', 0.55, 2.5, 7.55, 4.35)
# tool list right
panel(s, 8.3, 2.5, 4.48, 4.35, PANEL, LINE)
tb(s, 8.52, 2.65, 4.0, 0.2, 'AUTHORING → COORDINATION → OPERATE', 6.8, ACCENT, True, MONO)
tools = [
 ('Autodesk Revit','Authoring · RVT / IFC'),('ArchiCAD','Authoring · PLN / IFC'),
 ('SketchUp','Massing · SKP'),('Rhino + Grasshopper','Computational · 3DM'),
 ('Vectorworks / AutoCAD','Documentation · VWX / DWG'),('Plannerly','BIM management · BCF'),
 ('Trimble Connect','CDE · version control'),('Revizto / BIMcollab','Review · issues · BCF 3.0'),
]
y = 2.98
for name, role in tools:
    tb(s, 8.52, y, 2.45, 0.2, name, 7.8, WHITE, True)
    tb(s, 10.95, y, 1.65, 0.2, role, 6.2, DIM, False, MONO)
    y += 0.4
tb(s, 8.52, 6.3, 4.0, 0.35, 'Proptech.AI · access, visitors, occupancy, people counting', 7.2, ACCENT, False, MONO)
footer(s, 9)
notes(s, 'This slide addresses the two references directly. The left image is the 3D model graph with all ten tools; the right list maps each tool to its workflow role. The Proptech.AI strip at the bottom is the operations handover: facial recognition, visitor management, occupancy analytics and integration with existing access systems.')

# ---------------------------------------------------------------- 10 construction
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 10, 'Construction')
title(s, 'Every movement, choreographed.', 28)
subtitle(s, 'Construction technology from 4D sequence and reality capture to safety geofences, site logistics and earned value.', 1.5, MUTED, 7.3)
pic(s, 'construction', 0.55, 2.55, 8.0, 4.3)
lines(s, 8.85, 2.6, 3.9, 3.5, [
 '4D sequence: mobilise, piling, substructure, superstructure, fit-out.',
 'Reality capture and BIM-to-field deviation checks.',
 'Safety geofences, lifting zones, permits and workforce access.',
 'Site logistics, deliveries, laydown and crane planning.',
 '5D earned value, productivity and recovery scenarios.',
], 8.7, MUTED, 7)
chip(s, 8.85, 6.25, 1.55, '4D · 5D', ACCENT)
chip(s, 10.55, 6.25, 2.0, 'FIELD · SAFETY', AMBER)
footer(s, 10)
notes(s, 'Construction Twin is the delivery control room. The emphasis is on choreography: the sequence, the site logistics and the safety envelope. Point out that the same model that supports design coordination also supports the daily site walk and the monthly earned-value review.')

# ---------------------------------------------------------------- 11 engineering
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 11, 'Engineering')
title(s, 'The structure is part of the operating picture.', 27)
subtitle(s, 'Structural, geotechnical, facade, seismic and acoustic engineering views share the same asset and the same evidence model.', 1.5, MUTED, 11.8)
pic(s, 'engineering', 0.55, 2.45, 6.0, 3.85)
pic(s, 'facade', 6.7, 2.45, 6.05, 3.85)
# captions
for x, lab, text in [(0.55,'STRUCTURAL / CIVIL','Load cases, utilisation, deflection, pile settlement and bridge monitoring.'),(6.7,'FACADE LAB','Thermal, structural, water and installation performance of the unitised envelope.')]:
    panel(s, x, 6.4, 6.05, 0.55, PANEL, LINE)
    tb(s, x+0.15, 6.47, 1.7, 0.2, lab, 6.7, ACCENT, True, MONO)
    tb(s, x+1.85, 6.47, 4.05, 0.2, text, 7.0, MUTED, False, FONT)
footer(s, 11)
notes(s, 'Engineering is where the platform proves it is not only a portfolio dashboard. Structural utilisation, geotechnical settlement, facade performance and seismic resilience are all first-class views, tied to the same asset and the same evidence ledger.')

# ---------------------------------------------------------------- 12 mobility
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 12, 'Smart city')
title(s, 'Move the city, not just the traffic.', 28)
subtitle(s, 'Adaptive junctions, autonomous shuttle loops, transit, curbside management and carbon-aware mode shift in one mobility twin.', 1.5, MUTED, 11.8)
pic(s, 'traffic', 0.55, 2.4, 6.05, 3.8)
pic(s, 'mobility', 6.7, 2.4, 6.05, 3.8)
panel(s, 0.55, 6.3, 12.2, 0.62, PANEL, LINE)
caps = [('ADAPTIVE SIGNALS','42 s delay · 180 m queue'),('AV LOOP','12 stops · remote supervisor'),('MODE SHARE','36% rail · 18% AV'),('CARBON','42 g CO₂e per trip')]
for i,(h,v) in enumerate(caps):
    x = 0.72 + i*3.02
    tb(s, x, 6.4, 1.3, 0.18, h, 6.4, ACCENT, True, MONO)
    tb(s, x, 6.58, 2.8, 0.2, v, 7.2, MUTED, False, FONT)
footer(s, 12)
notes(s, 'Mobility demonstrates the smart-city range. The traffic junction and the mobility twin are separate scenes but share the same operating language: a live condition, a scenario and a set of interventions. The mode-share and carbon strip links mobility to the ESG story.')

# ---------------------------------------------------------------- 13 cars
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 13, 'Photoreal vehicles')
title(s, 'Cars that look like cars, not boxes.', 28)
subtitle(s, 'The showroom and EV hub use a production-style glTF vehicle: 97 meshes, 14 textures, clear-coat paint, glass, interiors, brakes and lights.', 1.5, MUTED, 7.3)
pic(s, 'vehicles', 0.55, 2.55, 8.0, 4.3)
lines(s, 8.85, 2.6, 3.9, 3.55, [
 'Photoreal CarConcept model in the showroom and EV hub.',
 'Five camera views: exterior, profile, rear, interior, wheels.',
 'Six paint finishes and three wheel finishes, editable live.',
 'Merged by material and cloned for traffic and mobility.',
 '11 MB asset loaded once; shared geometry and textures.',
], 8.6, MUTED, 7)
chip(s, 8.85, 6.25, 1.55, '97 MESHES', ACCENT)
chip(s, 10.55, 6.25, 2.0, 'CC BY 4.0', CYAN)
footer(s, 13)
notes(s, 'This is the answer to the repeated “especially cars” request. The showroom uses a real automotive glTF asset, not a procedural approximation. For scale, explain the engineering trade-off: the model is merged by material and cloned, so traffic and mobility can show dozens of cars without loading 11 MB per vehicle. The asset is CC BY 4.0 and credited in the repository.')

# ---------------------------------------------------------------- 14 energy
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 14, 'Energy & grid')
title(s, 'Charge the fleet. Protect the grid.', 28)
subtitle(s, 'Microgrid operations, solar, BESS, EV charging, demand response and island mode, framed against Hong Kong grid and cybersecurity standards.', 1.5, MUTED, 7.3)
pic(s, 'energy', 0.55, 2.55, 8.0, 4.3)
lines(s, 8.85, 2.6, 3.9, 3.5, [
 'CLP 11 kV connection, transformers and LV switchgear.',
 'Solar canopy, BESS, generators and data-centre load.',
 'Normal, peak-shave, island and carbon-sprint scenarios.',
 'Power quality, IEC 61850, IEC 62443 and HK grid compliance.',
 'EV hub load management and outage islanding.',
], 8.6, MUTED, 7)
chip(s, 8.85, 6.25, 1.8, 'MICROGRID', ACCENT)
chip(s, 10.8, 6.25, 1.85, 'IEC 61850', CYAN)
footer(s, 14)
notes(s, 'Energy is the clearest example of a live operating twin. The scenarios are not cosmetic: flows reroute, the grid trips, the BESS carries the island and generators synchronise. This is where the COO sees resilience and cost in the same view.')

# ---------------------------------------------------------------- 15 proptech
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 15, 'PropTech & workplace')
title(s, 'The building as a service, not a lease.', 28)
subtitle(s, 'Leasing cutaways, floor-level rent roll, occupancy, tenant experience, certifications and green-lease clauses.', 1.5, MUTED, 7.3)
pic(s, 'proptech', 0.55, 2.55, 8.0, 4.3)
lines(s, 8.85, 2.6, 3.9, 3.45, [
 'Floor-by-floor rent roll, vacancy and lease expiry.',
 'Space utilisation and tenant experience scores.',
 'Certifications: BEAM Plus, WELL, LEED and green leases.',
 'Workplace experience: booking, comfort and amenities.',
 'PropTech signals feed asset strategy and capital planning.',
], 8.6, MUTED, 7)
chip(s, 8.85, 6.25, 1.65, 'BEAM PLUS', ACCENT)
chip(s, 10.6, 6.25, 2.0, 'GREEN LEASE', CYAN)
footer(s, 15)
notes(s, 'PropTech is the commercial and tenant-facing layer. The point is that leasing, occupancy and experience are not separate from the building model; they are another view of the same asset. This is where the platform connects to the COO’s revenue and retention metrics.')

# ---------------------------------------------------------------- 16 COO & agents
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 16, 'COO command')
title(s, 'A council of agents, with human gates.', 28)
subtitle(s, 'Commercial, delivery, technology, finance, people and risk agents work from shared evidence; consequential steps stop for a human decision.', 1.5, MUTED, 7.3)
pic(s, 'agents', 0.55, 2.55, 8.0, 4.3)
lines(s, 8.85, 2.6, 3.9, 3.5, [
 'Each agent has a mandate, tools, confidence and autonomy level.',
 'Evidence is cited; actions are logged in the Trust Ledger.',
 'Human gates for spend, contracts, safety and external release.',
 'Board pack and executive brief generated from the same run.',
 'War room for cross-functional incidents and recovery.',
], 8.6, MUTED, 7)
chip(s, 8.85, 6.25, 1.85, '6 AGENTS', ACCENT)
chip(s, 10.8, 6.25, 1.8, 'HUMAN GATES', AMBER)
footer(s, 16)
notes(s, 'The agent council is the most distinctive part of the COO story, but it is deliberately governed. Agents are not autonomous black boxes: they have mandates, tools, confidence and gates. The Trust Ledger makes the reasoning auditable. This is the demo pattern for a real deployment.')

# ---------------------------------------------------------------- 17 data trust
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 17, 'Data, AI & trust')
title(s, 'Evidence before automation.', 28)
subtitle(s, 'A data and AI governance layer with source lineage, model cards, access control, cyber posture and an attestation ledger.', 1.5, MUTED, 7.3)
pic(s, 'data', 0.55, 2.55, 6.0, 4.1)
pic(s, 'trust', 6.7, 2.55, 6.05, 4.1)
panel(s, 0.55, 6.55, 12.2, 0.4, PANEL, LINE)
tb(s, 0.7, 6.63, 12.0, 0.2, 'LINEAGE  ·  MODEL CARDS  ·  RBAC  ·  IEC 62443  ·  ATTESTATION  ·  AUDIT TRAIL', 7.2, ACCENT, True, MONO)
footer(s, 17)
notes(s, 'This slide is the counterweight to the AI story. The platform shows where data comes from, which model produced an answer, who can see it and how the decision was attested. The Trust Ledger is the audit spine; the Data module is the governance surface.')

# ---------------------------------------------------------------- 18 experience
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 18, 'Experience system')
title(s, 'English, 繁體中文, 简体中文 and five more.', 27)
subtitle(s, 'A typed, dependency-free i18n layer, persistent dark/light theme and a navigation that collapses to a 72 px icon rail by default.', 1.5, MUTED, 7.3)
pic(s, 'nav', 0.55, 2.55, 7.0, 4.15)
# language and theme panel
panel(s, 7.85, 2.55, 4.93, 4.15, PANEL, LINE)
tb(s, 8.08, 2.72, 4.4, 0.2, 'LANGUAGES', 7.2, ACCENT, True, MONO)
langs = [('EN','English'),('繁','Traditional Chinese'),('简','Simplified Chinese'),('ES','Español'),('FR','Français'),('JA','日本語'),('DE','Deutsch'),('KO','한국어')]
for i,(code,name) in enumerate(langs):
    x = 8.08 + (i%2)*2.3; y = 3.02 + (i//2)*0.45
    tb(s, x, y, 0.35, 0.2, code, 7.5, ACCENT, True, MONO)
    tb(s, x+0.38, y, 1.85, 0.2, name, 7.5, MUTED, False, FONT)
tb(s, 8.08, 4.98, 4.4, 0.2, 'THEME', 7.2, ACCENT, True, MONO)
tb(s, 8.08, 5.2, 4.4, 0.55, 'Dark is the default. Light theme restyles the shell and panels while keeping 3D viewports dark for engineering contrast.', 7.8, MUTED, False, FONT, spacing=1.15)
tb(s, 8.08, 5.95, 4.4, 0.2, 'NAVIGATION', 7.2, ACCENT, True, MONO)
tb(s, 8.08, 6.17, 4.4, 0.35, 'Collapsed by default to an icon rail. The hamburger expands a 252 px panel; desktop content shifts, mobile uses a backdrop or X.', 7.8, MUTED, False, FONT, spacing=1.15)
footer(s, 18)
notes(s, 'This slide covers the experience requirements that are easy to underestimate. Eight languages are typed dictionaries, not machine translation. Dark is the default; light mode is a deliberate restyle. The navigation now starts collapsed and opens from the hamburger, which gives the 3D canvas the full width on first load.')

# ---------------------------------------------------------------- 19 technical
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 19, 'Technical delivery')
title(s, 'Built for the browser, not a workstation.', 28)
subtitle(s, 'React 19, TypeScript and Vite on the front; vanilla Three.js with a shared rendering stage; zero-dependency production server.', 1.5, MUTED, 11.8)
panel(s, 0.55, 2.35, 6.0, 4.35, PANEL, LINE)
tb(s, 0.8, 2.52, 5.4, 0.2, 'STACK', 7.2, ACCENT, True, MONO)
stack = [
 ('React 19 + TypeScript','UI, routing, state and typed domain data'),
 ('Vite 8','fast dev server and production build'),
 ('Three.js r186','55 scene graphs through one ThreeStage'),
 ('Tailwind CSS v4','design tokens and dark/light themes'),
 ('Playwright Core','screenshots, mobile checks, production smoke'),
 ('Zero-dependency serve.mjs','single-command production server'),
]
y = 2.88
for a,b in stack:
    tb(s, 0.8, y, 2.25, 0.2, a, 8.0, WHITE, True)
    tb(s, 3.05, y, 3.2, 0.2, b, 7.2, MUTED, False, FONT)
    y += 0.52
# chart
cd = CategoryChartData()
cd.categories = ['Command','Build & operate','Intelligence','Assets & capital','Experience']
cd.add_series('Routes', (10, 25, 7, 8, 8))
chart = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, Inches(6.85), Inches(2.35), Inches(5.9), Inches(4.35), cd).chart
chart.has_legend = False
chart.has_title = True
chart.chart_title.text_frame.text = 'Route coverage by domain'
for p in chart.chart_title.text_frame.paragraphs:
    p.font.size = Pt(9); p.font.color.rgb = WHITE; p.font.name = FONT
chart.font.size = Pt(7); chart.font.color.rgb = MUTED; chart.font.name = FONT
chart.value_axis.has_major_gridlines = True
chart.value_axis.major_gridlines.format.line.color.rgb = LINE
chart.value_axis.format.line.color.rgb = LINE
chart.category_axis.format.line.color.rgb = LINE
chart.plots[0].gap_width = 60
for p in chart.plots[0].series[0].points:
    p.format.fill.solid(); p.format.fill.fore_color.rgb = ACCENT
chart.value_axis.tick_labels.font.size = Pt(7)
chart.category_axis.tick_labels.font.size = Pt(7)
footer(s, 19)
notes(s, 'The technical slide should reassure a CTO and a COO at the same time. The stack is modern but conservative. The important engineering choice is the shared ThreeStage: one place for lighting, shadows, PBR, tone mapping and adaptive quality, so 55 scenes behave consistently. The chart is route coverage by domain, not revenue.')

# ---------------------------------------------------------------- 20 validation
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 20, 'Quality')
title(s, 'What “done” means in this build.', 28)
subtitle(s, 'Every route is exercised in production, in both themes, with overflow checks and console-error capture. Mobile is checked separately.', 1.5, MUTED, 11.8)
# table
rows, cols = 7, 3
left, top, width, height = Inches(0.55), Inches(2.3), Inches(7.2), Inches(3.3)
tbl = s.shapes.add_table(rows, cols, left, top, width, height).table
for rr in range(rows):
    tbl.rows[rr].height = Inches(0.47 if rr else 0.42)
tbl.columns[0].width = Inches(2.6); tbl.columns[1].width = Inches(3.2); tbl.columns[2].width = Inches(1.4)
data = [('CHECK','SCOPE','RESULT'),('TypeScript','tsc -b, strict project references','PASS'),('Production','58 routes × 2 themes = 116','PASS'),('Themes','Dark default · light contrast pass','PASS'),('3D scenes','55 scenes · console clean','PASS'),('Mobile','390 px layout and overflow','PASS'),('Build','Vite production bundle','PASS')]
for r in range(rows):
    for c in range(cols):
        cell = tbl.cell(r,c); cell.fill.solid(); cell.fill.fore_color.rgb = PANEL if r else PANEL2
        cell.margin_left = Inches(0.12); cell.margin_right = Inches(0.08); cell.margin_top = Inches(0.05); cell.margin_bottom = Inches(0.05)
        p = cell.text_frame.paragraphs[0]
        run = p.add_run(); run.text = data[r][c]
        run.font.name = MONO; run.font.size = Pt(8 if r else 7); run.font.bold = (r==0 or c==2); run.font.color.rgb = ACCENT if (c==2 and r>0) else (DIM if r==0 else WHITE)
# right quality cards
items = [('58','routes'),('55','3D scenes'),('116','checks'),('0','console errors'),('8','languages'),('390 px','mobile')]
for i,(v,l) in enumerate(items):
    x = 8.0 + (i%2)*2.5; y = 2.35 + (i//2)*1.42
    panel(s, x, y, 2.3, 1.22, PANEL, LINE)
    tb(s, x+0.15, y+0.18, 2.0, 0.35, v, 17, WHITE, True)
    tb(s, x+0.15, y+0.72, 2.0, 0.2, l, 7.2, ACCENT, False, MONO)
footer(s, 20)
notes(s, 'Quality is a feature, not an afterthought. The suite runs 58 routes in two themes, captures console errors and overflow, and checks mobile at 390 px. TypeScript and production builds must pass. The point is not the number itself; it is that the demo is repeatable and regressions are caught before a client sees them.')

# ---------------------------------------------------------------- 21 roadmap
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
section_label(s, 21, 'Roadmap')
title(s, 'From a convincing demo to a deployable platform.', 27)
subtitle(s, 'The current build is deliberately self-contained. The next four moves turn it into a live operating system.', 1.5, MUTED, 11.8)
steps = [
 ('01','LIVE DATA','Connect BMS, IoT, access control, CDE and ERP through a governed integration layer.','Q4 2026', CYAN),
 ('02','ASSET LOD','Decimated LODs for photoreal vehicles and buildings; scanned context for the Kai Tak site.','Q1 2027', ACCENT),
 ('03','AGENT PILOTS','One COO agent with a narrow mandate, a human gate and a measurable decision baseline.','Q2 2027', AMBER),
 ('04','COMMERCIAL','Multi-tenant deployment, SSO, RBAC, data residency and client-specific benchmarks.','Q3 2027', VIOLET),
]
for i,(n,h,b,when,col) in enumerate(steps):
    x = 0.55 + i*3.05
    panel(s, x, 2.45, 2.85, 3.75, PANEL, LINE)
    tb(s, x+0.2, 2.62, 0.5, 0.25, n, 10, col, True, MONO)
    tb(s, x+0.2, 2.95, 2.4, 0.25, h, 9.2, WHITE, True, MONO)
    tb(s, x+0.2, 3.33, 2.45, 1.55, b, 8.3, MUTED, False, FONT, spacing=1.15)
    tb(s, x+0.2, 5.65, 2.4, 0.2, when, 7.2, col, True, MONO)
footer(s, 21)
notes(s, 'Be explicit about what is simulated. The roadmap starts with integrations, because a demo cannot become an operating system without real data. Then asset quality, then a narrow agent pilot, then commercial deployment. Each phase has a gate and a measurable outcome.')

# ---------------------------------------------------------------- 22 close
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
v = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.55), Inches(1.0), Inches(0.05), Inches(4.4)); v.fill.solid(); v.fill.fore_color.rgb = ACCENT; v.line.fill.background()
tb(s, 0.9, 1.0, 7.0, 0.3, 'OPHYLLA VENTURES OS', 9, ACCENT, True, MONO)
tb(s, 0.9, 1.42, 7.2, 1.55, 'One model.\nOne operating system.', 36, WHITE, True, FONT, spacing=1.02)
subtitle(s, 'A built-environment operating system for the COO: spatial truth, delivery truth, operating truth, commercial truth and governed decisions — on one navigable surface.', 3.15, MUTED, 11.8, 6.2, 0.9)
for i,(lab,val) in enumerate([('LIVE DEMO','http://127.0.0.1:4320'),('MODULES','58 routes · 55 scenes'),('LANGUAGES','8 · dark default')]):
    tb(s, 0.9, 4.55+i*0.55, 1.5, 0.2, lab, 6.6, ACCENT, True, MONO)
    tb(s, 2.45, 4.55+i*0.55, 5.0, 0.22, val, 8.4, WHITE, False, FONT)
pic(s, 'place', 7.55, 1.35, 5.3, 3.3)
panel(s, 7.55, 4.95, 5.3, 1.45, PANEL, LINE)
tb(s, 7.75, 5.1, 4.9, 0.2, 'ILLUSTRATIVE DEMO', 6.8, AMBER, True, MONO)
tb(s, 7.75, 5.35, 4.9, 0.9, 'All data, project names and operating metrics are illustrative. No live client systems are connected.', 7.6, MUTED, False, FONT, spacing=1.15)
footer(s, 22)
notes(s, 'Close on the thesis and the honesty note. Ophylla is a complete, working demonstration of how a built-environment operating system could feel: one model, one surface, many decisions. It is not a live client deployment; all data is illustrative. The next conversation is about which integration and which agent pilot would prove value first.')

OUT.parent.mkdir(parents=True, exist_ok=True)
prs.save(OUT)
print('saved', OUT, 'slides', len(prs.slides))
