import { Language } from '../types/marine';

export const TRANSLATIONS = {
  en: {
    appName: 'JALDRISHTI',
    tagline: 'Detect Risk. Discover Fish. Decide Smarter. Return Safely.',
    subtitle: 'Agentic Marine Decision Twin for Safe, Sustainable & Intelligent Fishing',
    problemStatement: 'SIH 2026 Problem ID: 26176 (ORCA Marine Reasoning with Collaborative Agents)',
    team: 'Team: Sona Ignitors',

    // Roles
    roleFisher: 'Fisherman (மீனவர்)',
    roleAuthority: 'Coastal Authority (கடலோர காவல்)',
    roleResearcher: 'Marine Researcher (ஆராய்ச்சியாளர்)',
    roleAdmin: 'System Admin (நிர்வாகி)',

    // Navigation & Tabs
    tabDashboard: 'Fisher Dashboard',
    tabMap: 'Interactive Marine Map',
    tabChat: 'Ask Jaldrishti AI',
    tabPFZ: 'PFZ Explorer',
    tabSafety: 'Safety Center',
    tabRoute: 'Route Planner',
    tabWhatIf: 'What-If Simulator',
    tabTrip: 'Trip Tracker',
    tabObservations: 'Field Observations',
    tabAuthority: 'Authority Console',
    tabResearch: 'Research & Trends',
    tabAdmin: 'Connectors & Health',

    // Modes & Toggles
    liveMode: 'Live Sync',
    demoMode: 'Demo Simulation',
    lowBandwidthMode: 'Low-Bandwidth Mode',
    highContrastMode: 'High Contrast',
    offlineStatus: 'Live Data Unavailable (Showing Verified Cache)',
    freshnessFresh: 'Fresh',
    freshnessRecent: 'Recent',
    freshnessStale: 'Stale',
    freshnessUnavailable: 'Unavailable',

    // Safety terminology
    safetyStatusTitle: 'Sea Safety Status',
    safeToVenture: 'Safe Conditions (Verified Low Risk)',
    cautionToVenture: 'Caution (Elevated Swell/Wind)',
    highRisk: 'High Risk (Venturing Not Advised)',
    doNotVenture: 'DO NOT VENTURE (Official Advisory Warning)',
    fishermenWarning: 'Fishermen Warning',
    advisoryActive: 'Official Advisory Active',
    noActiveWarnings: 'No Adverse Warning Signals Detected',

    // PFZ terminology
    pfzTitle: 'Potential Fishing Zone',
    pfzTamilName: 'சாத்தியமான மீன்பிடி மண்டலம்',
    pfzCaveat: 'Identified from INCOIS SST & Chlorophyll-a satellite advisories. Aggregation likely, not guaranteed catch.',
    distanceFromHarbour: 'Distance from harbour',
    depth: 'Depth',
    seaSurfaceTemp: 'Sea Surface Temp',
    chlorophyllConc: 'Chlorophyll-a',
    targetSpecies: 'Likely Pelagic Species',

    // Marine parameters
    windSpeed: 'Wind Speed',
    windDirection: 'Wind Direction',
    waveHeight: 'Significant Wave Height',
    swellHeight: 'Swell Height',
    surfaceCurrent: 'Surface Current',
    currentDirection: 'Current Direction',
    tideLevel: 'Tide Level',
    waterTemp: 'Water Temp',
    mixedLayer: 'Mixed Layer Depth',

    // Actions
    startTrip: 'Start Trip',
    pauseTrip: 'Pause Trip',
    endTrip: 'Complete Trip',
    emergencySOS: 'EMERGENCY SOS',
    simulateScenario: 'Run What-If Simulation',
    planSafeRoute: 'Generate Fuel & Risk Routes',
    askQuestion: 'Ask Marine Question',
    viewEvidence: 'View Reasoning Evidence',
    reportObservation: 'Report Sea Sighting',

    // What-if simulator
    baseScenario: 'Base Scenario (Current Plan)',
    simulatedScenario: 'Alternative Scenario',
    departureTime: 'Departure Time',
    boatSpeed: 'Boat Speed (knots)',
    compareImpact: 'Compare Risk, Fuel & Sea State',
    difference: 'Delta Difference',

    // Multi-Agent Chain
    agentPipeline: 'Collaborative Marine Agents Active',
    intentAgent: 'Intent Classifier',
    contextAgent: 'Spatial Context Agent',
    pfzAgent: 'PFZ Advisory Agent (INCOIS)',
    oceanAgent: 'Ocean State Agent',
    safetyAgent: 'Weather & Warning Agent (IMD)',
    regulationAgent: 'Maritime Boundary Agent (IMBL)',
    routeAgent: 'Route & Fuel Optimization Agent',
    ecosystemAgent: 'Ecosystem & Bloom Agent (MOSDAC)',
    criticAgent: 'Critic & Conflict Verification Agent',
    evidenceAgent: 'Evidence Graph Synthesizer',
    responseAgent: 'Bilingual Explainer Agent',

    // Data sources
    sourceINCOIS: 'INCOIS (Indian National Centre for Ocean Information Services)',
    sourceIMD: 'IMD (India Meteorological Department)',
    sourceMOSDAC: 'MOSDAC / ISRO (Meteorological and Oceanographic Satellite Data Archival Centre)',
    sourceBhuvan: 'Bhuvan / NRSC (National Remote Sensing Centre)',

    // Rameswaram & Locations
    rameswaram: 'Rameswaram Fishing Jetty',
    pamban: 'Pamban Port',
    mandapam: 'Mandapam Marine Landing',
    dhanushkodi: 'Dhanushkodi Point',
    gulfOfMannar: 'Gulf of Mannar Biosphere',
    palkStrait: 'Palk Strait Fishing Ground',
    imblBoundary: 'International Maritime Boundary Line (IMBL)'
  },
  ta: {
    appName: 'ஜல்திருஷ்டி (JALDRISHTI)',
    tagline: 'ஆபத்தை அறி! மீன்வளம் காண்! விவேகமாய் முடிவெடு! பாதுகாப்பாய் திரும்பு!',
    subtitle: 'மீனவர்களுக்கான பாதுகாப்பான, நிலையான மற்றும் புத்திசாலித்தனமான கடல்சார் முடிவெடுக்கும் இரட்டை தளம்',
    problemStatement: 'ஸ்மார்ட் இந்தியா ஹேக்கத்தான் 2026 - தலைப்பு ID: 26176 (ORCA கடல்சார் அமைப்புகள் ஆய்வு)',
    team: 'குழு: சோனா இக்னிட்டர்ஸ்',

    // Roles
    roleFisher: 'மீனவர் (Fisherman)',
    roleAuthority: 'கடலோரக் காவல் மற்றும் மீன்வளத்துறை',
    roleResearcher: 'கடல்சார் ஆராய்ச்சியாளர்',
    roleAdmin: 'கணினி நிர்வாகி',

    // Navigation & Tabs
    tabDashboard: 'மீனவர் முதன்மைப் பலகை',
    tabMap: 'ஊடாடும் கடல் வரைபடம்',
    tabChat: 'ஜல்திருஷ்டி AI உரையாடல்',
    tabPFZ: 'மீன்பிடி மண்டல வழிகாட்டி',
    tabSafety: 'பாதுகாப்பு மையம்',
    tabRoute: 'பாதை திட்டமிடுதல்',
    tabWhatIf: 'நேர மாற்றப் பரிசோதனை (What-If)',
    tabTrip: 'பயணக் கண்காணிப்பு',
    tabObservations: 'மீனவர் களப் பதிவுகள்',
    tabAuthority: 'அதிகாரிகள் தளம்',
    tabResearch: 'ஆராய்ச்சி & போக்குகள்',
    tabAdmin: 'தரவு மூலங்கள் நிலை',

    // Modes & Toggles
    liveMode: 'நேரலை இணைப்பு',
    demoMode: 'செயல்முறை மாதிரி (Demo)',
    lowBandwidthMode: 'குறைந்த அலைவரிசை முறை (2G/3G)',
    highContrastMode: 'உயர் மாறுபட்ட காட்சி',
    offlineStatus: 'நேரலை சேவை இல்லை (சரிபார்க்கப்பட்ட முந்தைய தரவு)',
    freshnessFresh: 'புதியது (Fresh)',
    freshnessRecent: 'சமீபத்தியது',
    freshnessStale: 'பழையது',
    freshnessUnavailable: 'கிடைக்கவில்லை',

    // Safety terminology
    safetyStatusTitle: 'கடல் பாதுகாப்பு நிலை',
    safeToVenture: 'பாதுகாப்பான சூழல் (குறைந்த ஆபத்து)',
    cautionToVenture: 'எச்சரிக்கை (அதிக அலை / காற்று)',
    highRisk: 'அதிக ஆபத்து (கடலுக்குள் செல்ல வேண்டாம்)',
    doNotVenture: 'கடலுக்குள் செல்ல வேண்டாம் (அரசு அதிகாரப்பூர்வ எச்சரிக்கை)',
    fishermenWarning: 'மீனவர்களுக்கான எச்சரிக்கை',
    advisoryActive: 'அதிகாரப்பூர்வ எச்சரிக்கை அமலில் உள்ளது',
    noActiveWarnings: 'ஆபத்தான எச்சரிக்கை சிக்னல்கள் இல்லை',

    // PFZ terminology
    pfzTitle: 'சாத்தியமான மீன்பிடி மண்டலம் (PFZ)',
    pfzTamilName: 'சாத்தியமான மீன்பிடி மண்டலம்',
    pfzCaveat: 'INCOIS செயற்கைக்கோள் கடல் வெப்பநிலை மற்றும் குளோரோபில் அடிப்படையில் கணிக்கப்பட்டது. மீன்கள் கூடும் வாய்ப்பு அதிகம்; உத்திரவாதமல்ல.',
    distanceFromHarbour: 'துறைமுகத்திலிருந்து தொலைவு',
    depth: 'ஆழம்',
    seaSurfaceTemp: 'கடல் மேற்பரப்பு வெப்பநிலை',
    chlorophyllConc: 'குளோரோபில் செறிவு',
    targetSpecies: 'எதிர்பார்க்கப்படும் மீன் வகைகள்',

    // Marine parameters
    windSpeed: 'காற்றின் வேகம்',
    windDirection: 'காற்றின் திசை',
    waveHeight: 'அலையின் உயரம்',
    swellHeight: 'நீள் அலை (Swell)',
    surfaceCurrent: 'கடல் நீரோட்டம்',
    currentDirection: 'நீரோட்ட திசை',
    tideLevel: 'ஏற்ற இறக்க நிலை',
    waterTemp: 'நீர் வெப்பநிலை',
    mixedLayer: 'கலப்பு அடுக்கு ஆழம்',

    // Actions
    startTrip: 'பயணம் தொடங்கு',
    pauseTrip: 'பயணம் இடைநிறுத்து',
    endTrip: 'பயணம் நிறைவு',
    emergencySOS: 'அவசர உதவி (SOS)',
    simulateScenario: 'நேர மாற்றப் பரிசோதனை செய்',
    planSafeRoute: 'பாதுகாப்பான & எரிபொருள் சேமிப்புப் பாதை',
    askQuestion: 'கடல்சார் கேள்வி கேள்',
    viewEvidence: 'காரண ஆதாரங்களைக் காண்',
    reportObservation: 'கடல் அவதானிப்பைப் பதிவு செய்',

    // What-if simulator
    baseScenario: 'அசல் திட்டம் (தற்போதைய நேரம்)',
    simulatedScenario: 'மாற்று நேரம் / வேகம்',
    departureTime: 'புறப்படும் நேரம்',
    boatSpeed: 'படகு வேகம் (நாட்கள்/மணி)',
    compareImpact: 'ஆபத்து, எரிபொருள் & அலை மாற்றங்களை ஒப்பிடு',
    difference: 'வித்தியாசம்',

    // Multi-Agent Chain
    agentPipeline: 'இணைந்து செயல்படும் கடல்சார் ஏஜெண்டுகள்',
    intentAgent: 'நோக்கம் கண்டறியும் ஏஜெண்ட்',
    contextAgent: 'இடஞ்சார்ந்த சூழல் ஏஜெண்ட்',
    pfzAgent: 'PFZ மீன்வள ஏஜெண்ட் (INCOIS)',
    oceanAgent: 'கடல்நிலை ஆய்வாளர் ஏஜெண்ட்',
    safetyAgent: 'வானிலை & எச்சரிக்கை ஏஜெண்ட் (IMD)',
    regulationAgent: 'கடல் எல்லை ஒழுங்குமுறை ஏஜெண்ட் (IMBL)',
    routeAgent: 'பாதை & எரிபொருள் பகுப்பாய்வு ஏஜெண்ட்',
    ecosystemAgent: 'சுற்றுச்சூழல் & பாசிப்படல ஏஜெண்ட்',
    criticAgent: 'முரண்பாடு கண்டறியும் விமர்சக ஏஜெண்ட்',
    evidenceAgent: 'ஆதார வரைபடத் தொகுப்பாளர்',
    responseAgent: 'இருமொழி விளக்க ஏஜெண்ட்',

    // Data sources
    sourceINCOIS: 'INCOIS (இந்திய கடல்சார் தகவல் மையம்)',
    sourceIMD: 'IMD (இந்திய வானிலை ஆய்வு மையம்)',
    sourceMOSDAC: 'MOSDAC / ISRO (இஸ்ரோ விண்வெளிப் பயன்பாட்டு மையம்)',
    sourceBhuvan: 'Bhuvan / NRSC (தேசிய தொலை உணர்வு மையம்)',

    // Rameswaram & Locations
    rameswaram: 'ராமேஸ்வரம் மீன்பிடி தளம்',
    pamban: 'பாம்பன் துறைமுகம்',
    mandapam: 'மண்டபம் மீன்பிடி மையம்',
    dhanushkodi: 'தனுஷ்கோடி முனை',
    gulfOfMannar: 'மன்னார் வளைகுடா கடல் காப்பகம்',
    palkStrait: 'பாக் ஜலசந்தி மீன்பிடி தளம்',
    imblBoundary: 'சர்வதேச கடல் எல்லைக் கோடு (IMBL)'
  }
};

export function t(key: keyof typeof TRANSLATIONS['en'], lang: Language): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
}
