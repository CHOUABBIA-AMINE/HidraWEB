# HyFlo network workspace preview

HWEB-F19 demonstrates read-only network navigation inside HidraWEB using
fictional geometry and versioned synthetic evidence. The demo roles model view
filtering over bundled fixtures. HidraWEB sign-in and the current topology map
read permission govern entry to the view.

## Open from HidraWEB

1. Sign in through the normal HidraWEB entry using an account with
   `topology:map:read`.
2. Open **Network** in the application navigation.
3. Select **Open synthetic preview**. This opens `/network?view=preview`
   in the existing application shell.
4. Use **Return to operational map** to return to the existing topology reader.

The switch, workspace, evidence labels and map controls follow the selected app
language in French, English or Arabic. Arabic uses right-to-left layout.
Changing language preserves the selected fixture context. The ordinary HidraWEB
build includes this view and its basemap.

## Geographic basemap

The regional basemap uses public-domain Natural Earth 1:50m Admin 0 countries
from version 5.1.2. The [upstream GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_50m_admin_0_countries.geojson)
was simplified at 0.0125 degrees, clipped to longitude −5° to 13° and latitude
29° to 40°, rounded to four decimal places and stripped of feature attributes.
The repository serves the resulting land and border geometry locally.
See the [Natural Earth terms of use](https://www.naturalearthdata.com/about/terms-of-use/).

The gas corridors, station coordinates and measurements are synthetic.
The regional map is intended for the demonstration walkthrough.

## Client walkthrough

1. Start as the scoped operator in GZ2 Reference. Select another station, then
   return to Atlas Compression via the map, tree and linked alarm. Confirm that
   the fixture asset, UTC window, technical revision, pressure and alarm match.
2. Switch to the later UTC window. Atlas pressure shows stale evidence and its
   alarm source is unavailable. West Intake has an empty alarm record for this
   window. Switch to Orion Gas Link and verify the prior station clears before
   selecting Cedar Entry.
3. Try both in-scope roles and then the two denied demo roles. Compare what the
   tree, map, system choices and evidence disclose. Return to an allowed role
   and verify the cleared selection. Reset to restore the initial fixture.
4. Repeat station selection with the keyboard at a narrow viewport. Collapse
   the application navigation if needed.

The standard Code CI includes the Network browser suite. Record the reviewed
WEB SHA, fixture version, review date, reviewer, observations and findings.
Client walkthrough acceptance is separate from passing the browser suite.

## F20 station investigation walkthrough

1. Select Atlas Compression on the map during the morning UTC window and open
   **Open investigation**. Close it, select a different station, then open the
   linked low-pressure alarm. Confirm both paths show the same station, UTC
   window, alarm and technical revision.
2. Review the fixture evidence before each simulated action. Record an alarm
   acknowledgement and a separate follow-up. Confirm the condition stays active
   after both. Advance the fixture to resolution to see the distinct scenario
   event.
3. Close and reopen the investigation. Confirm the timeline shows its simulated
   actor and time and the original fixture revision and observation reference.
4. Review the morning evidence and switch to the afternoon window before acting.
   The stale review and degraded evidence leave the timeline unchanged. Verify
   the observer can read the permitted history and the two out-of-scope roles
   cannot see it.
5. Try the keyboard at a narrow width and switch among French, Arabic and English.
   Reset the preview to clear the in-memory history.

F20 uses the existing `network-fixture-v2` evidence with
`station-investigation-v1` for the simulated timeline. The walkthrough qualifies
the preview only. Additional operational parameters and native follow-up
integration require accepted HidraAPI contracts.

## F21 digital-twin decision walkthrough

1. In the GZ2 morning fixture, open the Atlas Compression investigation and select
   **Open digital-twin decision**. Check the input manifest, technical revision,
   alarm reference, and observation time and units.
2. As the demo operator, load the precomputed comparison. Compare the fixture
   observation, baseline and alternative. Try the missing and incompatible input
   options and verify that they block the comparison.
3. Switch to the demo engineer and propose the alternative. Switch to the
   independent demo reviewer, review the proposal and record an approve,
   reject or return decision with a rationale.
4. Close and reopen the preview to review the linked manifest, run, actor, time
   and rationale. Approval leaves the unavailable follow-up outcome unresolved.
   Change the UTC window after reviewing a proposal to exercise stale review.
5. Verify that the read-only observer sees only the permitted context, and that
   both out-of-scope roles lose access. Reset the preview to clear the in-memory
   history.

F21 uses `digital-twin-decision-v1` with `network-fixture-v2` observations.
The pressure outputs are authored comparison fixtures. The preview performs
no engine execution and records decisions solely within the walkthrough.

## F21 expanded walkthrough — six simulated interfaces

The six-interface addition extends the single F21 task. It is not a suffixed new implementation task. Synthetic fixture version: six-interface-preview-v1.

1. Open the signed-in synthetic network preview and inspect the six tabs below the original map/evidence: Geographic / Spatial, Hydraulic & Elevation, Logical Schematic / P&ID, Telemetry & Analytics, Asset Integrity, 2D Station.
2. Geographic: toggle fictitious HCA/water layers, inspect the coordinates caveat and select West Intake or Atlas. These coordinates are station proxies, not exact anomaly GPS.
3. Hydraulic: inspect authored chainage/elevation and illustrative flow with available fixture pressure; explicitly verify there is no actual steady/transient solver, mass balance or slack-line assessment.
4. P&ID: inspect the grayscale scheme and orange demo alarm. Try station selection; no valve/SCADA command is offered.
5. Telemetry: view Atlas morning pressure sample order, then afternoon stale exclusion. Select West Intake and overlay the other time window by click or drag/drop; the comparison must use a shared pressure scale. Individual sample timestamps and high-frequency live readings are not supplied.
6. Integrity: inspect fictional L485 steel, wall-thickness and weld records, and missing qualified ILI. Station: inspect local SVG inlet, equipment train, bypass and outlet for the selected station and revision.
7. Switch to Orion and an unselected station. Exercise otherScope and otherCompany: the entire six-view panel must disappear. Change English, French and Arabic RTL; use arrow/home/end keys, test a 360px viewport and Reset preview.
8. Reopen the original station investigation and F21 independent decision walkthrough; original synthetic comparison and history must still work. Verify no new business HTTP requests, no OT actuation and no persistent local browser data.

F21 requires explicit owner walkthrough acceptance after the source/CI evidence; F16 HOLD and F22 prerequisites remain unchanged.

## F21 corrective walkthrough — conventional schematic symbols and altimetry (fixture v2)

This addendum applies to synthetic version six-interface-preview-v2. It supersedes only the older fixture-version reference; the earlier six-view and decision walkthroughs remain valid.

1. Geographic: ST station nodes are now square enclosure markers with a small valve-shaped glyph and a readable tag instead of plain circles. These are not exact surveyed positions.
2. Schematic / P&ID: inspect dashed ST boundaries, XV gate valves drawn as paired triangles with stems, the K compressor symbol, and FT instrument bubbles with identifiers; check the legend, grayscale normal state and highlighting of fictional alarm evidence. No equipment-control buttons exist.
3. 2D Station: inspect the station boundary, two header XV valves, one bypass XV, and a K or FT symbol corresponding to the fictional station kind. Switch permitted stations to verify the changed equipment type and the same revision context.
4. Hydraulic & Elevation: GZ2 displays 14 independent fictional chainage/elevation samples, including 11 non-station points between three facilities. PK 76 km has elevation 370 m and is not a station; PK 85 km is Atlas Compression at 340 m. The profile table identifies terrain-only rows and does not attach invented pressure or mass flow to them. The pressure strip below contains observed synthetic station readings only, in bar(g). No claimed interpolation, terrain survey, pipe elevation, mass balance or solver.
5. Orion has eight terrain samples and two stations. Verify stale/unavailable readings stay unplotted and demo role changes hide all out-of-scope values.
6. Check EN, FR and Arabic RTL legend/caveats, narrow-screen and keyboard access, reset, and the earlier F21 independent decision history.

Symbol families for future approved catalogs: ISO 10628-2:2012 (https://www.iso.org/standard/51841.html) and ANSI/ISA-5.1-2024 (https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5-1). Demo symbols are conventional approximations and not certified. F21 owner acceptance remains pending; HWEB-F16 HOLD and HWEB-F22 blocked.
