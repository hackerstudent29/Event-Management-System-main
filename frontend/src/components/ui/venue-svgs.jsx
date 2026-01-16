import React from 'react';
import { cn } from '@/lib/utils';
import { EVENT_TYPES } from '@/lib/venue-config';
import {
    ThrustStageSvg, ClubStandingSvg, ConcertEndStageSvg, ConcertCenterStageSvg, ConcertOutdoorMainStageSvg,
    ConcertIndoorStadiumEndStageSvg, ConcertIndoorStadiumCenterStageSvg,
    MotorsportTrackSvg,
    FootballClassicGroundSvg, FootballModernArenaSvg, FootballRectangleSvg,
    CricketModernBowlSvg, CricketPavilionSvg, CricketOvalSvg,
    BasketballCollegeSvg, BasketballCourtSvg, BasketballModernStadiumSvg,
    FieldHockeySvg,
    TennisModernStadiumSvg, TennisCourtSvg,
    FieldHockeyModernStadiumSvg, IceHockeySvg,
    KabaddiTraditionalSvg, KabaddiProLeagueSvg, KabaddiIndoorSvg,
    ImaxLargeFormatSvg, ImaxLaserSvg, ImaxDigitalSvg,
    StandardCinemaSingleScreenSvg,
    DolbyAtmosSvg,
    FourDXStandardSvg, FourDXMotionSeatsSvg,
    ScreenXStandardSvg, ScreenXSideWallSvg,
    DriveInCarGridSvg, DriveInArenaParkingSvg,
    PremiumLoungeLuxuryReclinersSvg, PremiumLoungeVipPodsSvg,
    OutdoorCinemaOpenAirSvg
} from './venue-svgs-extended';

// Import detailed stadium SVGs with proper zone divisions
// Import detailed stadium SVGs with proper zone divisions
import {
    FootballStadiumSvg,
    CricketStadiumSvg,
    KabaddiStadiumSvg,
    BasketballStadiumSvg,
    TennisStadiumSvg,
    HockeyStadiumSvg,
    AthleticsStadiumSvg
} from './stadium-svgs-detailed';

// primatives are still needed for some local wrappers if any
import { SvgWrapper, Zone } from './venue-primitives';

export const VenueVisuals = React.memo(({ type, subType, variant, labels = {}, zoneMap = {}, activeZones = [], onZoneSelect, onZoneHover, adminMode = false, rowAssignments = [], onSeatClick, selectedSeats = [], occupiedSeats = [], zoneConfigs = {} }) => {
    const commonProps = {
        onZoneClick: onZoneSelect,
        onZoneHover,
        onSeatClick,
        selectedSeats,
        occupiedSeats, // Add to commonProps
        labels,
        zoneMap,
        activeZones,
        adminMode,
        variant,
        rowAssignments
    };

    switch (type) {
        case EVENT_TYPES.THEATRE:
            // 1. IMAX
            if (['Large Format IMAX', 'Laser IMAX', 'Digital IMAX', 'IMAX'].includes(variant)) {
                if (variant === 'Laser IMAX') return <ImaxLaserSvg {...commonProps} />;
                if (variant === 'Digital IMAX') return <ImaxDigitalSvg {...commonProps} />;
                return <ImaxLargeFormatSvg {...commonProps} />;
            }
            // 2. STANDARD CINEMA
            if (['Single Screen', 'Standard Cinema', 'Multiplex'].includes(variant)) {
                return <StandardCinemaSingleScreenSvg {...commonProps} />;
            }
            // 3. DOLBY ATMOS
            if (['Dolby Atmos'].includes(variant)) {
                return <DolbyAtmosSvg {...commonProps} />;
            }
            // 4. 4DX
            if (['4DX Standard', '4DX'].includes(variant)) {
                return <FourDXStandardSvg {...commonProps} />;
            }
            if (['Motion Seats'].includes(variant)) {
                return <FourDXMotionSeatsSvg {...commonProps} />;
            }
            // 5. SCREENX
            if (['Standard ScreenX', 'ScreenX'].includes(variant)) {
                return <ScreenXStandardSvg {...commonProps} />;
            }
            if (['Side-Wall Immersion'].includes(variant)) {
                return <ScreenXSideWallSvg {...commonProps} />;
            }
            // 6. DRIVE-IN
            if (['Car Grid'].includes(variant)) {
                return <DriveInCarGridSvg {...commonProps} />;
            }
            if (['Arena Parking'].includes(variant)) {
                return <DriveInArenaParkingSvg {...commonProps} />;
            }
            // 7. PREMIUM LOUNGE
            if (['Luxury Recliners'].includes(variant)) {
                return <PremiumLoungeLuxuryReclinersSvg {...commonProps} />;
            }
            if (['VIP Pods'].includes(variant)) {
                return <PremiumLoungeVipPodsSvg {...commonProps} />;
            }
            // 8. OUTDOOR CINEMA
            if (['Open Air', 'Outdoor Cinema'].includes(variant)) {
                return <OutdoorCinemaOpenAirSvg {...commonProps} />;
            }

            // Fallback for Theatre
            return <StandardCinemaSingleScreenSvg {...commonProps} />;

        case EVENT_TYPES.CONCERT:
        case 'Concert':
            const sub = (subType || '').toLowerCase().trim();
            const v = (variant || '').toLowerCase().trim();

            const isIndoor = sub.includes('indoor') || sub.includes('stadium');
            const isCenter = v.includes('center') || v.includes('360');
            const isEnd = v.includes('end');

            if (isIndoor && isCenter) {
                return <ConcertIndoorStadiumCenterStageSvg {...commonProps} />;
            }
            if (isIndoor && isEnd) {
                return <ConcertIndoorStadiumEndStageSvg {...commonProps} />;
            }
            if (isCenter) {
                return <ConcertCenterStageSvg {...commonProps} />;
            }
            if (v.includes('festival') || v.includes('field') || v.includes('open')) {
                return <ConcertOutdoorMainStageSvg {...commonProps} />;
            }
            if (v.includes('thrust') || v.includes('runway')) {
                return <ThrustStageSvg {...commonProps} />;
            }
            if (v.includes('club') || v.includes('standing')) {
                return <ClubStandingSvg {...commonProps} />;
            }
            if (sub.includes('outdoor') && v.includes('main')) {
                return <ConcertOutdoorMainStageSvg {...commonProps} />;
            }
            return <ConcertEndStageSvg {...commonProps} />;

        case EVENT_TYPES.STADIUM:
        case 'Stadium':
            // 1. Use subType for precise component selection (BEST MATCH)
            // Use zoneConfigs if passed (Admin mode), else fallback to zoneMap (User mode)
            const stadiumProps = {
                onZoneClick: onZoneSelect,
                zoneConfigs: (zoneConfigs && Object.keys(zoneConfigs).length > 0) ? zoneConfigs : zoneMap,
                subType: subType,
                activeZones: activeZones
            };

            if (subType === 'Kabaddi') return <KabaddiStadiumSvg {...stadiumProps} />;
            if (subType === 'Cricket') return <CricketStadiumSvg {...stadiumProps} />;
            if (subType === 'Football') return <FootballStadiumSvg {...stadiumProps} />;
            if (subType === 'Basketball') return <BasketballStadiumSvg {...stadiumProps} />;
            if (subType === 'Tennis') return <TennisStadiumSvg {...stadiumProps} />;
            if (subType === 'Hockey') return <HockeyStadiumSvg {...stadiumProps} />;
            if (subType === 'Athletics') return <AthleticsStadiumSvg {...stadiumProps} />;

            // 2. Fallback to variant matching if subType is missing
            if (['Indoor Arena', 'Traditional Mat', 'Clay Court', 'Pro League', 'TV Studio Arena'].includes(variant)) {
                return <KabaddiStadiumSvg {...stadiumProps} />;
            }
            if (['Modern Bowl', 'Modern Stadium', 'Pavilion Style', 'Village Green', 'Oval Classic', 'Classic Oval'].includes(variant)) {
                return <CricketStadiumSvg {...stadiumProps} />;
            }
            if (['Athletics', 'Track & Field'].includes(variant)) {
                return <AthleticsStadiumSvg {...stadiumProps} />;
            }
            if (['Motorsport', 'Track layout', 'Circuit'].includes(variant)) {
                return <MotorsportTrackSvg {...commonProps} />;
            }
            if (['Field Hockey Ground', 'Modern Turf Stadium', 'Ice Rink Arena'].includes(variant)) {
                return <HockeyStadiumSvg {...stadiumProps} />;
            }
            if (['College Court', 'High School Gym', 'NBA Arena', 'Compact Hall'].includes(variant)) {
                return <BasketballStadiumSvg {...stadiumProps} />;
            }
            if (['Center Court', 'Stadium Court'].includes(variant)) {
                return <TennisStadiumSvg {...stadiumProps} />;
            }

            // Default to Football Stadium if no match found
            return <FootballStadiumSvg {...stadiumProps} />;


        default:
            return <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-lg">No Visual Map Available</div>;
    }
});

export default VenueVisuals;
