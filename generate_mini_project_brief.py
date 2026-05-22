#!/usr/bin/env python3
"""
Generate the ES 192 Mini-Project Brief PDF  -  Mini Skateboard Deck Concept
"""
from fpdf import FPDF
from PIL import Image
import os

# Paths
ARTIFACTS = "/Users/cee-loaners/.gemini/antigravity/brain/c60ff80d-d58b-48f2-9dd7-c3a836701ca0/artifacts"
OUTPUT = "/Users/cee-loaners/Desktop/Projects/ES 192/ES192_Mini_Project_Brief_Skateboard_Deck.pdf"

IMG_EXPLODED = os.path.join(ARTIFACTS, "skateboard_exploded_view.png")
IMG_SELECTION = os.path.join(ARTIFACTS, "skateboard_selection_logic.png")
IMG_OPTIONS = os.path.join(ARTIFACTS, "skateboard_material_options.png")
IMG_WEEKLY = os.path.join(ARTIFACTS, "weekly_lab_progression.png")


class ProjectBrief(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'Letter')
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 5, 'ES 192: Materials Selection in Mechanical Design  -  Mini-Project Brief', align='L')
            self.cell(0, 5, f'Page {self.page_no()}', align='R', new_x="LMARGIN", new_y="NEXT")
            self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
            self.ln(3)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, 'ES 192  -  Fall 2026  -  Draft for Discussion', align='C')

    def section_title(self, num, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(25, 60, 120)
        self.cell(0, 8, f'{num}. {title}', new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(25, 60, 120)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)
        self.set_text_color(30, 30, 30)

    def sub_title(self, title):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(50, 50, 50)
        self.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)
        self.set_text_color(30, 30, 30)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.multi_cell(0, 5, text)
        self.ln(2)

    def bold_text(self, text):
        self.set_font('Helvetica', 'B', 10)
        self.multi_cell(0, 5, text)
        self.ln(1)

    def bullet(self, text, indent=10):
        x = self.get_x()
        self.set_font('Helvetica', '', 10)
        self.cell(indent, 5, '?')
        self.multi_cell(self.w - self.l_margin - self.r_margin - indent, 5, text)
        self.ln(1)

    def bullet_bold_body(self, bold_part, body_part, indent=10):
        self.set_font('Helvetica', '', 10)
        self.cell(indent, 5, '?')
        x = self.get_x()
        y = self.get_y()
        self.set_font('Helvetica', 'B', 10)
        w_bold = self.get_string_width(bold_part)
        self.cell(w_bold, 5, bold_part)
        self.set_font('Helvetica', '', 10)
        remaining_w = self.w - self.l_margin - self.r_margin - indent
        self.multi_cell(remaining_w - w_bold, 5, body_part)
        self.ln(1)

    def add_image_full(self, path, caption="", max_w=180, max_h=130):
        """Add an image centered with optional caption, respecting aspect ratio."""
        img = Image.open(path)
        w, h = img.size
        aspect = w / h

        # Calculate dimensions
        img_w = max_w
        img_h = img_w / aspect
        if img_h > max_h:
            img_h = max_h
            img_w = img_h * aspect

        # Check page space
        if self.get_y() + img_h + 15 > self.h - 25:
            self.add_page()

        x = (self.w - img_w) / 2
        self.image(path, x=x, y=self.get_y(), w=img_w)
        self.set_y(self.get_y() + img_h + 3)

        if caption:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(100, 100, 100)
            self.multi_cell(0, 4, caption, align='C')
            self.set_text_color(30, 30, 30)
            self.ln(3)

    def add_table(self, headers, rows, col_widths=None):
        """Draw a simple table."""
        if col_widths is None:
            usable = self.w - self.l_margin - self.r_margin
            col_widths = [usable / len(headers)] * len(headers)

        # Check if table fits
        needed = 8 + len(rows) * 7
        if self.get_y() + needed > self.h - 25:
            self.add_page()

        # Header
        self.set_font('Helvetica', 'B', 9)
        self.set_fill_color(25, 60, 120)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True, align='C')
        self.ln()

        # Rows
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(30, 30, 30)
        for ri, row in enumerate(rows):
            fill = ri % 2 == 0
            if fill:
                self.set_fill_color(240, 244, 250)
            else:
                self.set_fill_color(255, 255, 255)

            # Calculate max height for this row
            max_lines = 1
            for i, cell in enumerate(row):
                lines = self.multi_cell(col_widths[i], 5, cell, dry_run=True, output="LINES")
                max_lines = max(max_lines, len(lines))

            row_h = max(7, max_lines * 5)
            y_start = self.get_y()

            if y_start + row_h > self.h - 25:
                self.add_page()
                y_start = self.get_y()

            for i, cell in enumerate(row):
                x = self.l_margin + sum(col_widths[:i])
                self.set_xy(x, y_start)
                self.multi_cell(col_widths[i], 5, cell, border=1, fill=fill, align='L')

            self.set_y(y_start + row_h)

        self.ln(4)


def build_pdf():
    pdf = ProjectBrief()

    # =========================================================================
    # TITLE PAGE
    # =========================================================================
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font('Helvetica', 'B', 28)
    pdf.set_text_color(25, 60, 120)
    pdf.cell(0, 12, 'ES 192: Mini-Project Brief', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    pdf.set_font('Helvetica', '', 20)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 10, 'The Multi-Material Skateboard Deck', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, 'Challenge', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)
    pdf.set_draw_color(25, 60, 120)
    pdf.line(60, pdf.get_y(), pdf.w - 60, pdf.get_y())
    pdf.ln(8)
    pdf.set_font('Helvetica', '', 12)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 7, 'Materials Selection in Mechanical Design', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, 'Harvard SEAS  -  Fall 2026', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    pdf.cell(0, 7, 'Prepared by: Seymur Hasanov', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, 'For discussion with: Nora Cullen, Director for Active Learning', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    pdf.set_font('Helvetica', 'I', 10)
    pdf.cell(0, 7, 'Draft  -  April 2026', align='C', new_x="LMARGIN", new_y="NEXT")

    pdf.ln(15)
    # Small preview of the exploded view on title page
    pdf.add_image_full(IMG_EXPLODED, max_w=130, max_h=90)

    # =========================================================================
    # SECTION 1  -  CONCEPT OVERVIEW
    # =========================================================================
    pdf.add_page()
    pdf.section_title('1', 'Concept Overview')

    pdf.body_text(
        'Each team of 3 students designs, fabricates, and tests a multi-material mini skateboard deck '
        'that must maximize load-carrying capacity while minimizing weight. The deck is a sandwich panel: '
        'laser-cut core layers bonded to cast composite skins, with 3D-printed mounting hardware.'
    )

    pdf.body_text(
        'What makes this a materials selection project (not just a build project): every component\'s '
        'material is chosen using the Ashby methodology  -  students derive materials indices, screen '
        'candidates on property charts, and justify their choices with measured data. They then validate '
        'predictions against physical test results.'
    )

    pdf.sub_title('Why a Skateboard Deck?')
    pdf.bullet('It is fundamentally a beam/panel under bending  -  the same mechanics as a cantilever, but far more engaging for students')
    pdf.bullet('The sandwich structure (skins + core) directly teaches composite and hybrid material concepts (Ch 13-14)')
    pdf.bullet('3-point bend testing is standard and requires a simpler fixture than a cantilever clamp')
    pdf.bullet('Students can hold it, flex it, and keep it  -  tangible and rewarding')
    pdf.bullet('Directly leads into the "Composite longboard deck" group project option listed in the syllabus')

    pdf.sub_title('Performance Metric')
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(25, 60, 120)
    pdf.cell(0, 8, 'P  =  F_max  /  m', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.ln(2)
    pdf.set_font('Helvetica', '', 10)
    pdf.bullet('F_max = maximum load supported without exceeding 5 mm center deflection')
    pdf.bullet('m = total mass of the deck assembly')
    pdf.bullet('Secondary metric: load at structural failure / mass')

    # =========================================================================
    # SECTION 2  -  SPECIFICATIONS
    # =========================================================================
    pdf.section_title('2', 'Specifications')

    spec_headers = ['Parameter', 'Value']
    spec_rows = [
        ['Deck length', '~300 mm (mini/cruiser scale)'],
        ['Deck width', '~80 mm'],
        ['Total thickness', '~12-15 mm (core + skins)'],
        ['Shape', 'Flat (no concave, no kick tails)'],
        ['Test method', '3-point bend: supports at truck positions (~200 mm span), load at center'],
        ['Max allowable deflection', '5 mm under service load'],
        ['Performance metric', 'P = F_max / m'],
        ['Manufacturing processes', '>= 3 required: laser cutting, 3D printing, silicone mold casting'],
        ['Materials', 'Standard ALL stock provided (see Section 4)'],
    ]
    pdf.add_table(spec_headers, spec_rows, col_widths=[55, 135])

    # =========================================================================
    # SECTION 3  -  STRUCTURAL CONCEPT
    # =========================================================================
    pdf.add_page()
    pdf.section_title('3', 'Structural Concept  -  Exploded View')

    pdf.body_text(
        'The deck is a sandwich panel  -  the same architecture used in real performance skateboard decks, '
        'aerospace panels, and composite structures. Each layer serves a specific structural function and '
        'is made by a different manufacturing process.'
    )

    pdf.add_image_full(IMG_EXPLODED,
                       caption='Figure 1: Exploded isometric view of the multi-material skateboard deck showing '
                               'laser-cut plywood core (blue), cast fiber-reinforced epoxy skins (green), '
                               'and 3D-printed hardware (orange). Bottom: assembled side profile with 3-point bend test setup.',
                       max_w=170, max_h=140)

    pdf.sub_title('Sandwich Panel Mechanics')
    pdf.bullet('Top & bottom skins (cast composite): carry tension and compression from bending')
    pdf.bullet('Core layers (laser-cut plywood): carry shear, provide bulk thickness to separate skins')
    pdf.bullet('Hardware (3D-printed): truck mounts transfer load, bumpers absorb impact')
    pdf.body_text(
        'This sandwich architecture is a direct application of the course\'s hybrid materials content '
        '(Chapters 13-14). Students learn that separating stiff skins with a lightweight core dramatically '
        'increases bending stiffness with minimal weight penalty  -  a concept they can feel by flexing their deck.'
    )

    # =========================================================================
    # SECTION 4  -  MATERIALS SELECTION LOGIC
    # =========================================================================
    pdf.add_page()
    pdf.section_title('4', 'Materials Selection Logic')

    pdf.body_text(
        'The Ashby methodology drives the material-to-process assignment for each component. '
        'Each component has a function, which translates to a materials index, which points to '
        'candidate materials, which constrain the manufacturing process. The diagram below shows '
        'this chain for all three component groups.'
    )

    pdf.add_image_full(IMG_SELECTION,
                       caption='Figure 2: Materials selection logic  -  Function -> Index -> Ashby Chart -> Material -> Process '
                               'for each component. Bottom: cross-section showing sandwich panel mechanics.',
                       max_w=175, max_h=130)

    # =========================================================================
    # SECTION 5  -  MATERIAL OPTIONS (THE DECISION SPACE)
    # =========================================================================
    pdf.add_page()
    pdf.section_title('5', 'Material Options  -  The Decision Space')

    pdf.body_text(
        'The whole point of the Ashby exercise is that students have multiple real candidates to '
        'choose from and must justify their selection with data. Below is the full palette of materials '
        'available in the ALL, organized by manufacturing process.'
    )

    pdf.add_image_full(IMG_OPTIONS,
                       caption='Figure 3: Complete material candidate pool organized by manufacturing process, '
                               'with key properties and selection questions for each category.',
                       max_w=175, max_h=135)

    # Core options table
    pdf.add_page()
    pdf.sub_title('5.1  Core Layers  -  Laser Cut (students pick 1-2)')
    pdf.add_table(
        ['Material', 'E (GPa)', 'Density (kg/m3)', 'E^(1/2)/rho', 'Notes'],
        [
            ['Birch plywood (3mm)', '12', '600', '5.8 x 10^-3', 'Natural fiber composite, best index'],
            ['Acrylic / PMMA (3mm)', '3.2', '1180', '1.5 x 10^-3', 'Transparent, brittle, poor index'],
            ['MDF (3mm)', '4', '750', '2.7 x 10^-3', 'Uniform (no grain), heavy'],
            ['Aluminum (1.5mm)', '69', '2700', '3.1 x 10^-3', 'Highest E, but heaviest'],
        ],
        col_widths=[35, 18, 30, 25, 82]
    )
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(25, 60, 120)
    pdf.multi_cell(0, 4,
        'Selection question: Plywood wins on E^(1/2)/rho, but aluminum has 6x higher absolute E. '
        'When does raw stiffness matter more than specific stiffness? Students test coupons in Week 2 to decide.')
    pdf.set_text_color(30, 30, 30)
    pdf.ln(5)

    # Skins options table
    pdf.sub_title('5.2  Composite Skins  -  Mold Cast (students pick 1 per skin)')
    pdf.add_table(
        ['Material', 'E (GPa)', 'Density (kg/m3)', 'Notes'],
        [
            ['Neat epoxy', '~3', '~1200', 'Baseline, no filler, easy to pour'],
            ['Rigid polyurethane', '~2.5', '~1100', 'Fast cure (~30 min), lower cost'],
            ['Chopped glass + epoxy', '~8-12', '~1600', 'Short fiber composite, highest stiffness'],
            ['Mineral-filled epoxy', '~5-6', '~1500', 'Stiffer than neat, cheaper than glass'],
            ['Flexible polyurethane', '~0.01', '~1050', 'NOT structural  -  grip/damping layer'],
        ],
        col_widths=[42, 18, 30, 100]
    )
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(25, 60, 120)
    pdf.multi_cell(0, 4,
        'Selection question: Max stiffness (glass-filled bottom skin) or trade top-skin stiffness '
        'for a flexible grip layer (flexible PU on top)? Different functions -> different indices -> different choices.')
    pdf.set_text_color(30, 30, 30)
    pdf.ln(5)

    # Hardware options table
    pdf.sub_title('5.3  Hardware  -  3D Printed (students pick per component)')
    pdf.add_table(
        ['Material', 'E (GPa)', 'Strength (MPa)', 'Notes'],
        [
            ['PLA', '3.5', '60', 'Stiffest, easiest to print, brittle  -  cracks on impact'],
            ['PETG', '2.2', '50', 'Tougher, better layer adhesion, slight flex'],
            ['TPU', '0.03', '30', 'Flexible, impact absorbing  -  bumpers only?'],
        ],
        col_widths=[30, 18, 28, 114]
    )
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(25, 60, 120)
    pdf.multi_cell(0, 4,
        'Selection question: Truck mounts see bolt preload + vibration. PLA is stiffer but PETG '
        'won\'t crack. Students justify using sigma_f/rho AND consider failure mode. Bumpers are a '
        'separate function  -  loss coefficient matters, not E.')
    pdf.set_text_color(30, 30, 30)
    pdf.ln(5)

    # =========================================================================
    # SECTION 6  -  LAB SCHEDULE OVERVIEW
    # =========================================================================
    pdf.add_page()
    pdf.section_title('6', 'Lab Schedule Overview (6 Labs)')

    pdf.body_text(
        'The mini-project runs over 6 weekly labs (2 hours each, ~10 students / 3-4 teams per section). '
        'Each lab has two parallel tracks: a manufacturing skill and a materials selection activity. '
        'The selection thread builds cumulatively: Screen -> Measure -> Validate -> Select -> Compare -> Simulate.'
    )

    pdf.add_image_full(IMG_WEEKLY,
                       caption='Figure 4: Six-week lab progression showing manufacturing skills (top track) and '
                               'materials selection activities (bottom track) converging at each week.',
                       max_w=180, max_h=120)

    # =========================================================================
    # SECTION 7  -  DETAILED LAB PLANS
    # =========================================================================
    pdf.add_page()
    pdf.section_title('7', 'Detailed Lab Plans')

    # --- LAB 1 ---
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, 'Lab 1  -  Design & Planning (Week 1)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.ln(2)

    pdf.sub_title('Objectives')
    pdf.bullet('Students are safe to work in the ALL and understand all equipment')
    pdf.bullet('Teams form and understand the skateboard deck challenge')
    pdf.bullet('Each team produces a design plan with Ashby-based material justification')

    pdf.sub_title('Selection Concept: SCREEN')
    pdf.body_text(
        'Students perform functional decomposition of the deck (core, skins, hardware), fill out a '
        'Design Requirements Table (Function / Constraints / Objectives / Free Variables) for each component, '
        'plot an E vs. rho Ashby chart, derive the beam index M = E^(1/2)/rho, overlay it on the chart, '
        'and screen candidates from the available stock materials.'
    )

    pdf.sub_title('Plan (2 hours)')
    pdf.add_table(
        ['Time', 'Activity', 'Details'],
        [
            ['0:00-0:30', 'ALL Tour + Safety', 'Walk through laser bay, 3D print lab, casting station, workshop. Safety rules. Sign agreements.'],
            ['0:30-0:45', 'Project Briefing', 'Present the Skateboard Deck Challenge: specs, performance metric, test setup, timeline, grading.'],
            ['0:45-1:00', 'Team Formation', 'Form teams of 3. Concept sketching: what shape? How many core layers? Where do skins go?'],
            ['1:00-1:30', 'Design + Selection', 'Design Requirements Tables per component. Ashby E vs rho chart. Derive E^(1/2)/rho index. Screen candidates.'],
            ['1:30-1:50', 'Design Decisions', 'Assign material + process to each component. Begin rough dimensioning. CAs challenge choices.'],
            ['1:50-2:00', 'Wrap-up', 'Deliverable: Design Brief (1-2 pages) due before next lab.'],
        ],
        col_widths=[20, 35, 135]
    )

    pdf.sub_title('Materials & Equipment Needed')
    pdf.bullet('Whiteboards or large paper, markers')
    pdf.bullet('Printed material property data sheets (E, rho, sigma_f for all stock)')
    pdf.bullet('Rulers, example deck photos (good and bad)')
    pdf.bullet('Materials selection software access (if available)')

    pdf.sub_title('Deliverable')
    pdf.bold_text('Design Brief (1-2 pages): annotated sketch, Design Requirements Table per component, Ashby chart with index line and candidates highlighted, material/process justification.')

    # --- LAB 2 ---
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, 'Lab 2  -  Laser Cutting: Core Layers (Week 2)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.ln(2)

    pdf.sub_title('Objectives')
    pdf.bullet('Students can safely operate the laser cutter')
    pdf.bullet('Core layers are cut and test coupons prepared')
    pdf.bullet('Students have measured material properties to validate their Ashby chart predictions')

    pdf.sub_title('Selection Concept: MEASURE')
    pdf.body_text(
        'Students cut test coupons (100 x 20 mm) from at least 2 different sheet materials, perform '
        '3-point bend tests to measure flexural modulus E, and compare measured values to the Ashby '
        'database. This forces them to ask: "Is the E value in the chart accurate for this specific stock, '
        'cut this way?"'
    )

    pdf.sub_title('Plan (2 hours)')
    pdf.add_table(
        ['Time', 'Activity', 'Details'],
        [
            ['0:00-0:20', 'Laser Cutter Training', 'Demo by CA: operation, material loading, focus, DXF/SVG import, kerf compensation, speed/power per material. Safety rules.'],
            ['0:20-0:40', 'File Preparation', 'Teams prep 2D cut files: core layer profiles (could vary width along length) + test coupons (100x20mm from 2+ materials).'],
            ['0:40-1:10', 'Cutting', 'Teams take turns cutting. Available: 3mm plywood, 3mm acrylic, 3mm MDF, 1.5mm aluminum.'],
            ['1:10-1:40', 'Baseline Testing', '3-point bend test on coupons: 80mm span, load at center, measure deflection at 3+ load increments. Calculate E = FL^3/(48*delta*I).'],
            ['1:40-1:55', 'Discussion', 'Which material had best specific stiffness? Did measurements match database? How does laser cutting constrain geometry?'],
            ['1:55-2:00', 'Wrap-up', 'Verify all teams have cut core layers + test data. Remind: bring CAD files for printing next week.'],
        ],
        col_widths=[20, 35, 135]
    )

    pdf.sub_title('Materials & Equipment Needed')
    pdf.bullet('Sheet stock: 3mm birch plywood, 3mm acrylic, 3mm MDF, 1.5mm aluminum')
    pdf.bullet('3-point bend test blocks (2 support blocks + loading nose)')
    pdf.bullet('Calibrated weights (100g, 200g, 500g, 1kg)')
    pdf.bullet('Dial indicator or rulers, digital scales, calipers')

    pdf.sub_title('Deliverable')
    pdf.bold_text('Laser-cut core layers + measured flexural modulus data for 2+ materials (data table + comparison to Ashby database).')

    # --- LAB 3 ---
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, 'Lab 3  -  3D Printing: Hardware & Mold Pattern (Week 3)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.ln(2)

    pdf.sub_title('Objectives')
    pdf.bullet('Students can use FDM printers and slicer software')
    pdf.bullet('Truck mounts, bumpers, and mold pattern are printing')
    pdf.bullet('Students understand how print orientation changes material properties (anisotropy)')

    pdf.sub_title('Selection Concept: VALIDATE PROCESS-PROPERTY EFFECTS')
    pdf.body_text(
        'Students print two identical test beams in PLA  -  one flat (layers parallel to length) and one '
        'on-edge (layers perpendicular). They bend-test both and measure the stiffness difference. '
        'This demonstrates that the same material has different effective properties depending on '
        'how it\'s processed  -  the Ashby chart gives bulk values, but process changes them.'
    )

    pdf.sub_title('Plan (2 hours)')
    pdf.add_table(
        ['Time', 'Activity', 'Details'],
        [
            ['0:00-0:20', '3D Printing Training', 'Demo: slicer walkthrough (STL import, layer height, infill, orientation, supports, brim). Filaments: PLA, PETG, TPU  -  when to use each.'],
            ['0:20-0:35', 'Design Review + Slicing', 'CAs review designs for printability. Each team preps: (A) truck mounts/bumpers, (B) mold pattern for skin casting (with draft angles for demolding).'],
            ['0:35-0:55', 'Orientation Experiment', 'Print 2 small test beams (60x10x5mm) in PLA: flat vs. on-edge (~10 min each). Discuss anisotropy while printing.'],
            ['0:55-1:15', 'Test Orientation Beams', '3-point bend test both beams. Calculate stiffness ratio. The flat beam will be noticeably stiffer. Record data.'],
            ['1:15-1:45', 'Start Functional Prints', 'Queue truck mounts, bumpers, mold pattern. Small parts may finish; larger prints run after session.'],
            ['1:45-2:00', 'Wrap-up', 'Confirm mold patterns will be ready before Week 4. Preview casting process. Bring ALL components to Week 4.'],
        ],
        col_widths=[20, 35, 135]
    )

    pdf.sub_title('Materials & Equipment Needed')
    pdf.bullet('PLA, PETG, TPU filament spools')
    pdf.bullet('FDM printers (2-3 per section)')
    pdf.bullet('Slicer software on lab computers')
    pdf.bullet('Pre-made test beam STL file (shared via Canvas)')
    pdf.bullet('3-point bend test setup from Week 2')

    pdf.sub_title('Deliverable')
    pdf.bold_text('3D-printed truck mounts + bumpers + mold pattern + print orientation test data (stiffness anisotropy ratio).')

    # --- LAB 4 ---
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, 'Lab 4  -  Silicone Mold Casting & Assembly (Week 4)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.ln(2)

    pdf.sub_title('Objectives')
    pdf.bullet('Students can make silicone molds and cast resin parts')
    pdf.bullet('Composite skin layers are cast (material choice justified via Ashby)')
    pdf.bullet('Deck assembly begins  -  bonding skins to core')

    pdf.sub_title('Selection Concept: CREATE NEW MATERIALS')
    pdf.body_text(
        'Students select a resin system for their skins  -  a genuine Ashby exercise. They can create '
        'a fiber-reinforced composite (chopped glass + epoxy, E ~8-12 GPa) that occupies a different '
        'region on the Ashby chart than any neat FDM filament. They\'re not just picking from a list  -  '
        'they\'re designing a material by choosing fiber type and volume fraction.'
    )

    pdf.sub_title('Plan (2 hours)')
    pdf.add_table(
        ['Time', 'Activity', 'Details'],
        [
            ['0:00-0:15', 'Casting Training', 'Demo: mold release on pattern, containment box (foam core + hot glue), mix silicone by weight, pour, degas if possible. Cure: 4-6 hrs.'],
            ['0:15-0:40', 'Mold-Making', 'Teams pour silicone molds for flat skin panels. Teams with already-cured molds proceed to resin casting. Backup molds available.'],
            ['0:40-1:10', 'Resin Casting', 'Select resin: neat epoxy, rigid PU, fiber-filled epoxy, mineral-filled, or flexible PU. Mix (add fibers if chosen). Pour into mold. Cure 30-60 min initial.'],
            ['1:10-1:40', 'Begin Assembly', 'While skins cure: dry-fit core layers + truck mounts. Plan bonding strategy (epoxy adhesive, bolts, press-fit). Begin laminating core layers.'],
            ['1:40-1:55', 'Discussion', 'What shapes does casting enable that other processes cannot? Defects? How does resin choice affect performance?'],
            ['1:55-2:00', 'Wrap-up', 'CAs will demold cured parts. Teams finalize assembly before Week 5. Open lab time may be arranged.'],
        ],
        col_widths=[20, 35, 135]
    )

    pdf.sub_title('Materials & Equipment Needed')
    pdf.bullet('Silicone rubber (two-part, e.g., Smooth-On Mold Star)')
    pdf.bullet('Mold release spray, foam core + hot glue guns (containment)')
    pdf.bullet('Casting resins: rigid PU, flexible PU, epoxy, chopped glass fiber, mineral filler')
    pdf.bullet('Mixing cups, stir sticks, digital scale, disposable gloves, eye protection')
    pdf.bullet('Vacuum degassing chamber (if available)')
    pdf.bullet('Pre-made backup silicone molds (2-3 per section)')

    pdf.sub_title('Deliverable')
    pdf.bold_text('Cast composite skin layers + resin selection justification on Ashby chart + partially assembled deck.')

    # --- LAB 5 ---
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, 'Lab 5  -  Load Testing & Validation (Week 5)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.ln(2)

    pdf.sub_title('Objectives')
    pdf.bullet('Every team has a fully assembled, tested deck with measured data')
    pdf.bullet('Students compare Ashby predictions to actual performance')
    pdf.bullet('Students analyze failure modes and reflect on methodology')

    pdf.sub_title('Selection Concept: COMPARE PREDICTED vs. ACTUAL')
    pdf.body_text(
        'This is the core learning moment. Students compare three things: (1) their Week 1 Ashby-based '
        'prediction of performance, (2) their actual test result, and (3) why they differ. Common reasons: '
        'joints fail before materials, cast parts have voids, print layers delaminate, bonding is imperfect. '
        'They learn where the methodology works and where real-world factors dominate.'
    )

    pdf.sub_title('Plan (2 hours)')
    pdf.add_table(
        ['Time', 'Activity', 'Details'],
        [
            ['0:00-0:15', 'Final Assembly', 'Attach cured skins to core. Tighten truck mounts. Trim flash. Weigh completed deck. Measure dimensions.'],
            ['0:15-0:20', 'Test Procedure Review', 'Support at truck positions (~200mm span). Load at center incrementally. Record F vs delta. Find F_max at delta=5mm.'],
            ['0:20-1:00', 'Testing (all teams)', '~10 min per team. While waiting: calculate performance index, review Week 1 predictions. If safe, load to failure.'],
            ['1:00-1:20', 'Leaderboard', 'All teams calculate P = F_max/m. Post results. Rank by performance index. Celebrate top design.'],
            ['1:20-1:50', 'Validation Discussion', 'Each team: Ashby prediction vs. actual result. Why different? Which choices mattered most? What would you change?'],
            ['1:50-2:00', 'Report Assignment', 'Mini-project report (3-5 pages): design, Ashby plots, test data, predicted vs actual, failure modes, lessons.'],
        ],
        col_widths=[20, 35, 135]
    )

    pdf.sub_title('Materials & Equipment Needed')
    pdf.bullet('3-point bend test fixture (2 support blocks at ~200mm span)')
    pdf.bullet('Calibrated weights (100g through 5kg)')
    pdf.bullet('Dial indicator + magnetic stand')
    pdf.bullet('Digital scale, calipers')
    pdf.bullet('Whiteboard for leaderboard')
    pdf.bullet('Camera (students photograph failure modes for reports)')

    pdf.sub_title('Deliverable')
    pdf.bold_text('Mini-project report (3-5 pages, due in 1 week): design rationale, Ashby plots, material/process justification, load-deflection curve, predicted vs. actual analysis, failure mode discussion, lessons learned.')

    # --- LAB 6 ---
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, 'Lab 6  -  COMSOL Simulation (Week 6)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.ln(2)

    pdf.sub_title('Objectives')
    pdf.bullet('Students can set up a basic structural simulation in COMSOL')
    pdf.bullet('Students compare simulation to experiment and Ashby prediction (three-way validation)')
    pdf.bullet('Students understand when simulation is useful vs. when physical testing is necessary')

    pdf.sub_title('Selection Concept: SIMULATE & THREE-WAY VALIDATION')
    pdf.body_text(
        'Students model their deck in COMSOL using their measured material properties (not textbook values), '
        'simulate the 3-point bend test, and compare the result to both their Ashby prediction and their '
        'experimental data. They see that Ashby and COMSOL roughly agree (both assume perfect material), but '
        'both differ from experiment (which includes joints, defects, imperfect bonding). This teaches '
        'when simulation adds value and when it doesn\'t replace testing.'
    )

    pdf.sub_title('Plan (2 hours)  -  Run by COMSOL Instruction Team')
    pdf.add_table(
        ['Time', 'Activity', 'Details'],
        [
            ['0:00-0:20', 'COMSOL Intro', 'Interface overview. Open pre-built sandwich panel template. Walk through: geometry, material assignment, BCs, load.'],
            ['0:20-0:50', 'Guided Exercise', 'Students modify template: adjust deck dimensions, assign materials (E, nu, rho from their measured data), apply their test loads. Run.'],
            ['0:50-1:10', 'Comparison Exercise', 'Compare COMSOL deflection to experimental data from Week 5. Fill comparison table: predicted vs measured at each load.'],
            ['1:10-1:40', 'Parametric Study', 'Vary one parameter (core material, skin thickness, fiber volume fraction). Plot results. "What if I used aluminum core instead?"'],
            ['1:40-2:00', 'Wrap-up Discussion', 'When is simulation useful vs. when is testing necessary? Preview COMSOL features for group projects.'],
        ],
        col_widths=[20, 35, 135]
    )

    pdf.sub_title('Three-Way Comparison Table (students fill in)')
    pdf.add_table(
        ['Prediction Method', 'Source', 'Deflection at Load X'],
        [
            ['Ashby index (Week 1)', 'Analytical, from materials index', 'delta_predicted'],
            ['COMSOL simulation (Week 6)', 'Computational, idealized geometry', 'delta_simulated'],
            ['Experiment (Week 5)', 'Physical test, real structure', 'delta_measured'],
        ],
        col_widths=[50, 65, 75]
    )

    pdf.sub_title('Materials & Equipment Needed')
    pdf.bullet('COMSOL via HUIT VDI (student access set up in advance)')
    pdf.bullet('Pre-built sandwich panel template (.mph file)')
    pdf.bullet('Material property table matching lab stock')
    pdf.bullet('Worksheet with step-by-step instructions + comparison table template')

    # =========================================================================
    # SECTION 8  -  MATERIALS SELECTION THREAD SUMMARY
    # =========================================================================
    pdf.add_page()
    pdf.section_title('8', 'Materials Selection Thread Summary')

    pdf.body_text(
        'The materials selection methodology is reinforced every single week. Each lab has a "selection verb" '
        'that builds on the previous week. By Week 5, students have gone through the complete Ashby cycle '
        'with physical evidence (test data + a broken deck) to prove it.'
    )

    pdf.add_table(
        ['Week', 'Lab', 'Selection Verb', 'What Students Learn'],
        [
            ['1', 'Design', 'SCREEN', 'Use Ashby charts + indices to narrow candidates'],
            ['2', 'Laser Cut', 'MEASURE', 'Real properties != database values; validate assumptions'],
            ['3', '3D Print', 'VALIDATE', 'Process changes properties (anisotropy); selection must account for mfg'],
            ['4', 'Casting', 'CREATE', 'Design new materials (fiber composites) to access new chart regions'],
            ['5', 'Testing', 'COMPARE', 'Prediction vs reality; where methodology works and breaks down'],
            ['6', 'COMSOL', 'SIMULATE', 'Computational validation; parametric "what-if" exploration'],
        ],
        col_widths=[12, 22, 25, 131]
    )

    # =========================================================================
    # SECTION 9  -  GRADING RUBRIC
    # =========================================================================
    pdf.section_title('9', 'Grading Rubric (10% of Course Grade)')

    pdf.add_table(
        ['Criterion', 'Weight', 'Description'],
        [
            ['Materials Selection Rationale', '30%', 'Ashby charts, materials indices, Design Requirements Tables, justification quality'],
            ['Design Quality & Manufacturing', '25%', 'Creativity, execution quality, appropriate use of each process'],
            ['Test Results & Performance', '20%', 'Data quality, P = F_max/m, rigor of testing protocol'],
            ['Report & Analysis', '25%', 'Clarity, predicted-vs-actual comparison, failure mode analysis, reflection'],
        ],
        col_widths=[50, 18, 122]
    )

    # =========================================================================
    # SECTION 10  -  PRE-SEMESTER ACTION ITEMS
    # =========================================================================
    pdf.section_title('10', 'Pre-Semester Action Items')

    pdf.add_table(
        ['Task', 'Owner', 'Target'],
        [
            ['Finalize deck specs and test fixture design', 'Seymur', 'End of April 2026'],
            ['Test-run full 6-week sequence; write lab handouts', 'Nora', 'End of May 2026'],
            ['Build or procure 3-point bend test fixture', 'Nora + ALL staff', 'End of May 2026'],
            ['Prepare 2-3 backup silicone molds (flat skin panel shape)', 'Nora', 'End of May 2026'],
            ['Coordinate with COMSOL team: provide sandwich panel template specs', 'Seymur', 'End of April 2026'],
            ['COMSOL team: build sandwich panel template .mph file', 'COMSOL team', 'End of May 2026'],
            ['Recruit and train lab CAs from ES 51', 'Seymur + Nora', 'August 2026'],
            ['Procure silicone, resins, chopped fiber, casting supplies', 'Nora + ALL staff', 'August 2026'],
            ['Prepare material data sheets for students', 'Seymur', 'Before Week 1'],
        ],
        col_widths=[95, 40, 55]
    )

    # =========================================================================
    # SAVE
    # =========================================================================
    pdf.output(OUTPUT)
    print(f"PDF saved to: {OUTPUT}")
    print(f"Total pages: {pdf.page_no()}")


if __name__ == "__main__":
    build_pdf()
