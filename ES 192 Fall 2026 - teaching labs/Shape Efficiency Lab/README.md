# Shape Efficiency Lab

Week 8 (Material and Shape: buckling and architectured materials). One page, five experiments.
Each experiment links what the part does (the 3D rig), why (the governing equations and live charts) and what the material does inside (a microscope view of the grains and atoms).

**To open it:** download `index.html` and double-click it. It works offline; three.js r128 (MIT licence) is built into the file.

## The five rigs

| Tab | Application | Question | Inside the material |
|---|---|---|---|
| 1 Columns | S355 steel props: 60.3 × 2.9 mm tube vs a 25.8 mm solid bar of the same mass, pinned ends | Which one buckles first? | Elastic bond squeeze; buckling with no slip; first yield at mid-height (dislocations break free of carbon, {110} slip in ferrite); plastic hinge and pile-ups at grain boundaries |
| 2 Thin walls | Aluminium 6061-T6 tube, clamped, 150 mm² of metal at every size | Is a thinner wall always better? | Thick wall: {111} slip held back by Mg–Si (β″) precipitates, then a plastic hinge. Thin wall: the wall kinks, slip crowds into the crease, voids at iron-rich particles link into a crack |
| 3 Cells | One cell-wall solid as a solid bar, as wood-like aligned cells, or as a foam (equal mass) | Stiffer? Stronger? | Wood: a kink band on the squeezed face (cellulose H-bonds break and re-form), then splinters on the stretched face. Foam: walls bend, hinge at the joints, cells collapse |
| 4 Lattices | 3D-printed Ti-6Al-4V: octet truss vs open (body-centred) lattice, same density | Why is one far stiffer? | α′ martensite needles, half-melted powder and pores; octet struts snap in a 45° band, open-lattice joints hinge and layers collapse |
| 5 Corrugation | Galvanized S280GD sheet 2 mm, flat vs corrugated (roofing, container walls) | How much does a wave help? | Yield starts at the surfaces, a fold line forms, the zinc coating cracks across the fold |

## In class

- **Keys:** `1`–`5` switch rigs · `Space` plays the load · `S` strain colours · `L` labels · `N` new specimen · `R` reset view · `P` presenter mode.
- **Damage is permanent.** Once a part yields, lowering the load leaves it bent (and the slip steps stay in the atom view). Press **New specimen** to start again.
- **Charts:** *Test curve* is the load–deflection (or stress–strain) curve with the current point; *Design chart* is the selection view (capacity vs length, capacity vs r/t, Ashby E–ρ chart, shape factor vs wave height). **Enlarge** puts the chart over the rig for projection.
- **Sources** (top bar) lists every equation with its Ashby 6e equation number and page, the material data, and which parts are teaching models.

## Models and honesty notes

- Equations: Ashby, *Materials Selection in Mechanical Design*, 6th ed. — Eqs 11.3, 11.14, 11.15a, 11.38, 12.8–12.9, 13.3, 13.18, 13.20, 13.27–13.29.
- Columns start with a bow of L/1000; first yield is where axial plus bending stress reaches σ<sub>y</sub>.
- The thin-wall kink stress (0.145 E t/r) is a teaching model, set so yield and kinking meet at Ashby's φ<sub>max</sub> ≈ 2.3(E/σ<sub>f</sub>)<sup>½</sup>.
- The grain and atom views are drawings of the mechanisms with exaggerated strain, not simulations. Atom views show one slip plane side-on; the real plane sits at about 45° to the load.

## Editing

The source is in `src/`: `es192-8a-shape-demos.src.html` (markup and styles) and `js/*.js` (joined in name order).
Rebuild from inside `src/` with `python3 -I build-demos.py --copy-to ..`, which writes `src/site/index.html` and copies it over `index.html`. Browser checks: `cd tests && npm install && npm test` (needs Google Chrome).
