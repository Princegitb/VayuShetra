// High-Resolution Geospatial Fallback Telemetry Dataset
// Ensures VayuShetra Maps, Analytics, and Intelligence Chambers are always 100% operational

export const FALLBACK_DATES = [
  '2025-11-01',
  '2025-11-02',
  '2025-11-03',
  '2025-11-04',
  '2025-11-05'
]

export const FALLBACK_STATES = ['All', 'Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh']

export const FALLBACK_DISTRICTS = [
  'Ambala',
  'Amritsar',
  'Bathinda',
  'Faridabad',
  'Firozpur',
  'Gurugram',
  'Jalandhar',
  'Karnal',
  'Ludhiana',
  'New Delhi',
  'Panipat',
  'Patiala',
  'Rohtak',
  'Sangrur'
]

// District centroid anchors with real meteorological baseline profiles
export const DISTRICT_CENTROIDS = {
  'Ambala': { lat: 30.3782, lon: 76.7767, state: 'Haryana', aqi: 142, pm25: 59.8, pm10: 104.0, hcho: 1.22, blh: 710, wind: 11.2 },
  'Amritsar': { lat: 31.6340, lon: 74.8723, state: 'Punjab', aqi: 185, pm25: 78.2, pm10: 138.0, hcho: 1.62, blh: 580, wind: 14.1 },
  'Bathinda': { lat: 30.2110, lon: 74.9455, state: 'Punjab', aqi: 165, pm25: 69.3, pm10: 122.0, hcho: 1.45, blh: 640, wind: 13.0 },
  'Faridabad': { lat: 28.4089, lon: 77.3178, state: 'Haryana', aqi: 195, pm25: 82.0, pm10: 145.0, hcho: 1.30, blh: 550, wind: 8.5 },
  'Firozpur': { lat: 30.9237, lon: 74.6065, state: 'Punjab', aqi: 178, pm25: 74.8, pm10: 131.5, hcho: 1.55, blh: 610, wind: 12.0 },
  'Gurugram': { lat: 28.4595, lon: 77.0266, state: 'Haryana', aqi: 186, pm25: 78.4, pm10: 140.0, hcho: 1.25, blh: 570, wind: 8.9 },
  'Jalandhar': { lat: 31.3260, lon: 75.5762, state: 'Punjab', aqi: 160, pm25: 67.2, pm10: 118.0, hcho: 1.38, blh: 650, wind: 10.8 },
  'Karnal': { lat: 29.6857, lon: 76.9905, state: 'Haryana', aqi: 148, pm25: 62.2, pm10: 108.5, hcho: 1.28, blh: 680, wind: 9.8 },
  'Ludhiana': { lat: 30.9010, lon: 75.8573, state: 'Punjab', aqi: 172, pm25: 72.4, pm10: 128.0, hcho: 1.50, blh: 620, wind: 12.4 },
  'New Delhi': { lat: 28.6139, lon: 77.2090, state: 'Delhi', aqi: 215, pm25: 90.5, pm10: 162.0, hcho: 1.40, blh: 520, wind: 7.8 },
  'Panipat': { lat: 29.3909, lon: 76.9635, state: 'Haryana', aqi: 162, pm25: 68.0, pm10: 120.0, hcho: 1.32, blh: 670, wind: 9.2 },
  'Patiala': { lat: 30.3398, lon: 76.3869, state: 'Punjab', aqi: 155, pm25: 65.1, pm10: 114.0, hcho: 1.35, blh: 660, wind: 11.5 },
  'Rohtak': { lat: 28.8955, lon: 76.6066, state: 'Haryana', aqi: 152, pm25: 63.9, pm10: 112.0, hcho: 1.26, blh: 690, wind: 10.1 },
  'Sangrur': { lat: 30.2458, lon: 75.8421, state: 'Punjab', aqi: 182, pm25: 76.5, pm10: 135.0, hcho: 1.68, blh: 590, wind: 12.8 }
}

// Generate continuous 10km grid cells around each district centroid
export const generateFallbackCells = () => {
  const cells = []
  let cellId = 1000

  const offsets = [
    { dLat: 0.0, dLon: 0.0, weight: 1.0 },
    { dLat: 0.09, dLon: 0.0, weight: 0.96 },
    { dLat: -0.09, dLon: 0.0, weight: 0.98 },
    { dLat: 0.0, dLon: 0.1, weight: 0.94 },
    { dLat: 0.0, dLon: -0.1, weight: 1.02 },
    { dLat: 0.07, dLon: 0.08, weight: 0.95 },
    { dLat: -0.07, dLon: -0.08, weight: 1.03 },
    { dLat: 0.08, dLon: -0.07, weight: 0.99 },
    { dLat: -0.08, dLon: 0.07, weight: 1.01 }
  ]

  Object.entries(DISTRICT_CENTROIDS).forEach(([district, profile]) => {
    offsets.forEach((off, i) => {
      const aqi = Math.round(profile.aqi * off.weight)
      const pm25 = Number((profile.pm25 * off.weight).toFixed(1))
      const pm10 = Number((profile.pm10 * off.weight).toFixed(1))
      const hcho = Number((profile.hcho * (0.95 + i * 0.01)).toFixed(2))

      cells.push({
        cell_id: cellId++,
        district,
        state: profile.state,
        latitude: Number((profile.lat + off.dLat).toFixed(4)),
        longitude: Number((profile.lon + off.dLon).toFixed(4)),
        aqi,
        pm25,
        pm10,
        no2_surface: Number((24.0 + (aqi / 10)).toFixed(1)),
        so2_surface: Number((10.0 + (aqi / 20)).toFixed(1)),
        o3_surface: 34.5,
        hcho,
        aod: Number((0.35 + (aqi / 400)).toFixed(2)),
        blh: profile.blh,
        wind_speed: profile.wind,
        wind_direction: 315 // NW North-westerly
      })
    })
  })

  return cells
}

// Active NASA FIRMS Stubble Fire Clusters (Punjab/Haryana agricultural belt)
export const FALLBACK_FIRES = [
  { latitude: 30.28, longitude: 75.82, frp: 78.4, confidence: 92, sensor: 'VIIRS_NRT', district: 'Sangrur', state: 'Punjab' },
  { latitude: 30.34, longitude: 75.76, frp: 62.1, confidence: 88, sensor: 'VIIRS_NRT', district: 'Sangrur', state: 'Punjab' },
  { latitude: 30.18, longitude: 75.92, frp: 54.7, confidence: 85, sensor: 'VIIRS_NRT', district: 'Sangrur', state: 'Punjab' },
  { latitude: 31.60, longitude: 74.92, frp: 88.3, confidence: 95, sensor: 'VIIRS_NRT', district: 'Amritsar', state: 'Punjab' },
  { latitude: 31.68, longitude: 74.81, frp: 45.2, confidence: 80, sensor: 'VIIRS_NRT', district: 'Amritsar', state: 'Punjab' },
  { latitude: 30.95, longitude: 74.65, frp: 69.5, confidence: 90, sensor: 'VIIRS_NRT', district: 'Firozpur', state: 'Punjab' },
  { latitude: 30.88, longitude: 74.52, frp: 58.0, confidence: 86, sensor: 'VIIRS_NRT', district: 'Firozpur', state: 'Punjab' },
  { latitude: 30.25, longitude: 74.98, frp: 71.2, confidence: 91, sensor: 'VIIRS_NRT', district: 'Bathinda', state: 'Punjab' },
  { latitude: 30.15, longitude: 74.89, frp: 49.3, confidence: 84, sensor: 'VIIRS_NRT', district: 'Bathinda', state: 'Punjab' },
  { latitude: 30.85, longitude: 75.82, frp: 42.6, confidence: 82, sensor: 'VIIRS_NRT', district: 'Ludhiana', state: 'Punjab' },
  { latitude: 29.72, longitude: 76.94, frp: 38.5, confidence: 78, sensor: 'MODIS', district: 'Karnal', state: 'Haryana' },
  { latitude: 29.62, longitude: 77.05, frp: 34.0, confidence: 76, sensor: 'MODIS', district: 'Karnal', state: 'Haryana' }
]

// Sensitive Receptors (Hospitals, Heritage Monuments, Schools)
export const FALLBACK_RECEPTORS = [
  { id: 1, name: 'AIIMS New Delhi', category: 'Hospital', district: 'New Delhi', state: 'Delhi', latitude: 28.5672, longitude: 77.2100, baseline_pm25: 85, current_pm25: 98, delta_pm25: 13, risk_status: 'High', is_active: true },
  { id: 2, name: 'Safdarjung Hospital', category: 'Hospital', district: 'New Delhi', state: 'Delhi', latitude: 28.5701, longitude: 77.2078, baseline_pm25: 84, current_pm25: 96, delta_pm25: 12, risk_status: 'High', is_active: true },
  { id: 3, name: 'Apollo Hospital Sarita Vihar', category: 'Hospital', district: 'New Delhi', state: 'Delhi', latitude: 28.5355, longitude: 77.2878, baseline_pm25: 88, current_pm25: 104, delta_pm25: 16, risk_status: 'Critical', is_active: true },
  { id: 4, name: 'India Gate & Rajpath', category: 'Heritage', district: 'New Delhi', state: 'Delhi', latitude: 28.6129, longitude: 77.2295, baseline_pm25: 78, current_pm25: 89, delta_pm25: 11, risk_status: 'Moderate', is_active: true },
  { id: 5, name: 'Lotus Temple (Baháʼí House)', category: 'Heritage', district: 'New Delhi', state: 'Delhi', latitude: 28.5535, longitude: 77.2588, baseline_pm25: 80, current_pm25: 92, delta_pm25: 12, risk_status: 'Moderate', is_active: true },
  { id: 6, name: 'Qutub Minar Complex', category: 'Heritage', district: 'New Delhi', state: 'Delhi', latitude: 28.5245, longitude: 77.1855, baseline_pm25: 82, current_pm25: 94, delta_pm25: 12, risk_status: 'Moderate', is_active: true },
  { id: 7, name: 'Fortis Memorial Gurugram', category: 'Hospital', district: 'Gurugram', state: 'Haryana', latitude: 28.4552, longitude: 77.0722, baseline_pm25: 76, current_pm25: 88, delta_pm25: 12, risk_status: 'Moderate', is_active: true }
]

// Satellite TROPOMI Chemical Hotspots
export const FALLBACK_HOTSPOTS = [
  { latitude: 30.26, longitude: 75.83, hcho: 1.82, is_biomass: true, cluster_id: 1, district: 'Sangrur' },
  { latitude: 31.62, longitude: 74.88, hcho: 1.74, is_biomass: true, cluster_id: 2, district: 'Amritsar' },
  { latitude: 30.91, longitude: 75.86, hcho: 1.62, is_biomass: false, cluster_id: 3, district: 'Ludhiana' },
  { latitude: 28.62, longitude: 77.21, hcho: 1.55, is_biomass: false, cluster_id: 4, district: 'New Delhi' },
  { latitude: 29.40, longitude: 76.97, hcho: 1.48, is_biomass: false, cluster_id: 5, district: 'Panipat' }
]

// Wind Advection Plume Trajectories
export const FALLBACK_PLUMES = [
  {
    frp: 78.4,
    path: [
      [30.28, 75.82],
      [30.12, 76.05],
      [29.85, 76.38],
      [29.52, 76.75],
      [29.18, 77.02],
      [28.61, 77.21]
    ]
  },
  {
    frp: 88.3,
    path: [
      [31.60, 74.92],
      [31.25, 75.35],
      [30.82, 75.95],
      [30.34, 76.55],
      [29.68, 76.98],
      [28.61, 77.21]
    ]
  }
]

export const FALLBACK_MAP_DATA = {
  cells: generateFallbackCells(),
  fires: FALLBACK_FIRES,
  receptors: FALLBACK_RECEPTORS,
  hotspots: FALLBACK_HOTSPOTS,
  plumes: FALLBACK_PLUMES,
  wind_vectors: [
    { latitude: 30.5, longitude: 75.5, u: 3.2, v: -2.8 },
    { latitude: 30.0, longitude: 76.2, u: 2.9, v: -3.1 },
    { latitude: 29.5, longitude: 76.8, u: 2.6, v: -2.5 },
    { latitude: 28.8, longitude: 77.1, u: 2.1, v: -2.0 }
  ]
}

export const FALLBACK_DASHBOARD_DATA = {
  kpis: {
    aqi: 158,
    pm25: 72.0,
    pm10: 130.0,
    hcho: 4,
    fires: 12,
    wind: 14.5
  },
  focus: {
    district: 'Ambala',
    state: 'Haryana',
    aqi: 142,
    pm25: 59.8,
    pm10: 104.0,
    no2: 25.4,
    so2: 11.2,
    co: 1.05,
    o3: 32.0,
    aod: 0.42,
    hcho_column: 1.22,
    blh: 710,
    wind_speed: 11.2,
    trend: {
      dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
      aqi: [128, 134, 145, 140, 152, 138, 142],
      pm25: [52.1, 56.4, 61.2, 58.7, 64.5, 57.9, 59.8],
      pm10: [94.0, 99.2, 107.5, 102.1, 112.0, 101.4, 104.0]
    },
    source_attribution: {
      biomass: 26,
      vehicular: 42,
      industrial: 32
    }
  }
}
