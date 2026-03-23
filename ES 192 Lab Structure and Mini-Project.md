# ES 192: Lab Structure and Mini-Project Design

**Fall 2026 — Pilot of Project-Based Format**

---

## Lab Overview

The laboratory component of ES 192 runs in parallel with lectures, providing hands-on experience with manufacturing processes, simulation, and the Ashby materials selection methodology. Each student attends one lab section per week.

### Lab Sections (~10 students each, 2 hours per session)

| Section | Day | Time |
|---------|-----|------|
| A | Tuesday | 2:15 – 4:15 PM |
| B | Wednesday | 9:45 – 11:45 AM |
| C | Friday | 9:45 – 11:45 AM |
| D | [TBD] | [TBD] |

Additional sections will be added based on enrollment (anticipating well above 30 students from ME, BioE, and ESE).

### Staffing

- **Nora Cullen** — Director for Active Learning. Oversees lab logistics, equipment, and staff.
- **Lab Course Assistants (CAs)** — Recruited from experienced ES 51 CAs. Present during all lab sections for manufacturing guidance and safety oversight.
- **Seymur Hasanov** — Available for project brainstorming meetings with teams; will attend lab sections as schedule permits.
- **ALL Technical Staff** — Available for equipment support during lab hours.

### Lab Facilities (ALL, SEC Lower Level)

- **Laser Cutters** — CO2 laser cutters for sheet materials (plywood, acrylic, cardboard, thin metals)
- **3D Printing Lab** — FDM printers (PLA, PETG, TPU); SLA available for fine-detail mold patterns
- **Casting Area** — Silicone mold-making station; resin and silicone casting supplies; vacuum degassing chamber
- **General Workshop** — Hand tools, assembly workspace, measurement equipment
- **Testing Equipment** — Load cells, calipers, digital scales, dial indicators

---

## Lab Schedule Overview

| Week | Lab Type | Focus |
|------|----------|-------|
| 1 | **Orientation + Design** | ALL tour, safety, mini-project launch, Ashby design exercise |
| 2 | **Laser Cutting** | Training + fabrication of structural components |
| 3 | **3D Printing** | Training + printing connectors + mold patterns |
| 4 | **Silicone Casting** | Mold-making, resin casting, composite layup assembly |
| 5 | **Testing + Analysis** | Load testing, data analysis, predicted vs. actual |
| 6 | **COMSOL** | Dedicated COMSOL simulation lab (run by COMSOL team) |
| 7 | **Group Project** | Team formation, brainstorming, proposals |
| 8 | **Group Project** | Design + begin fabrication |
| 9 | **Group Project** | Fabrication + progress check-in |
| 10 | **Group Project** | Fabrication + iterative testing |
| 11 | **Group Project** | Continued fabrication/testing |
| 12 | **Group Project** | Final fabrication + testing + data collection |
| 13 | **Presentations** | Group project presentations |

---

## Phase 1: Mini-Project (Weeks 1–5)

### The Hybrid Cantilever Challenge

#### Concept

Each team of 3 designs, fabricates, and tests a **multi-material cantilever structure** that must support the maximum load at a fixed overhang distance while minimizing total weight. The cantilever clamps to a standard test fixture and extends horizontally; a load is applied at the tip.

What makes this a materials selection project (not just a build project): every week, students must make and justify material and process choices using the Ashby methodology, then validate those choices through fabrication and testing.

#### Why This Project

The cantilever challenge uses only concepts from **Weeks 1–5 lectures** (Chapters 1–8), so theory and practice are perfectly synchronized:

| Course Concept (taught in parallel) | How the Mini-Project Teaches It |
|--------------------------------------|-------------------------------|
| Materials indices (Ch 4) | Students derive and apply E^(1/2)/ρ and σ_f^(2/3)/ρ to select beam materials |
| Ashby charts and screening (Ch 3–4) | Students generate charts, overlay index lines, and down-select candidates |
| Process selection (Ch 6–8) | Each component uses a different process; students experience why process choice depends on material, geometry, and function |
| Process-property relationships (Ch 6) | Students observe how laser cutting, 3D printing, and casting produce parts with different properties |
| Design for AM (Ch 8) | 3D-printed components require understanding of infill, orientation, and supports |
| Translation of design requirements (Ch 4) | Each component gets a Function/Constraints/Objectives/Free Variables table |

#### Performance Metric

**P = F_max / m**

- F_max = maximum load supported without exceeding 10 mm tip deflection
- m = total mass of the cantilever structure
- Secondary metric: load at structural failure / mass

#### Specifications

| Parameter | Value |
|-----------|-------|
| Overhang length | 300 mm (fixed) |
| Maximum allowable tip deflection | 10 mm under service load |
| Mounting | Must clamp to a standard 25 mm-thick test plate |
| Manufacturing processes required | 3 minimum: laser cutting, 3D printing, silicone mold casting |
| Maximum envelope | 300 mm (L) × 100 mm (W) × 100 mm (H) |
| Materials | Standard ALL stock provided |

---

### Detailed Lab Plans (2 hours each, 10 students / 3–4 teams)

---

### Lab 1 — Orientation, Safety, and Design (Week 1)

**Duration:** 2 hours
**Goal:** Students are safe to work in the ALL, understand the challenge, and have a design plan with materials justification.

| Time | Activity | Details |
|------|----------|---------|
| 0:00–0:30 | **ALL Tour + Safety Training** | Walk through laser cutter bay, 3D print lab, casting station, and workshop. Safety rules: eye protection in workshop, no loose clothing near laser, resin handling (gloves, ventilation). Sign safety agreements. |
| 0:30–0:45 | **Mini-Project Briefing** | Present the Hybrid Cantilever Challenge. Show specifications, performance metric, test fixture, timeline, and grading rubric. Show examples of cantilever designs (good and bad) from similar courses. Q&A. |
| 0:45–1:00 | **Team Formation + Concept Sketching** | Form teams of 3 (CAs help balance skills). Each team gets a whiteboard or large paper. Sketch at least two cantilever concepts. Identify functional decomposition: What carries the bending load? (beam/web) What mounts to the fixture? (clamp) What connects them? (joints/brackets) |
| 1:00–1:30 | **Design Requirements + Materials Selection** | For each component, complete a **Design Requirements Table** (Function / Constraints / Objectives / Free Variables). Using materials property data sheets (provided) and the course materials selection tool, generate Ashby plots of E vs. ρ. Overlay the beam material index M = E^(1/2)/ρ. Identify candidate materials from available stock: plywood, acrylic, MDF, aluminum sheet, PLA, PETG, TPU, cast polyurethane resin. Assign each component a material and process with written justification. |
| 1:30–1:50 | **Design Decisions** | Teams finalize which material and process for each component. Begin rough dimensioning. CAs circulate to review and challenge choices ("Why not acrylic instead of plywood for the beam?"). |
| 1:50–2:00 | **Wrap-up + Deliverable** | Explain deliverable: **Design brief (1–2 pages)** due before next lab. Must include: annotated sketch, Design Requirements Table for each component, Ashby plot with index line and candidate materials highlighted, material/process selection with justification. |

**Materials needed:** Whiteboards/large paper, markers, printed material property data sheets, rulers, example cantilever photos.

---

### Lab 2 — Laser Cutting: Structural Components (Week 2)

**Duration:** 2 hours
**Goal:** Students can operate the laser cutter and have their primary structural components cut and characterized.

| Time | Activity | Details |
|------|----------|---------|
| 0:00–0:20 | **Laser Cutter Training** | Demonstration by CA: machine operation, material loading, focus adjustment, DXF/SVG file import, kerf compensation, speed/power settings for different materials. Safety: never leave running machine unattended, material restrictions (no PVC, no polycarbonate). |
| 0:20–0:40 | **File Preparation** | Teams prepare their 2D cut files (DXF or SVG). CAs assist with software. Files should include: structural beam/web, flanges, clamp plates, and any flat components. Also prepare standard test coupons: **100 × 20 mm strips** from 2+ different materials for baseline testing. |
| 0:40–1:10 | **Cutting** | Teams take turns at the laser cutter (with 3–4 teams and 10 students, coordinate so each team gets ~2 cuts while others prep files or do the baseline testing). Cut structural components AND test coupons from at least 2 different sheet materials. Available stock: 3 mm birch plywood, 3 mm acrylic (PMMA), 1.5 mm aluminum sheet, 3 mm MDF. |
| 1:10–1:40 | **Baseline Materials Testing** | While teams wait for cutting time, they perform **3-point bend tests** on their test coupons: support coupon on two blocks (80 mm span), load at center with known weights, measure deflection with ruler or dial indicator. Record load vs. deflection for at least 3 load increments. Weigh each coupon on digital scale. Calculate: effective flexural modulus E = (F × L³) / (48 × δ × I). Compare measured values to the property data sheets. **This is the data they'll use to justify their material choice.** |
| 1:40–1:55 | **Discussion** | What did you learn? Which material had the highest specific stiffness (E/ρ)? Did measured values match the database? How does laser cutting constrain geometry (2D only, minimum feature size, kerf, thermal effects on different materials)? |
| 1:55–2:00 | **Wrap-up** | Verify all teams have their cut structural components + test data. Remind teams to bring design files for 3D printing next week — prepare CAD models before next lab. |

**Materials needed:** Sheet stock (plywood, acrylic, MDF, aluminum), 3-point bend test blocks (2 support blocks + loading nose), calibrated weights (100g, 200g, 500g, 1kg), dial indicator or rulers, digital scales, calipers.

---

### Lab 3 — 3D Printing: Connectors and Mold Patterns (Week 3)

**Duration:** 2 hours
**Goal:** Students can use the FDM printers and have functional parts printing + mold pattern ready for casting.

| Time | Activity | Details |
|------|----------|---------|
| 0:00–0:20 | **3D Printing Training** | Demonstration by CA: slicer software walkthrough (importing STL, setting layer height, infill density and pattern, print orientation, support structures, brim/raft). Filament options and when to use each: PLA (stiffest, easiest, brittle), PETG (tougher, better layer adhesion), TPU (flexible — good for grip pads on clamp). Discuss: print orientation matters — layers are the weak direction (anisotropy). |
| 0:20–0:35 | **Design Review + Slicing** | Teams open their CAD files. CAs review designs for printability: overhangs, minimum wall thickness, support needs. Teams slice their parts and review estimated print times. Each team should have: (A) **Functional component(s)** — connectors, joints, brackets, clamp adapters, or lattice reinforcements. (B) **Mold pattern** — a positive of the component to be cast (clamp body, load-bearing insert, or bracket). Design for demolding: include draft angles (2–3°), smooth surfaces, parting line features. |
| 0:35–0:55 | **Print Orientation Experiment** | Each team prints **two small identical test beams** (60 × 10 × 5 mm) in PLA — one oriented flat (layers parallel to length — strong direction) and one on edge (layers perpendicular — weak direction). These are small and print in ~10 minutes each. While printing, teams finalize CAD for their functional parts. |
| 0:55–1:15 | **Test the Orientation Beams** | Once printed, 3-point bend test both beams with the same setup from Week 2. Record deflection under the same load. The flat beam will be noticeably stiffer. Calculate the stiffness ratio. **This demonstrates anisotropy from layer-by-layer printing — a process-property relationship that affects their design.** |
| 1:15–1:45 | **Start Functional Prints** | Queue functional parts and mold patterns on printers. Small parts (~30 min) may finish during the session. Larger parts will be set to run after the session — CAs or students pick up finished prints before the next lab. Teams with shorter prints can start a second part. While waiting, teams update their design brief with the print orientation data and any design changes. |
| 1:45–2:00 | **Wrap-up + Next Week Prep** | Review what each team has printing. Confirm all mold patterns will be ready before Week 4. Brief preview of casting process: what to expect, what to wear (gloves, eye protection). Remind teams to bring all laser-cut and 3D-printed components to Week 4 for assembly planning. |

**Materials needed:** PLA, PETG, TPU filament spools, FDM printers (at least 2–3 available per section), slicer software on lab computers or student laptops, test beam STL file (pre-made, shared via Canvas), 3-point bend test setup from Week 2.

---

### Lab 4 — Silicone Mold Casting and Assembly (Week 4)

**Duration:** 2 hours
**Goal:** Students have cast components and a fully assembled (or nearly assembled) cantilever.

| Time | Activity | Details |
|------|----------|---------|
| 0:00–0:15 | **Casting Training** | Demonstration by CA: (1) Preparing the 3D-printed mold pattern — apply mold release spray. (2) Build a containment box around the pattern (foam core walls, hot glue to seal). (3) Mix two-part silicone rubber by weight (follow manufacturer ratio exactly). (4) Pour slowly over the pattern, tap to release air bubbles. Vacuum degas if chamber available. (5) Cure time: typically 4–6 hours (will be ready for demolding before next lab, or CAs can demold). **Note:** Pre-made silicone molds (from a test-run pattern) are available as backup so every team can cast resin parts today even if their own mold isn't cured. |
| 0:15–0:40 | **Mold-Making** | Each team prepares their mold: apply release to 3D-printed pattern, build containment, mix and pour silicone. Set aside to cure. Teams that brought already-cured molds (from early printing) proceed directly to resin casting. **Using backup molds:** Teams whose silicone molds aren't cured yet use the pre-made backup molds for casting today. They can cast with their own molds next week during assembly. |
| 0:40–1:10 | **Resin Casting** | Teams select their casting resin (a material selection decision that must be justified): **Rigid polyurethane resin** — high stiffness, good for load-bearing brackets or clamp inserts. **Flexible polyurethane resin** — adds compliance, good for grip pads or vibration damping. **Epoxy resin** — high strength, good adhesion to other materials, longer cure time. **Fiber-filled resin** — mix chopped glass fiber into rigid resin before pouring for enhanced stiffness (a mini composite!). Mix resin. Pour into silicone mold (or backup mold). Set aside to cure (most resins: 30–60 min for initial set, full cure overnight). |
| 1:10–1:40 | **Assembly Planning + Partial Assembly** | While cast parts cure, teams begin assembling the non-cast components. Lay out all parts: laser-cut structural members + 3D-printed connectors. Dry-fit everything. Plan joining methods for each interface (each is a design choice to justify): bolted connections (rigid, removable), adhesive bonding (epoxy or CA glue — permanent, gap-filling), press-fit / snap-fit (designed into 3D-printed parts). Begin bonding/fastening non-cast components. |
| 1:40–1:55 | **Discussion** | What shapes does casting enable that printing and cutting cannot? What defects did you observe in cast parts (bubbles, voids, shrinkage, incomplete fill)? How does resin choice affect the cantilever's performance? What is the role of the casting process in the overall design — structural, functional, or both? |
| 1:55–2:00 | **Wrap-up + Week 5 Prep** | CAs will demold cured silicone molds and resin parts during the week. Teams should finalize assembly before Week 5 (open lab time may be arranged). Bring fully assembled cantilevers to Week 5 for testing. Review test procedure so teams know what to expect. |

**Materials needed:** Silicone rubber (two-part, e.g., Smooth-On Mold Star), mold release spray, foam core sheets + hot glue guns (for containment boxes), mixing cups and stir sticks, digital scale (for ratio mixing), rigid PU resin, flexible PU resin, epoxy resin, chopped glass fiber (optional filler), disposable gloves, eye protection, parchment paper (work surface), vacuum degassing chamber (if available), pre-made backup silicone molds (2–3 per section).

---

### Lab 5 — Load Testing and Validation (Week 5)

**Duration:** 2 hours
**Goal:** Every team has tested their cantilever, collected data, and compared results to their Ashby predictions.

| Time | Activity | Details |
|------|----------|---------|
| 0:00–0:15 | **Final Assembly** | Teams complete any remaining assembly — attach cured cast components, tighten fasteners, apply final adhesive. Trim flash from cast parts if needed. Weigh each completed cantilever on the digital scale. Measure overall dimensions with calipers. |
| 0:15–0:20 | **Test Procedure Review** | CA explains the test protocol: (1) Clamp cantilever to test fixture (standard 25 mm plate on table edge). (2) Mark the 300 mm overhang point. (3) Hang calibrated weights at the tip incrementally. (4) At each load increment, measure tip deflection with dial indicator. (5) Record F vs. δ (load vs. deflection). (6) Identify F_max at δ = 10 mm. (7) If safe, continue loading to failure — note failure load, failure mode (fracture? yielding? joint failure? delamination?), and failure location. |
| 0:20–1:00 | **Testing (all teams)** | Teams test sequentially (with 3–4 teams, ~10 min per team for testing + data recording). While one team tests, other teams: (a) finalize their load-deflection data table, (b) begin calculating their performance index, (c) review their Week 1 Ashby predictions. **Data to record per team:** Load increments (N), deflection at each increment (mm), F_max at 10 mm deflection, failure load (N), failure mode description, total cantilever mass (g). |
| 1:00–1:20 | **Performance Calculation + Leaderboard** | All teams calculate P = F_max / m. CA posts results on whiteboard: team name, mass, F_max, P, failure mode. Rank by performance index. Brief celebration of the top-performing design. |
| 1:20–1:50 | **Validation Discussion** | This is the core learning moment. Each team compares: (1) Their **Week 1 Ashby prediction** — which materials did they select and what performance did they expect based on the materials index? (2) Their **actual test result** — how did the cantilever actually perform? (3) **Discrepancy analysis**: Why is the actual result different from the prediction? Common reasons: joint failures (the interface is the weakest link, not the material), casting defects (bubbles reduced stiffness), print orientation effects (layers delaminated), boundary conditions (clamp wasn't perfectly rigid), material variability. Class-wide discussion: Which design choices made the biggest difference? Which failure modes were surprising? What would you change in a second iteration? |
| 1:50–2:00 | **Report Assignment** | Explain the mini-project report (due in 1 week): 3–5 pages per team covering design rationale, Ashby plots, material/process justification per component, test data (load-deflection curve), predicted vs. actual comparison, failure mode discussion, and lessons learned. |

**Materials needed:** Test fixture (25 mm plate clamped to sturdy table or dedicated test rig), calibrated weights (100g through 5kg), dial indicator + magnetic stand, digital scale, calipers, whiteboard for leaderboard, camera (students photograph failure modes for their reports).

---

### Lab 6 — COMSOL Simulation Lab (Week 6)

**This lab is run by the dedicated COMSOL instruction team.** The ES 192 teaching staff provides the following requirements and specifications for what the COMSOL lab should cover:

#### COMSOL Lab Requirements for the COMSOL Team

**Context:** Students have just completed a 5-week mini-project in which they designed, built, and tested a cantilever beam. They have experimental load-deflection data and observed failure modes. The COMSOL lab should enable them to simulate what they already tested and compare simulation to experiment.

**Learning objectives for students after this lab:**
1. Set up a basic structural mechanics simulation in COMSOL (geometry, materials, boundary conditions, loads).
2. Run a parametric study varying material properties or geometry.
3. Extract and interpret results: displacement field, von Mises stress distribution, reaction forces.
4. Compare simulation predictions to their experimental cantilever data from Week 5.

**Suggested lab structure (2 hours, 10 students):**

| Segment | Content |
|---------|---------|
| Intro (20 min) | COMSOL interface overview. Open a pre-built cantilever beam template. Walk through: geometry definition, material assignment, boundary conditions (fixed end), point load at tip. |
| Guided exercise (30 min) | Students modify the template to match their own cantilever design: adjust beam dimensions, assign their materials (E, ν, ρ from data sheets), apply their test loads. Run the simulation. Extract tip deflection and stress contour. |
| Comparison exercise (20 min) | Students compare COMSOL-predicted deflection to their experimental data from Week 5. Fill in a comparison table: Predicted δ vs. Measured δ at each load level. Discuss sources of discrepancy (idealized geometry, perfect clamping, no joints in the model). |
| Parametric study (30 min) | Students vary one parameter (e.g., beam material, beam thickness, or clamp rigidity) and observe the effect on deflection and stress. Plot results. |
| Wrap-up (20 min) | Discussion of when simulation is useful vs. when testing is necessary. Introduction to COMSOL features they'll use in their group projects (thermal, contact, layered structures). |

**Files to provide:**
- Pre-built cantilever beam template (.mph) with parameterized geometry and material properties
- Material property table matching the lab stock (plywood, acrylic, aluminum, MDF, PLA, PETG, cast resins)
- Worksheet with step-by-step instructions + comparison table template

**Software access:** COMSOL via HUIT VDI. Students should have VDI access set up before this lab.

**Additional COMSOL labs for assignments (not in the lab schedule, but provided as simulation files):**
- Contact stress simulation: cylinder on flat substrate (for Assignment 3, hardness/contact topic)
- Thermal distortion simulation: bimetallic strip (for Assignment 4, thermal/processing topic)
- Fiber-in-matrix simulation: load transfer in a fiber composite (for Assignment 5, composites topic)

These pre-built .mph files should be available in the Canvas Files section. Students run them as part of homework assignments, not during lab time.

---

## Mini-Project Grading Rubric (10% of course grade)

| Criterion | Weight |
|-----------|--------|
| Materials selection rationale (Ashby charts, indices, Design Requirements Tables) | 30% |
| Design quality and manufacturing execution | 25% |
| Test results and performance index | 20% |
| Report clarity, predicted-vs-actual analysis, and reflection | 25% |

---

## Phase 2: Group Project (Weeks 7–13)

### Overview

After the mini-project and COMSOL lab, students form teams of 3 (some teams of 4 based on enrollment) and choose an open-ended design project that demonstrates materials selection in a mechanical design context. Students will use the manufacturing methods, simulation skills, and selection methodology from the mini-project.

### Project Requirements

1. **A clearly defined mechanical design problem** with Function, Constraints, Objectives, and Free Variables.
2. **A formal materials selection analysis** using Ashby methodology and the course materials database (materials indices, property charts, screening, ranking).
3. **COMSOL simulation** of at least one structural/thermal/mechanical aspect of the design.
4. **Fabrication of a physical prototype** using ALL facilities with at least two manufacturing processes.
5. **Quantitative testing** of at least one performance metric.
6. **A final oral presentation** (12–15 minutes) to the class.
7. **A written report** (10–15 pages) due one week after the last class.

### Timeline

| Week | Lab Activity |
|------|-------------|
| 7 | Team formation. Brainstorming in lab. Initial ideas discussed with CAs and instructor. |
| 8 | **Project proposals due** (1–2 pages). Instructor feedback. Begin design. |
| 9 | Design iteration + COMSOL modeling. Begin fabrication. **Progress check-in with instructor.** |
| 10 | Fabrication + iterative testing. |
| 11 | Continued fabrication and testing. |
| 12 | Final fabrication, testing, and data collection. |
| 13 | **Group project presentations** in lab. Written reports due the following week. |

### Example Project Ideas

Students are encouraged to propose their own. These are starting points:

- **Composite sandwich panel** — design a multi-layer composite beam/panel using laser-cut face sheets, 3D-printed core (honeycomb/lattice), and cast resin matrix. Predict properties with rule of mixtures and COMSOL; 3-point bend test. *(This is the composite layup concept — now perfectly timed with Ch 13 coverage in Week 8.)*
- **Lightweight bicycle component** — optimize a handlebar, pedal, or bracket for stiffness-to-weight using shape factors and hybrid materials.
- **Thermal management enclosure** — passive cooling for electronics; select materials for thermal conductivity, expansion matching, and structural support.
- **Energy-absorbing helmet liner** — compare foam, lattice, and cast elastomeric structures for impact absorption per unit mass.
- **Composite longboard deck** — fiber-reinforced layup optimizing flex, strength, and weight; validate with COMSOL and 3-point bend test.
- **Sustainable packaging redesign** — replace a plastic package with lower-impact materials, supported by eco-audit analysis.
- **Prosthetic socket or assistive device** — balance biocompatibility, weight, stiffness, and cost.
- **Custom lab tool or fixture for the ALL** — design something the lab actually needs, with formal selection methodology.

### Group Project Grading Rubric (30% of course grade)

| Criterion | Weight |
|-----------|--------|
| Materials selection analysis (Ashby methodology, materials database, indices) | 25% |
| COMSOL simulation and analysis | 15% |
| Design quality, creativity, and engineering judgment | 20% |
| Prototype fabrication and process justification | 15% |
| Testing and results (rigor, data quality, comparison to predictions) | 10% |
| Report and presentation (clarity, professionalism, completeness) | 15% |

---

## Equipment and Materials

The ALL provides standard stock for both projects:
- **Laser cutting:** birch plywood (3 mm), acrylic/PMMA (3 mm), MDF (3 mm), aluminum sheet (1.5 mm)
- **3D printing:** PLA, PETG, TPU filament
- **Casting:** two-part silicone rubber (mold-making), rigid polyurethane casting resin, flexible polyurethane resin, epoxy resin; mold release spray; mixing cups and stir sticks; optional fillers (chopped glass fiber, mineral filler)
- **Fasteners and joining:** assorted bolts/nuts/washers, cyanoacrylate, two-part epoxy adhesive, hot glue
- **Measurement:** digital calipers, digital scales, dial indicators with magnetic stands, rulers
- **Testing:** test fixture (25 mm plate + table clamp), calibrated weight set (100g–5kg)

For group projects, specialized materials may be purchased within a per-team budget of [$ TBD]. Purchases require instructor or lab director approval.

---

## Pre-Semester Action Items

| Task | Owner | Target Date |
|------|-------|-------------|
| Finalize cantilever mini-project specifications and test fixture design | Seymur | End of March 2026 |
| Test-run mini-project (full 5-week sequence); write lab handouts and CA instructions | Nora | End of May 2026 |
| Build or procure cantilever test fixture (25 mm plate, table clamp, dial indicator mount) | Nora + ALL staff | End of May 2026 |
| Prepare 2–3 backup silicone molds from test-run mold patterns | Nora | End of May 2026 |
| Coordinate with COMSOL team: provide cantilever template file specs and material data | Seymur | End of April 2026 |
| COMSOL team: build cantilever template .mph file + contact/thermal/fiber simulation files | COMSOL team | End of May 2026 |
| Add lab section times to my.harvard | Seymur | ASAP |
| Recruit and train lab CAs from ES 51 | Seymur + Nora | August 2026 |
| Procure silicone, resin, chopped fiber filler, and casting supplies | Nora + ALL staff | August 2026 |
| Prepare constituent material data sheets for students (E, σ_f, ρ for all stock) | Seymur | Before Week 1 |
| Prepare materials selection software and COMSOL VDI access instructions | Seymur | Before Week 1 |
| Investigate injection molder availability (nice to have) | Nora + Mech Techs | Ongoing |
| Investigate thermoformer availability (nice to have) | Nora | Ongoing |
