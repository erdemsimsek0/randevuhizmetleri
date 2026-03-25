export const BUSINESS_TYPES = [
  { value: 'berber', label: 'Berber', positions: ['Berber Ustası', 'Kalfa', 'Çırak'] },
  { value: 'kadin_kuafor', label: 'Kadın Kuaförü', positions: ['Kuaför', 'Stilist', 'Boyacı', 'Asistan'] },
  { value: 'erkek_kuafor', label: 'Erkek Kuaförü', positions: ['Kuaför Ustası', 'Berber', 'Asistan'] },
  { value: 'guzellik_salonu', label: 'Güzellik Salonu', positions: ['Estetisyen', 'Makyaj Sanatçısı', 'Nail Art Uzmanı', 'Kaş Tasarım Uzmanı', 'Asistan'] },
  { value: 'dovme_studyosu', label: 'Dövme Stüdyosu', positions: ['Dövme Sanatçısı', 'Piercing Uzmanı', 'Asistan'] },
  { value: 'spor_salonu', label: 'Spor Salonu', positions: ['Personal Trainer', 'Fitness Eğitmeni', 'Yoga Eğitmeni', 'Pilates Eğitmeni', 'Beslenme Koçu'] },
  { value: 'masaj_merkezi', label: 'Masaj Merkezi', positions: ['Masaj Terapisti', 'Fizyoterapist', 'Refleksoloji Uzmanı'] },
  { value: 'dis_klinigi', label: 'Diş Kliniği', positions: ['Diş Hekimi', 'Ortodontist', 'Diş Asistanı', 'Diş Teknisyeni'] },
  { value: 'veteriner', label: 'Veteriner Kliniği', positions: ['Veteriner Hekim', 'Veteriner Teknikeri', 'Pet Groomer'] },
  { value: 'diyetisyen', label: 'Diyetisyen / Beslenme', positions: ['Diyetisyen', 'Beslenme Uzmanı', 'Sağlık Koçu'] },
  { value: 'fizik_tedavi', label: 'Fizik Tedavi', positions: ['Fizyoterapist', 'Egzersiz Uzmanı', 'Masör'] },
  { value: 'fotograf_studyosu', label: 'Fotoğraf Stüdyosu', positions: ['Fotoğrafçı', 'Video Editörü', 'Asistan'] },
  { value: 'dil_kursu', label: 'Dil Kursu / Eğitim', positions: ['Eğitmen', 'Öğretmen', 'Asistan'] },
  { value: 'diger', label: 'Diğer', positions: ['Uzman', 'Asistan', 'Danışman'] },
]

export function getPositionsForType(businessType: string): string[] {
  const found = BUSINESS_TYPES.find(t => t.value === businessType)
  return found?.positions ?? ['Uzman', 'Asistan']
}

export function getLabelForType(businessType: string): string {
  const found = BUSINESS_TYPES.find(t => t.value === businessType)
  return found?.label ?? businessType
}
