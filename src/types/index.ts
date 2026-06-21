export type UserRole = 'admin' | 'editor' | 'viewer'

export type ActionState = { error?: string; success?: boolean }

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Boat {
  id: string
  name: string
  registration: string | null
  mmsi: string | null
  length: number | null
  beam: number | null
  home_port: string | null
  engine_hours: number | null
  observations: string | null
  created_at: string
}

export interface BoatMember {
  id: string
  boat_id: string
  user_id: string
  role: UserRole
  joined_at: string
  profiles?: Profile
}

export interface MaintenanceItem {
  id: string
  boat_id: string
  title: string
  category: string
  due_date: string | null
  due_engine_hours: number | null
  periodicity: string | null
  status: 'pending' | 'in_progress' | 'completed'
  cost: number | null
  notes: string | null
  created_at: string
}

export interface Repair {
  id: string
  boat_id: string
  title: string
  description: string | null
  date: string
  provider: string | null
  cost: number | null
  status: 'pending' | 'in_progress' | 'resolved'
  notes: string | null
  created_at: string
}

export interface Expense {
  id: string
  boat_id: string
  date: string
  concept: string
  category: string
  amount: number
  provider: string | null
  paid_by: string | null
  notes: string | null
  created_at: string
}

export interface FuelLog {
  id: string
  boat_id: string
  date: string
  liters: number
  price_per_liter: number
  total_cost: number
  engine_hours: number | null
  location: string | null
  notes: string | null
  created_at: string
}

export interface Trip {
  id: string
  boat_id: string
  date: string
  departure_port: string
  arrival_port: string | null
  skipper: string | null
  crew: string[] | null
  departure_time: string | null
  arrival_time: string | null
  engine_hours_start: number | null
  engine_hours_end: number | null
  estimated_miles: number | null
  weather: string | null
  incidents: string | null
  notes: string | null
  created_at: string
}

export interface FishingLog {
  id: string
  boat_id: string
  trip_id: string | null
  date: string
  species: string
  zone: string | null
  depth: number | null
  bait: string | null
  quantity: number | null
  catch_and_release: boolean
  observations: string | null
  created_at: string
}

export type AttachmentEntityType = 'repair' | 'expense' | 'trip' | 'fishing_log' | 'document'

export interface Attachment {
  id: string
  boat_id: string
  entity_type: AttachmentEntityType
  entity_id: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_by: string | null
  created_at: string
}

export interface Document {
  id: string
  boat_id: string
  type: string
  name: string
  file_url: string | null
  expiry_date: string | null
  notes: string | null
  created_at: string
}
