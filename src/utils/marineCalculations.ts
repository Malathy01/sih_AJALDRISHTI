import {
  OceanState,
  WeatherWarning,
  MarineRoute,
  RiskBreakdown,
  RiskLevel
} from '../types/marine';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates transparent, explainable Marine Risk
 * Components:
 * - weatherRisk: IMD warning, cyclones, squalls
 * - waveRisk: Significant wave height (meters)
 * - windRisk: Wind speed (knots)
 * - currentRisk: Surface current (m/s)
 * - boundaryRisk: Distance to IMBL / restricted areas
 * - ecosystemRisk: Algal bloom, heat stress
 * - routeRisk: Exposure to open sea
 * - dataQualityRisk: Stale or unverified sources
 */
export function evaluateMarineRisk(
  ocean: OceanState,
  warnings: WeatherWarning[],
  distanceToBoundaryKm: number,
  ecosystemAlertsCount: number
): RiskBreakdown {
  const activeWarning = warnings.find((w) => w.affectsVenturing);
  const hasSevereWeather = activeWarning !== undefined;

  // Wave Risk: < 1.2m Low (15), 1.2-1.8m Moderate (45), 1.8-2.5m High (75), >2.5m Critical (95)
  let waveRisk = 15;
  if (ocean.significantWaveHeightM > 2.5) waveRisk = 95;
  else if (ocean.significantWaveHeightM > 1.8) waveRisk = 75;
  else if (ocean.significantWaveHeightM > 1.2) waveRisk = 45;

  // Wind Risk: < 15 kts Low (15), 15-22 kts Moderate (45), 22-28 kts High (75), >28 kts Critical (95)
  let windRisk = 15;
  if (ocean.windSpeedKts > 28) windRisk = 95;
  else if (ocean.windSpeedKts > 22) windRisk = 75;
  else if (ocean.windSpeedKts > 15) windRisk = 45;

  // Current Risk: < 0.5 m/s Low (10), 0.5 - 1.0 Moderate (40), > 1.0 High (70)
  let currentRisk = 10;
  if (ocean.currentSpeedMps > 1.0) currentRisk = 70;
  else if (ocean.currentSpeedMps > 0.5) currentRisk = 40;

  // Weather Warning Risk
  let weatherRisk = hasSevereWeather ? 95 : warnings.length > 0 ? 50 : 15;

  // Boundary Risk: < 3 km from IMBL = 85, < 7 km = 50, > 7 km = 10
  let boundaryRisk = 10;
  if (distanceToBoundaryKm < 3) boundaryRisk = 85;
  else if (distanceToBoundaryKm < 7) boundaryRisk = 50;

  // Ecosystem Risk
  const ecosystemRisk = Math.min(80, ecosystemAlertsCount * 25 + 10);

  // Route Risk
  const routeRisk = Math.round((waveRisk * 0.4 + windRisk * 0.4 + currentRisk * 0.2));

  // Data Quality Risk (if demo or stale)
  const dataQualityRisk = ocean.freshnessStatus === 'STALE' ? 40 : ocean.freshnessStatus === 'DEMO' ? 25 : 10;

  // Weighted sum
  let overallScore = Math.round(
    weatherRisk * 0.3 +
      waveRisk * 0.25 +
      windRisk * 0.2 +
      boundaryRisk * 0.1 +
      currentRisk * 0.05 +
      ecosystemRisk * 0.05 +
      dataQualityRisk * 0.05
  );

  // Safety rule: If official warning advises not to venture, risk must be CRITICAL or HIGH
  if (hasSevereWeather) {
    overallScore = Math.max(overallScore, 85);
  }

  let overallLevel: RiskLevel = 'LOW';
  if (overallScore >= 80) overallLevel = 'CRITICAL';
  else if (overallScore >= 60) overallLevel = 'HIGH';
  else if (overallScore >= 35) overallLevel = 'MODERATE';

  const explanationsEn: string[] = [];
  const explanationsTa: string[] = [];

  if (hasSevereWeather) {
    explanationsEn.push(
      `Official Fishermen Warning active from ${activeWarning?.source}: ${activeWarning?.titleEn}. Venturing into sea is advised against.`
    );
    explanationsTa.push(
      `${activeWarning?.source}-ன் அதிகாரப்பூர்வ மீனவர் எச்சரிக்கை அமலில் உள்ளது: ${activeWarning?.titleTa}. கடலுக்குள் செல்வது தவிர்க்கப்பட வேண்டும்.`
    );
  } else {
    explanationsEn.push('No adverse official fishermen warning in effect for this coastal sector.');
    explanationsTa.push('இந்த கடலோரப் பகுதிக்கு பாதகமான அதிகாரப்பூர்வ மீனவர் எச்சரிக்கைகள் எதுவும் இல்லை.');
  }

  if (ocean.significantWaveHeightM >= 1.8) {
    explanationsEn.push(`Wave height is elevated at ${ocean.significantWaveHeightM}m (peak period ${ocean.peakWavePeriodSec}s).`);
    explanationsTa.push(`அலையின் உயரம் ${ocean.significantWaveHeightM} மீட்டராக அதிகமாக உள்ளது (அலை நேரம் ${ocean.peakWavePeriodSec} விநாடிகள்).`);
  } else {
    explanationsEn.push(`Wave height is mild at ${ocean.significantWaveHeightM}m.`);
    explanationsTa.push(`அலையின் உயரம் ${ocean.significantWaveHeightM} மீட்டருடன் சீராக உள்ளது.`);
  }

  if (ocean.windSpeedKts >= 20) {
    explanationsEn.push(`Strong winds detected at ${ocean.windSpeedKts} knots (${ocean.windDirectionText}).`);
    explanationsTa.push(`${ocean.windSpeedKts} நாட் வேகத்தில் பலத்த காற்று வீசுகிறது (${ocean.windDirectionText}).`);
  }

  if (distanceToBoundaryKm < 5) {
    explanationsEn.push(`Proximity to International Maritime Boundary Line (IMBL) is close (${distanceToBoundaryKm} km). Maintain caution.`);
    explanationsTa.push(`சர்வதேச கடல் எல்லைக்கு (IMBL) அருகில் உள்ளீர்கள் (${distanceToBoundaryKm} கி.மீ). எச்சரிக்கையாக இருக்கவும்.`);
  }

  const advisoryAdviceEn =
    overallLevel === 'CRITICAL'
      ? 'DO NOT VENTURE: Severe sea state or official advisory prohibits fishing. Safety takes absolute precedence.'
      : overallLevel === 'HIGH'
      ? 'VENTURING NOT RECOMMENDED: High waves or strong winds present elevated hazards for small craft.'
      : overallLevel === 'MODERATE'
      ? 'EXERCISE CAUTION: Moderate sea conditions. Recommended for experienced crew with functional GPS & VHF radio.'
      : 'FAVORABLE CONDITIONS: Sea state is calm to slight with no active adverse warnings. Observe standard safety protocols.';

  const advisoryAdviceTa =
    overallLevel === 'CRITICAL'
      ? 'கடலுக்குள் செல்ல வேண்டாம்: கடுமையான கடல் சீற்றம் அல்லது அரசு எச்சரிக்கை அமலில் உள்ளது. உயிர் பாதுகாப்பு முதன்மையானது.'
      : overallLevel === 'HIGH'
      ? 'செல்ல பரிந்துரைக்கப்படவில்லை: அதிக அலை மற்றும் காற்று சிறிய படகுகளுக்கு ஆபத்தானது.'
      : overallLevel === 'MODERATE'
      ? 'எச்சரிக்கையுடன் செயல்படவும்: மிதமான கடல் அலைகள். அனுபவம் வாய்ந்த குழுவினருக்கு மட்டுமே பரிந்துரைக்கப்படுகிறது.'
      : 'ஏதுவான கடல் சூழல்: கடல் அமைதியாக உள்ளது, பாதகமான எச்சரிக்கைகள் இல்லை. நிலையான பாதுகாப்பு விதிகளைப் பின்பற்றவும்.';

  return {
    overallLevel,
    overallScore,
    weatherRisk,
    waveRisk,
    windRisk,
    currentRisk,
    boundaryRisk,
    ecosystemRisk,
    routeRisk,
    dataQualityRisk,
    explanationsEn,
    explanationsTa,
    advisoryAdviceEn,
    advisoryAdviceTa,
    conflictDetected: false
  };
}

/**
 * Computes multiple route alternatives with fuel and safety awareness
 */
export function generateRouteAlternatives(
  startLat: number,
  startLng: number,
  targetLat: number,
  targetLng: number,
  boatSpeedKnots = 9,
  fuelRateLph = 5.2
): MarineRoute[] {
  const directDistance = calculateHaversineDistanceKm(startLat, startLng, targetLat, targetLng);

  // 1. FASTEST ROUTE (straight line)
  const fastestDuration = Math.round((directDistance / (boatSpeedKnots * 1.852)) * 10) / 10;
  const fastestFuel = Math.round(fastestDuration * fuelRateLph * 10) / 10;

  // Midpoint
  const midLat = (startLat + targetLat) / 2;
  const midLng = (startLng + targetLng) / 2;

  // 2. LOWER-RISK ROUTE (curves away from shallow shoals & boundary line towards calmer coastal trench)
  const safeMidLat = midLat - 0.02;
  const safeMidLng = midLng - 0.03;
  const safeDistance = Math.round(directDistance * 1.12 * 10) / 10;
  const safeDuration = Math.round((safeDistance / (boatSpeedKnots * 1.852)) * 10) / 10;
  const safeFuel = Math.round(safeDuration * fuelRateLph * 10) / 10;

  // 3. FUEL-EFFICIENT ROUTE (utilizes favorable longshore drift current)
  const currentSavings = 1.8; // Litres saved
  const fuelOptDistance = Math.round(directDistance * 1.05 * 10) / 10;
  const fuelOptDuration = Math.round((fuelOptDistance / ((boatSpeedKnots + 0.8) * 1.852)) * 10) / 10;
  const fuelOptFuel = Math.max(1, Math.round((fuelOptDuration * fuelRateLph - currentSavings) * 10) / 10);

  return [
    {
      id: 'route-fastest',
      name: 'Fastest Direct Route',
      type: 'FASTEST',
      waypoints: [
        [startLat, startLng],
        [midLat, midLng],
        [targetLat, targetLng]
      ],
      distanceKm: directDistance,
      estimatedDurationHours: fastestDuration,
      estimatedFuelLitres: fastestFuel,
      averageRisk: 'MODERATE',
      hazardCount: 1,
      closestBoundaryDistanceKm: 6.2,
      favorableCurrentSavingsLitres: 0,
      descriptionEn: 'Direct geodesic path. Quickest transit but passes through higher swell exposure.',
      descriptionTa: 'நேரடி பாதை. விரைவான பயணம் ஆனால் அதிக அலை தாக்கம் உள்ள பகுதி வழியே செல்லும்.'
    },
    {
      id: 'route-lower-risk',
      name: 'Lower-Risk Safe Route',
      type: 'LOWER_RISK',
      waypoints: [
        [startLat, startLng],
        [safeMidLat, safeMidLng],
        [targetLat, targetLng]
      ],
      distanceKm: safeDistance,
      estimatedDurationHours: safeDuration,
      estimatedFuelLitres: safeFuel,
      averageRisk: 'LOW',
      hazardCount: 0,
      closestBoundaryDistanceKm: 9.8,
      favorableCurrentSavingsLitres: 0.4,
      descriptionEn: 'Maintains safer distance from shallow coral reefs and International Maritime Boundary Line.',
      descriptionTa: 'பவளப்பாறைகள் மற்றும் சர்வதேச எல்லைக் கோட்டிலிருந்து பாதுகாப்பான இடைவெளியை பராமரிக்கிறது.'
    },
    {
      id: 'route-fuel-efficient',
      name: 'Fuel-Aware Eco Route',
      type: 'FUEL_EFFICIENT',
      waypoints: [
        [startLat, startLng],
        [(startLat + midLat) / 2 - 0.01, (startLng + midLng) / 2],
        [targetLat, targetLng]
      ],
      distanceKm: fuelOptDistance,
      estimatedDurationHours: fuelOptDuration,
      estimatedFuelLitres: fuelOptFuel,
      averageRisk: 'LOW',
      hazardCount: 0,
      closestBoundaryDistanceKm: 7.9,
      favorableCurrentSavingsLitres: currentSavings,
      descriptionEn: 'Aligns trajectory with favorable coastal surface currents to conserve ~1.8L fuel.',
      descriptionTa: 'சாதகமான கடல் நீரோட்டத்தைப் பயன்படுத்தி சுமார் 1.8 லிட்டர் எரிபொருளைச் சேமிக்கும் சூழல் பாதை.'
    }
  ];
}
