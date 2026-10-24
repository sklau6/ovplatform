export type WorkplaceMode = 'occupancy' | 'comfort' | 'energy' | 'bookings';
export type WorkplaceScenario = 'morning' | 'peak' | 'evening';

export const WORKPLACE_MODES: Array<{ id: WorkplaceMode; label: string; color: string; note: string }> = [
  { id: 'occupancy', label: 'Occupancy', color: '#53f0be', note: 'Live desk and room utilisation across the floor.' },
  { id: 'comfort', label: 'Comfort', color: '#51d6ff', note: 'Temperature, CO₂, daylight and acoustic comfort.' },
  { id: 'energy', label: 'Energy', color: '#f4bd72', note: 'Lighting, plug loads and HVAC energy by zone.' },
  { id: 'bookings', label: 'Bookings', color: '#a991ff', note: 'Meeting-room demand, no-shows and peak pressure.' },
];

export const WORKPLACE_SCENARIOS: Record<WorkplaceScenario, { label: string; people: number; util: number; comfort: number; energy: number; note: string }> = {
  morning: { label: 'Morning', people: 46, util: 38, comfort: 82, energy: 42, note: 'Arrivals building; focus rooms filling first.' },
  peak: { label: 'Peak', people: 112, util: 78, comfort: 74, energy: 68, note: 'Peak collaboration; meeting rooms at 92% demand.' },
  evening: { label: 'After hours', people: 18, util: 14, comfort: 79, energy: 21, note: 'After-hours lighting and zoning active.' },
};

export const WORKPLACE_ZONES = [
  { id: 'Z-01', name: 'Open studio', type: 'Work', x: -6, z: -3, w: 9, d: 6, capacity: 48, occupancy: 34, comfort: 79, energy: 18, color: '#53f0be' },
  { id: 'Z-02', name: 'Team rooms', type: 'Meet', x: 6, z: -4, w: 7, d: 5, capacity: 24, occupancy: 21, comfort: 76, energy: 12, color: '#51d6ff' },
  { id: 'Z-03', name: 'Focus pods', type: 'Focus', x: -6, z: 5, w: 6, d: 4, capacity: 10, occupancy: 7, comfort: 84, energy: 5, color: '#a991ff' },
  { id: 'Z-04', name: 'Forum / town hall', type: 'Collaborate', x: 2, z: 5, w: 7, d: 4, capacity: 40, occupancy: 18, comfort: 72, energy: 9, color: '#f4bd72' },
  { id: 'Z-05', name: 'Café / social', type: 'Social', x: 9, z: 4, w: 4, d: 5, capacity: 26, occupancy: 15, comfort: 80, energy: 7, color: '#ff9f43' },
  { id: 'Z-06', name: 'Reception / arrival', type: 'Arrival', x: 9, z: -3, w: 4, d: 4, capacity: 8, occupancy: 3, comfort: 77, energy: 4, color: '#53f0be' },
];

export const WORKPLACE_KPIS = [
  { label: 'Desk utilisation', value: '78', unit: '%', delta: '+6 pts' },
  { label: 'Room utilisation', value: '92', unit: '%', delta: '+11 pts' },
  { label: 'Comfort index', value: '74', unit: '/100', delta: '−3 vs target' },
  { label: 'Energy intensity', value: '68', unit: 'kWh/m²', delta: '−9% YoY' },
];

export const ROOM_BOOKINGS = [
  { room: 'Boardroom 08A', time: '09:30–10:30', status: 'In use', pax: 8 },
  { room: 'Team room 08B', time: '10:00–11:00', status: 'In use', pax: 6 },
  { room: 'Focus pod 03', time: '10:15–11:15', status: 'Booked', pax: 1 },
  { room: 'Forum 08', time: '14:00–15:30', status: 'Available', pax: 0 },
];

export const EXPERIENCE_SIGNALS = [
  { label: 'Tenant NPS', value: '+42', note: 'quarterly pulse' },
  { label: 'App adoption', value: '86%', note: 'monthly active' },
  { label: 'No-show rate', value: '9%', note: 'meeting rooms' },
  { label: 'Wayfinding', value: '2.1 min', note: 'to meeting room' },
];
