---
name: heph
description: Design real, buildable machines with HEPH-3D, a free desktop app on this computer. Turns a description into printable parts, real electronics at their true hole patterns, wiring, a priced parts list and a QC report, shown in 3D. Use when the user wants to design, model, prototype or 3D-print an object, mechanism, robot, enclosure, bracket or gear train; asks for STL, STEP or 3MF files; or names HEPH or HEPH-3D.
---

# HEPH-3D

HEPH-3D runs on the user's own computer. These tools drive it; nothing is
sent anywhere else.

1. Call `heph_open` when the user wants to see or work on a machine. It opens
   HEPH-3D if it is not running and shows the machine in 3D.
2. Before writing a design, call `heph_guide` once. It explains the
   `build()` function, the parts catalogue, mechanisms, wiring and the checks
   a design has to pass. Ask it for a topic when you need more detail.
3. Start with `heph_new_project`, then write the whole design with
   `heph_write_design`. Writing rebuilds and validates it; fix every error it
   reports and write again until the build is clean.
4. Use `heph_catalog` for real dimensions and prices of bought parts, and
   `heph_state`, `heph_parts` and `heph_notes` to see what the user sees and
   any notes they left on the model.
5. When the build is clean and the user is happy, `heph_ship` exports the
   files to print and the parts list to buy.

If the only tool available is `heph_setup`, HEPH-3D is not installed yet:
call it and pass on what it says.
