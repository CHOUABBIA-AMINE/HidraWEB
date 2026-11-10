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
