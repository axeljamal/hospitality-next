const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

/** Great-circle distance (km, rounded) and initial bearing from `home` to `to`. */
export function distanceAndBearing(home: { lat: number; lon: number }, to: { lat: number; lon: number }) {
  const R = 6371;
  const toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(to.lat - home.lat);
  const dLon = toR(to.lon - home.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(home.lat)) * Math.cos(toR(to.lat)) * Math.sin(dLon / 2) ** 2;
  const km = Math.round(2 * R * Math.asin(Math.sqrt(a)));
  const y = Math.sin(dLon) * Math.cos(toR(to.lat));
  const x = Math.cos(toR(home.lat)) * Math.sin(toR(to.lat)) - Math.sin(toR(home.lat)) * Math.cos(toR(to.lat)) * Math.cos(dLon);
  const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return { km, bearing, dir: POINTS[Math.round(bearing / 22.5) % 16] };
}
