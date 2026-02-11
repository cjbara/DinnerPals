export const DEFAULT_CATEGORIES = [
  { name: 'Appetizers', sortOrder: 0 },
  { name: 'Entrées', sortOrder: 1 },
  { name: 'Sides', sortOrder: 2 },
  { name: 'Desserts', sortOrder: 3 },
  { name: 'Drinks', sortOrder: 4 },
];

export const DIETARY_TAGS = [
  'Dairy-Free',
  'Gluten-Free',
  'Nut-Free',
  'Vegan',
  'Vegetarian',
  'Contains Alcohol',
];

export const DIETARY_TAG_COLORS: Record<string, string> = {
  'Dairy-Free': 'bg-blue-100 text-blue-700',
  'Gluten-Free': 'bg-yellow-100 text-yellow-700',
  'Nut-Free': 'bg-orange-100 text-orange-700',
  'Vegan': 'bg-green-100 text-green-700',
  'Vegetarian': 'bg-emerald-100 text-emerald-700',
  'Contains Alcohol': 'bg-purple-100 text-purple-700',
};
