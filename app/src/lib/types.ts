export interface Dinner {
  id: string;
  title: string;
  description: string | null;
  date_time: string;
  location: string;
  host_name: string;
  host_phone: string;
  share_code: string;
  created_at: string;
}

export interface Category {
  id: string;
  dinner_id: string;
  name: string;
  desired_count: number | null;
  sort_order: number;
  created_at: string;
}

export interface Guest {
  id: string;
  dinner_id: string;
  name: string;
  phone: string;
  is_host: boolean;
  rsvp_at: string;
  session_token: string;
}

export interface Item {
  id: string;
  dinner_id: string;
  guest_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  item_dietary_tags?: { tag: string }[];
}

export interface ItemDietaryTag {
  id: string;
  item_id: string;
  tag: string;
}

// Form types
export interface CreateDinnerForm {
  hostName: string;
  hostPhone: string;
  title: string;
  dateTime: string;
  location: string;
  description: string;
}

export interface RsvpForm {
  name: string;
  phone: string;
}

export interface ItemForm {
  name: string;
  categoryId: string;
  description: string;
  dietaryTags: string[];
}
