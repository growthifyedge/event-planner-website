// Homepage hero placements — plain constants shared by the Media model, the
// admin UI and the API. No mongoose import here, so it is safe to import from
// client components. Values map to eventTypes slugs for direct resolver lookup.
export const HOMEPAGE_PLACEMENTS = [
  { value: '', label: 'None' },
  { value: 'weddings', label: 'Weddings Hero' },
  { value: 'corporate', label: 'Corporate Hero' },
  { value: 'birthdays', label: 'Birthdays Hero' },
  { value: 'private-parties', label: 'Private Parties Hero' },
];

export const HOMEPAGE_PLACEMENT_VALUES = HOMEPAGE_PLACEMENTS.map((p) => p.value);

export const placementLabel = (value) =>
  HOMEPAGE_PLACEMENTS.find((p) => p.value === value)?.label || '';
