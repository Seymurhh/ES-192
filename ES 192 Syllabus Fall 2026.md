# ES 192: Materials Selection in Mechanical Design

**Harvard John A. Paulson School of Engineering and Applied Sciences**
**Fall 2026**

---

**Instructor:** Seymur Hasanov (shasanov@seas.harvard.edu)
**Lectures:** Two per week — [Days/Times TBD]
**Lab Sections:**

| Section | Day | Time |
|---------|-----|------|
| A | Tuesday | 2:15 – 4:15 PM |
| B | Wednesday | 9:45 – 11:45 AM |
| C | Friday | 9:45 – 11:45 AM |
| D | [TBD] | [TBD] |

**Lab Location:** Active Learning Laboratories (ALL), SEC Lower Level
**Lab Director:** Nora Cullen, Director for Active Learning, Mechanical Engineering (ncullen@g.harvard.edu, SEC LL1.243)
**Lab Course Assistants:** [TBD — recruiting from ES 51 CAs]
**Office Hours:** [TBD]

---

## Course Description

How does an engineer select a material for a particular component or application? This course provides a systematic, rational methodology for answering that question, with a specific focus on **material selection in mechanical design**.

At one time, answering this question was straightforward — there were few materials to choose from, limited availability of shapes, and mechanical design capabilities were less sophisticated than they are today. But this is no longer a simple question. There are now thousands of materials to choose from, new materials are constantly being discovered, the properties of existing materials are being improved, ever more sophisticated engineering systems are being devised, and new materials manufacturing processes — including additive manufacturing — are being developed. At the same time, additional constraints such as element scarcity, the drive to decrease environmental cost, and sustainability requirements are being imposed on the designer, influencing materials selection.

The course describes how each of these developments influences the choices facing a mechanical designer today through a combination of lectures, readings, case studies, materials database and selection tools, and a **hands-on project-based laboratory component**. Students will gain practical experience with manufacturing processes including laser cutting, 3D printing, and metal casting through a structured mini-project, followed by an open-ended team design project.

## Pedagogical Approach

The class consists of:

- **Lectures** (twice weekly): Short, focused presentations introducing theory, methodology, and case studies.
- **Lab sections** (weekly, double-block): Hands-on manufacturing and project work in the Active Learning Laboratories.
- **Problem sets**: Written assignments emphasizing narrative analysis and use of materials selection software.
- **Case studies and readings**: Selected examples drawn from the textbook and supplementary sources.
- **Team projects**: A structured mini-project (Weeks 1–5) followed by a semester-long group design project (Weeks 7–13).

A course-specific materials selection tool will be provided for generating Ashby property charts, screening candidate materials, and exploring material property data. Use of this tool is required for several problem sets and both projects.

## Course Objectives

After completing the course, students should be able to:

1. **Translate design requirements** for a mechanical component into materials selection criteria in terms of function, constraints, objectives, and free variables.
2. **Screen candidate materials** using Ashby property charts and materials indices derived from the mechanics of the component's function.
3. **Apply the Ashby selection methodology** to problems involving multiple constraints and conflicting objectives, using trade-off methods and penalty functions.
4. **Evaluate the role of shape** in materials selection, including shape factors and their interaction with materials indices.
5. **Select manufacturing processes** appropriate to the chosen material, component geometry, and production volume, and understand how processing affects material properties.
6. **Design with hybrid materials** — composites, foams, sandwiches, and lattice structures — using rules of mixing and bounds methods.
7. **Assess environmental impact** through life-cycle assessment, embodied energy analysis, and eco-selection methods.
8. **Apply hands-on manufacturing skills** (laser cutting, 3D printing, metal casting) to realize material and process selections in physical prototypes.
9. **Communicate materials selection decisions** through clear written reports and oral presentations.

## Textbook

**"Materials Selection in Mechanical Design"**, Sixth Edition
Michael F. Ashby, Butterworth-Heinemann / Elsevier, 2025.
ISBN: 978-0-443-16028-8

Winner of a Textbook Excellence Award (Texty). This is the definitive textbook on the subject, featuring full-color Ashby materials selection charts, worked examples, case studies, and exercises. The sixth edition includes expanded coverage of additive manufacturing, biomedical manufacturing, digital manufacturing, and sustainability. It complements the materials selection tools used throughout the course.

## Software and Tools

**Materials Selection Software** — A course-specific materials database and selection tool will be provided for generating Ashby property charts, screening candidate materials, and exploring material property data. Access details will be shared at the start of the semester.

**COMSOL Multiphysics** (optional) — Available through HUIT VDI for students who wish to perform stress/displacement simulations. Not required, but useful for project work.

## Grading

| Component | Weight | Description |
|-----------|--------|-------------|
| Problem Sets | 25% | 5–6 assignments; narrative reports + materials database exercises |
| Mini-Project | 10% | Weeks 1–5 lab project; team deliverable |
| Midterm Exam | 15% | Take-home, open-book exam (Week 8); covers Chapters 1–14 |
| Group Project | 30% | Weeks 7–13; proposal, progress reports, final presentation, written report |
| Participation | 10% | Engagement in lectures, case study discussions, and lab |
| Final Presentation | 10% | End-of-semester project presentation to the class |

There is no final exam. The midterm is a take-home, open-book exam (designed for ~90 minutes, with a 24-hour window). It assesses individual understanding of the core methodology covered in Chapters 1–14.

Late policy: Assignments are due as posted on Canvas. Late submissions will be accepted with a penalty of [TBD]% per day unless prior arrangements are made with the instructor.

## Relation to Other Courses

The course complements other courses in Mechanical Engineering but has **no prerequisites**. Relevant connections include:

- **ES 51** (Engineering Design & Rapid Prototyping): Practical experience with machine tools and mechanical principles.
- **ES 120** (Solid Mechanics): Elasticity equations used in deriving materials indices.
- **ES 183** (Fundamentals of Heat Transfer): Thermal engineering concepts relevant to thermal materials selection.
- **ES 125** (Mechanical Systems): Actuation and energy absorption concepts.

ES 192 is an elective within both the Mechanical Systems and Thermal tracks of the S.B. in Mechanical Engineering, and is open to Bioengineering, ESE, A.B. students, and any interested Harvard student regardless of degree program. Full degree requirements: https://handbook.fas.harvard.edu/book/mechanical-engineering

---

## Weekly Schedule

Two lectures per week + one lab section per student. Readings refer to the textbook (Ashby, 6th Ed.) unless noted.

### Part 1 — Materials and Process Selection: The Basics

#### Week 1: Introduction to Materials and Design
**Lectures:** Why materials selection matters. The design process. Families of engineering materials. Material properties and their units. Introduction to materials selection software.
**Readings:** Chapters 1 and 2
**Lab:** ALL orientation + safety training (30 min). Equipment tour. **Mini-project launch: the Hybrid Cantilever Challenge** — teams of 3 design a multi-material cantilever maximizing load/mass. Functional decomposition, Design Requirements Tables, Ashby plots with material index overlay.

#### Week 2: Materials Property Charts and the Selection Strategy
**Lectures:** Ashby property charts — reading and interpreting log-log plots. The selection strategy: translation (function, constraints, objectives, free variables). Deriving materials indices. Attribute limits. Computer-aided selection.
**Readings:** Chapters 3 and 4
**Lab:** Laser cutter training (20 min). Cut structural components + test coupons from 2+ sheet materials. 3-point bend test on coupons to measure flexural modulus; compare to database values.
**Assignment 1 due**

#### Week 3: Materials Selection — Case Studies
**Lectures:** Applying the methodology. Selected case studies: materials for oars, telescope mirrors, flywheels, springs, safe pressure vessels, heat sinks, thermal insulation.
**Readings:** Chapter 5 (selected sections)
**Lab:** FDM printing training (20 min). Print functional components (connectors, brackets) + mold pattern for casting. Print orientation experiment: two beams, flat vs. on-edge — bend test to demonstrate anisotropy.

#### Week 4: Processes and Their Effect on Properties
**Lectures:** Classifying manufacturing processes: shaping, joining, finishing. How processing changes microstructure and properties. Process-property trajectories.
**Readings:** Chapter 6
**Lab:** Silicone mold-making from 3D-printed patterns; resin casting (rigid PU, flexible PU, epoxy, fiber-filled options). Begin assembly of non-cast components.
**Assignment 2 due**

#### Week 5: Process Selection, Cost Modeling, and Additive Manufacturing
**Lectures:** Systematic process selection using matrices. Process limits and quality. Cost modeling. Additive manufacturing processes, materials, properties, and design for AM.
**Readings:** Chapters 7 and 8
**Lab:** Final assembly, load testing (clamp, load incrementally, record deflection), calculate P = F_max / m, class leaderboard. Compare Ashby predictions to actual results. Mini-project report assigned (due in 1 week).

### Part 2 — Advanced Selection Methods

#### Week 6: Multiple Constraints and Conflicting Objectives
**Lectures:** Selection with multiple constraints — the active constraint method. Conflicting objectives — trade-off surfaces, penalty functions, weight factors. Case studies: light pressure vessels, con-rods, cost-effective bumpers.
**Readings:** Chapters 9 and 10
**Lab:** **COMSOL Simulation Lab** (run by COMSOL instruction team). Students model their mini-project cantilever in COMSOL, compare simulated deflection to Week 5 experimental data, and run a parametric study.
**Assignment 3 due**

#### Week 7: Selection of Material and Shape
**Lectures:** Shape factors for elastic bending, failure, and buckling. Limits to shape efficiency. Material-shape combinations. Material indices that include shape. Graphical co-selection.
**Readings:** Chapters 11 and 12
**Lab:** **Group project launch.** Team formation (groups of 3). Brainstorming session. Discuss project topics with CAs and instructor. Begin developing proposals.

#### Week 8: Designing Hybrid Materials + Midterm Exam
**Lectures:** Filling holes in material-property space. Composites: rule of mixtures, bounds, and case studies. Cellular structures: foams and lattices — fabrication, scaling laws, bending vs. stretching dominated behavior. Sandwich structures.
**Readings:** Chapters 13 and 14
**Lab:** Group project work. **Project proposals due** (1–2 pages). Instructor feedback. Design iteration and begin fabrication.
**Assignment 4 due**
**Midterm Exam:** Take-home, open-book. Distributed end of Week 8; 24-hour window (designed for ~90 min). Covers Chapters 1–14: selection methodology, Ashby charts, materials indices, processes, AM, multiple constraints, shape factors, and hybrid materials. Textbook and notes permitted; no internet. Individual work.

### Supplementary Topics in Mechanical Design

#### Week 9: Mechanical Response, Contact Mechanics, and Wear
**Lectures:** Elastic, plastic, and viscoelastic response of materials. Energy dissipation and damping. Contact stresses, hardness, and wear resistance. Case studies: DLC coatings, hip implants, bearing materials.
**Readings:** Supplementary notes + selected sections from Chapters 2 and 5
**Lab:** Group project work. Progress check-in with instructor.

#### Week 10: Thermal Design in Materials Selection
**Lectures:** Thermal conductivity, diffusivity, and expansion. Thermal expansion mismatch strains and stresses. Thermal shock resistance. Case studies: thermal barrier coatings, telescope mirrors, thermal energy storage, heat exchangers.
**Readings:** Supplementary notes + Chapter 5 (Sections 5.13–5.18)
**Lab:** Group project work.
**Assignment 5 due**

#### Week 11: Architectured Materials and Additive Manufacturing for Design
**Lectures:** Periodic structures at different length scales. Microscopic shape. Additive manufacturing of lattice and architectured materials. Design for multifunctionality. Case studies: lightweight panels, energy absorbers.
**Readings:** Chapter 11 (Section 11.7) + Chapter 8 (Section 8.6) + supplementary notes
**Lab:** Group project work.

### Part 3 — The Wider Context

#### Week 12: Materials, Environment, and Sustainability
**Lectures:** The material life cycle. Environmental life-cycle assessment. Eco-attributes: embodied energy, CO2 footprint, water usage. Eco-audits. Eco-selection. Sustainable development: three capitals framework. Resource scarcity and substitution. Case studies: drink containers, crash barriers, LCSA.
**Readings:** Chapters 15 and 16
**Lab:** Group project — Final fabrication and testing.
**Assignment 6 due**

#### Week 13: The Big Picture and Project Presentations
**Lectures:** The wider context — materials and big issues: energy, transportation, housing, electronics, health. Course synthesis. (One lecture + presentations.)
**Readings:** Chapter 17
**Lab:** Group project presentations.
**Final written project reports due [one week after last class]**

---

## Project Overview

### Mini-Project (Weeks 1–5): The Hybrid Cantilever Challenge

Working in teams of 3, students design, fabricate, and test a multi-material cantilever beam that must support the maximum load at a fixed overhang while minimizing weight. Each component uses a different manufacturing process (laser cutting, 3D printing, silicone mold casting), and every material and process choice must be justified using the Ashby methodology. Students compare their Week 1 Ashby-based predictions to actual test results, learning firsthand where models succeed and where real-world factors (joints, defects, boundary conditions) create discrepancies. See the separate Lab Structure document for details.

### Group Project (Weeks 7–13)

Teams of 3 select, design, build, and test a project of their own choosing that demonstrates materials selection principles in a mechanical design context. Projects must include:

- A formal materials selection analysis using the Ashby methodology
- Fabrication of a physical prototype using ALL facilities
- Quantitative testing of a key performance metric
- A final presentation to the class and a written report

Project proposals are due in Week 8. The instructor will meet with each team regularly to provide guidance. The ALL staff and lab CAs will be available during lab sections for manufacturing support.

---

## Academic Integrity

Students are expected to adhere to the Harvard Honor Code. Collaboration on problem sets is encouraged, but each student must write their own report independently. Project deliverables are team submissions. Proper citation is required for all external sources, data, and figures.

## Accessibility

Students needing accommodations should contact the Accessible Education Office (AEO) and inform the instructor as early as possible so appropriate arrangements can be made.

---

*This syllabus is subject to change. Updates will be communicated through Canvas.*
