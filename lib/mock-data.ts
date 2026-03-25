export type BusinessPlan = 'Temel' | 'Pro' | 'Kurumsal'
export type BusinessStatus = 'Aktif' | 'Pasif' | 'Askı'
export type AppointmentStatus = 'Onaylandı' | 'Bekliyor' | 'İptal' | 'Tamamlandı'
export type StaffRole = 'Berber' | 'Stilist' | 'Teknisyen' | 'Masör' | 'Tırnak Teknisyeni' | 'Dövme Sanatçısı' | 'Yönetici'
export type UserRole = 'super_admin' | 'business_owner' | 'staff' | 'customer'

export interface Business {
  id: string
  name: string
  slug: string
  logo: string
  owner: string
  plan: BusinessPlan
  status: BusinessStatus
  createdAt: string
  appointmentsCount: number
  revenue: number
  phone: string
  address: string
  about: string
  category: string
}

export interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  service: string
  staff: string
  date: string
  time: string
  status: AppointmentStatus
  price: number
  businessId: string
  notes?: string
}

export interface Staff {
  id: string
  name: string
  role: StaffRole
  avatar: string
  appointmentsToday: number
  rating: number
  businessId: string
  status: 'Aktif' | 'Pasif'
  phone: string
  email: string
}

export interface Service {
  id: string
  name: string
  duration: number
  price: number
  businessId: string
  status: 'Aktif' | 'Pasif'
  description?: string
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  stock: number
  businessId: string
  category: string
  status: 'Aktif' | 'Pasif'
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  businessId?: string
  businessName?: string
  lastLogin: string
  status: 'Aktif' | 'Pasif'
  createdAt: string
}

export const businesses: Business[] = [
  {
    id: 'b1',
    name: 'Maestro Erkek Kuaförü',
    slug: 'maestro-erkek-kuaforu',
    logo: 'M',
    owner: 'Ahmet Yılmaz',
    plan: 'Pro',
    status: 'Aktif',
    createdAt: '2024-01-15',
    appointmentsCount: 342,
    revenue: 28450,
    phone: '0212 555 01 01',
    address: 'Kadıköy, İstanbul',
    about: 'Profesyonel erkek kuaförü ve berber hizmetleri.',
    category: 'Berber',
  },
  {
    id: 'b2',
    name: 'Bella Güzellik Salonu',
    slug: 'bella-guzellik-salonu',
    logo: 'B',
    owner: 'Ayşe Kara',
    plan: 'Kurumsal',
    status: 'Aktif',
    createdAt: '2023-11-20',
    appointmentsCount: 891,
    revenue: 67200,
    phone: '0212 555 02 02',
    address: 'Şişli, İstanbul',
    about: 'Cilt bakımı, makyaj ve saç tasarımı konusunda uzman ekibimizle hizmetinizdeyiz.',
    category: 'Güzellik Salonu',
  },
  {
    id: 'b3',
    name: 'Dark Ink Dövme Stüdyosu',
    slug: 'dark-ink-dovme-studyosu',
    logo: 'D',
    owner: 'Mert Çelik',
    plan: 'Temel',
    status: 'Aktif',
    createdAt: '2024-03-05',
    appointmentsCount: 127,
    revenue: 18900,
    phone: '0216 555 03 03',
    address: 'Beyoğlu, İstanbul',
    about: 'Özgün dövme tasarımları ve piercing hizmetleri.',
    category: 'Dövme',
  },
  {
    id: 'b4',
    name: 'Glam Nails & Spa',
    slug: 'glam-nails-spa',
    logo: 'G',
    owner: 'Selin Öztürk',
    plan: 'Pro',
    status: 'Askı',
    createdAt: '2024-02-10',
    appointmentsCount: 215,
    revenue: 12300,
    phone: '0212 555 04 04',
    address: 'Beşiktaş, İstanbul',
    about: 'Tırnak bakımı, protez tırnak ve spa hizmetleri.',
    category: 'Tırnak',
  },
  {
    id: 'b5',
    name: 'Zen Masaj Merkezi',
    slug: 'zen-masaj-merkezi',
    logo: 'Z',
    owner: 'Kemal Arslan',
    plan: 'Temel',
    status: 'Pasif',
    createdAt: '2023-09-01',
    appointmentsCount: 88,
    revenue: 9600,
    phone: '0216 555 05 05',
    address: 'Üsküdar, İstanbul',
    about: 'Terapötik ve rahatlama masajı hizmetleri.',
    category: 'Masaj',
  },
]

export const appointments: Appointment[] = [
  {
    id: 'a1',
    customerName: 'Burak Şahin',
    customerPhone: '0532 111 22 33',
    service: 'Saç + Sakal',
    staff: 'Mehmet Usta',
    date: '2026-03-25',
    time: '10:00',
    status: 'Onaylandı',
    price: 250,
    businessId: 'b1',
    notes: 'Sakal şekillendirme istiyor',
  },
  {
    id: 'a2',
    customerName: 'Defne Koç',
    customerPhone: '0533 222 33 44',
    service: 'Cilt Bakımı',
    staff: 'Neslihan Hanım',
    date: '2026-03-25',
    time: '11:30',
    status: 'Bekliyor',
    price: 480,
    businessId: 'b1',
  },
  {
    id: 'a3',
    customerName: 'Emre Doğan',
    customerPhone: '0534 333 44 55',
    service: 'Saç Kesimi',
    staff: 'Mehmet Usta',
    date: '2026-03-25',
    time: '13:00',
    status: 'Onaylandı',
    price: 150,
    businessId: 'b1',
  },
  {
    id: 'a4',
    customerName: 'Hande Yıldız',
    customerPhone: '0535 444 55 66',
    service: 'Manikür',
    staff: 'Fatma Hanım',
    date: '2026-03-25',
    time: '14:30',
    status: 'Bekliyor',
    price: 200,
    businessId: 'b1',
  },
  {
    id: 'a5',
    customerName: 'Can Polat',
    customerPhone: '0536 555 66 77',
    service: 'Dövme — Küçük',
    staff: 'Mert Usta',
    date: '2026-03-26',
    time: '15:00',
    status: 'İptal',
    price: 800,
    businessId: 'b1',
    notes: 'Müşteri iptal etti',
  },
  {
    id: 'a6',
    customerName: 'Zeynep Avcı',
    customerPhone: '0537 666 77 88',
    service: 'Saç Boyama',
    staff: 'Neslihan Hanım',
    date: '2026-03-26',
    time: '10:00',
    status: 'Onaylandı',
    price: 650,
    businessId: 'b1',
  },
  {
    id: 'a7',
    customerName: 'Tolga Eren',
    customerPhone: '0538 777 88 99',
    service: 'Sakal Tıraş',
    staff: 'Mehmet Usta',
    date: '2026-03-26',
    time: '11:00',
    status: 'Tamamlandı',
    price: 120,
    businessId: 'b1',
  },
  {
    id: 'a8',
    customerName: 'Melis Güneş',
    customerPhone: '0539 888 99 00',
    service: 'Pedikür',
    staff: 'Fatma Hanım',
    date: '2026-03-27',
    time: '12:00',
    status: 'Bekliyor',
    price: 220,
    businessId: 'b1',
  },
  {
    id: 'a9',
    customerName: 'Serkan Kurt',
    customerPhone: '0541 999 00 11',
    service: 'İsveç Masajı',
    staff: 'Kemal Usta',
    date: '2026-03-27',
    time: '16:00',
    status: 'Onaylandı',
    price: 350,
    businessId: 'b1',
  },
  {
    id: 'a10',
    customerName: 'Burcu Aktaş',
    customerPhone: '0542 000 11 22',
    service: 'Kaş Tasarımı',
    staff: 'Neslihan Hanım',
    date: '2026-03-28',
    time: '09:30',
    status: 'Bekliyor',
    price: 180,
    businessId: 'b1',
  },
]

export const staff: Staff[] = [
  {
    id: 's1',
    name: 'Mehmet Usta',
    role: 'Berber',
    avatar: 'MU',
    appointmentsToday: 6,
    rating: 4.9,
    businessId: 'b1',
    status: 'Aktif',
    phone: '0532 100 10 10',
    email: 'mehmet@maestro.com',
  },
  {
    id: 's2',
    name: 'Neslihan Hanım',
    role: 'Stilist',
    avatar: 'NH',
    appointmentsToday: 4,
    rating: 4.8,
    businessId: 'b1',
    status: 'Aktif',
    phone: '0533 200 20 20',
    email: 'neslihan@maestro.com',
  },
  {
    id: 's3',
    name: 'Fatma Hanım',
    role: 'Tırnak Teknisyeni',
    avatar: 'FH',
    appointmentsToday: 5,
    rating: 4.7,
    businessId: 'b1',
    status: 'Aktif',
    phone: '0534 300 30 30',
    email: 'fatma@maestro.com',
  },
  {
    id: 's4',
    name: 'Kemal Usta',
    role: 'Masör',
    avatar: 'KU',
    appointmentsToday: 3,
    rating: 4.6,
    businessId: 'b1',
    status: 'Aktif',
    phone: '0535 400 40 40',
    email: 'kemal@maestro.com',
  },
  {
    id: 's5',
    name: 'Mert Usta',
    role: 'Dövme Sanatçısı',
    avatar: 'MU',
    appointmentsToday: 2,
    rating: 4.9,
    businessId: 'b1',
    status: 'Aktif',
    phone: '0536 500 50 50',
    email: 'mert@maestro.com',
  },
  {
    id: 's6',
    name: 'Elif Hanım',
    role: 'Teknisyen',
    avatar: 'EH',
    appointmentsToday: 0,
    rating: 4.5,
    businessId: 'b1',
    status: 'Pasif',
    phone: '0537 600 60 60',
    email: 'elif@maestro.com',
  },
]

export const services: Service[] = [
  {
    id: 'sv1',
    name: 'Saç Kesimi',
    duration: 30,
    price: 150,
    businessId: 'b1',
    status: 'Aktif',
    description: 'Klasik saç kesimi ve şekillendirme',
  },
  {
    id: 'sv2',
    name: 'Saç + Sakal',
    duration: 45,
    price: 250,
    businessId: 'b1',
    status: 'Aktif',
    description: 'Saç kesimi ve sakal şekillendirme paketi',
  },
  {
    id: 'sv3',
    name: 'Sakal Tıraş',
    duration: 20,
    price: 120,
    businessId: 'b1',
    status: 'Aktif',
    description: 'Geleneksel ustura ile sakal tıraşı',
  },
  {
    id: 'sv4',
    name: 'Saç Boyama',
    duration: 90,
    price: 650,
    businessId: 'b1',
    status: 'Aktif',
    description: 'Tam saç boyama hizmeti',
  },
  {
    id: 'sv5',
    name: 'Cilt Bakımı',
    duration: 60,
    price: 480,
    businessId: 'b1',
    status: 'Aktif',
    description: 'Derin temizleme ve nemlendirme',
  },
  {
    id: 'sv6',
    name: 'Kaş Tasarımı',
    duration: 20,
    price: 180,
    businessId: 'b1',
    status: 'Aktif',
  },
  {
    id: 'sv7',
    name: 'Manikür',
    duration: 40,
    price: 200,
    businessId: 'b1',
    status: 'Aktif',
  },
  {
    id: 'sv8',
    name: 'Pedikür',
    duration: 50,
    price: 220,
    businessId: 'b1',
    status: 'Pasif',
  },
]

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Argan Yağlı Şampuan',
    price: 285,
    image: '',
    stock: 24,
    businessId: 'b1',
    category: 'Saç Bakımı',
    status: 'Aktif',
  },
  {
    id: 'p2',
    name: 'Sakal Bakım Yağı',
    price: 195,
    image: '',
    stock: 15,
    businessId: 'b1',
    category: 'Sakal Bakımı',
    status: 'Aktif',
  },
  {
    id: 'p3',
    name: 'Profesyonel Saç Wax',
    price: 165,
    image: '',
    stock: 32,
    businessId: 'b1',
    category: 'Şekillendirici',
    status: 'Aktif',
  },
  {
    id: 'p4',
    name: 'Cilt Nemlendirici Krem',
    price: 320,
    image: '',
    stock: 8,
    businessId: 'b1',
    category: 'Cilt Bakımı',
    status: 'Aktif',
  },
  {
    id: 'p5',
    name: 'Tırnak Sertleştirici',
    price: 140,
    image: '',
    stock: 0,
    businessId: 'b1',
    category: 'Tırnak Bakımı',
    status: 'Pasif',
  },
  {
    id: 'p6',
    name: 'Güneş Koruyucu SPF 50',
    price: 250,
    image: '',
    stock: 18,
    businessId: 'b1',
    category: 'Cilt Bakımı',
    status: 'Aktif',
  },
]

export const users: User[] = [
  {
    id: 'u1',
    name: 'Platform Yöneticisi',
    email: 'admin@randevuhizmetleri.com',
    role: 'super_admin',
    lastLogin: '2026-03-25T08:30:00',
    status: 'Aktif',
    createdAt: '2023-01-01',
  },
  {
    id: 'u2',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@maestro.com',
    role: 'business_owner',
    businessId: 'b1',
    businessName: 'Maestro Erkek Kuaförü',
    lastLogin: '2026-03-25T07:45:00',
    status: 'Aktif',
    createdAt: '2024-01-15',
  },
  {
    id: 'u3',
    name: 'Ayşe Kara',
    email: 'ayse@bella.com',
    role: 'business_owner',
    businessId: 'b2',
    businessName: 'Bella Güzellik Salonu',
    lastLogin: '2026-03-24T18:20:00',
    status: 'Aktif',
    createdAt: '2023-11-20',
  },
  {
    id: 'u4',
    name: 'Mehmet Usta',
    email: 'mehmet@maestro.com',
    role: 'staff',
    businessId: 'b1',
    businessName: 'Maestro Erkek Kuaförü',
    lastLogin: '2026-03-25T09:00:00',
    status: 'Aktif',
    createdAt: '2024-02-01',
  },
  {
    id: 'u5',
    name: 'Mert Çelik',
    email: 'mert@darkink.com',
    role: 'business_owner',
    businessId: 'b3',
    businessName: 'Dark Ink Dövme Stüdyosu',
    lastLogin: '2026-03-23T14:10:00',
    status: 'Aktif',
    createdAt: '2024-03-05',
  },
  {
    id: 'u6',
    name: 'Selin Öztürk',
    email: 'selin@glamnails.com',
    role: 'business_owner',
    businessId: 'b4',
    businessName: 'Glam Nails & Spa',
    lastLogin: '2026-03-20T11:30:00',
    status: 'Pasif',
    createdAt: '2024-02-10',
  },
]

export const currentBusiness = businesses[0]
export const currentUser = users[1]
