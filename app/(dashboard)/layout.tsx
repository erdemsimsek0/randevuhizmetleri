import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'
import DashboardMainWrapper from '@/components/DashboardMainWrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile and business info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let businessName: string | undefined
  let businessSlug: string | undefined

  if (profile?.business_id) {
    const { data: business } = await supabase
      .from('businesses')
      .select('name, slug')
      .eq('id', profile.business_id)
      .single()

    if (business) {
      businessName = business.name
      businessSlug = business.slug
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminSidebar
        businessName={businessName}
        businessSlug={businessSlug}
        userEmail={user.email}
        userName={profile?.full_name ?? user.email}
      />
      <DashboardMainWrapper>
        {children}
      </DashboardMainWrapper>
    </div>
  )
}
