
# Workflow: Verify & Update Venue Layouts

This workflow verifies the availability and correctness of the new venue layouts implementation.

## 1. Verified Implementation of Layouts

The following SVG components have been implemented in `frontend/src/components/ui/venue-svgs.jsx`:

### Stadium Types
*   **CricketOvalSvg**: Standard oval field for Cricket, Football (fallback), Athletics. Includes specific stands (A-H / North-South-East-West).
*   **KabaddiIndoorSvg**: Indoor court layout for Kabaddi, Basketball, Badminton. Includes 'Mat', 'Courtside', 'Lower Bowl', 'VIP Lounge'.

### Concert Types
*   **ConcertEndStageSvg**: Classic arena setup with Stage at one end.
*   **ConcertCenterStageSvg**: 360-degree stage setup for central performances.
*   **ConcertFestivalSvg**: Large outdoor field setup with multiple stages and camping zones.

### Theatre Types
*   **TheatreStandardSvg**: Regular cinema/theatre seating with Balcony.
*   **TheatreImaxSvg**: Curved screen layout with steep stadium seating.
*   **TheatreDriveInSvg**: Grid layout for cars/parking spots.

## 2. Configuration Mapping

The `VenueVisuals` component has been updated to route 30+ subtype definitions (from `venue-config.js`) to these specific SVG visualizations.

Example Mappings:
*   `IMAX`, `Large Format` -> `TheatreImaxSvg`
*   `Festival`, `Open Field` -> `ConcertFestivalSvg`
*   `Indoor Arena`, `Pro League` -> `KabaddiIndoorSvg`

## 3. Next Steps
*   **User Action**: Run the application (`npm run dev`) and test the new layouts by creating events with different configurations in the Admin Dashboard.
*   **Visual Validation**: Ensure the zones in the Admin Dashboard highlight correctly and match the configured zone IDs.
