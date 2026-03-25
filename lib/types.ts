export type Business = {
  id: string
  name: string
  slug: string
  owner_id: string
  logo_url: string | null
  phone: string | null
  address: string | null
  about: string | null
  plan: 'temel' | 'pro' | 'kurumsal'
  business_type: string
  status: 'aktif' | 'pasif' | 'askida'
  instagram_url: string | null
  created_at: string
}

export type Staff = {
  id: string
  business_id: string
  name: string
  role: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export type Service = {
  id: string
  business_id: string
  name: string
  duration: number // minutes
  price: number
  is_active: boolean
}

export type Appointment = {
  id: string
  business_id: string
  staff_id: string | null
  service_id: string
  customer_name: string
  customer_phone: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  status: 'bekliyor' | 'onaylandi' | 'iptal' | 'tamamlandi'
  notes: string | null
  created_at: string
  // joined
  service?: Service
  staff?: Staff
}

export type WorkingHours = {
  id: string
  business_id: string
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0=Sunday
  is_open: boolean
  open_time: string // HH:MM
  close_time: string // HH:MM
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'isletme' | 'superadmin'
  business_id: string | null
}
