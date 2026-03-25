import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Business, Service, Staff, WorkingHours } from '@/lib/types'
import BookingWidget from './BookingWidget'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicBookingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'aktif')
    .single()

  if (!business) {
    notFound()
  }

  const [
    { data: services },
    { data: staffList },
    { data: workingHours },
  ] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('created_at'),
    supabase
      .from('staff')
      .select('*')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('created_at'),
    supabase
      .from('working_hours')
      .select('*')
      .eq('business_id', business.id)
      .order('day'),
  ])

  return (
    <BookingWidget
      business={business as Business}
      services={(services as Service[]) ?? []}
      staff={(staffList as Staff[]) ?? []}
      workingHours={(workingHours as WorkingHours[]) ?? []}
    />
  )
}
