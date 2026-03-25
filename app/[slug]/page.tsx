import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Business, Service, Staff, WorkingHours } from '@/lib/types'
import BookingWidget from './BookingWidget'
import { getBusinessReviews } from '@/app/actions/review'

interface PageProps {
  params: Promise<{ slug: string }>
}

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: `${size}px`, color: s <= rating ? 'var(--gold)' : 'var(--dim)', lineHeight: 1 }}>
          ★
        </span>
      ))}
    </span>
  )
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
    reviews,
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
    getBusinessReviews(business.id),
  ])

  const last5Reviews = reviews.slice(0, 5)
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div>
      <BookingWidget
        business={business as Business}
        services={(services as Service[]) ?? []}
        staff={(staffList as Staff[]) ?? []}
        workingHours={(workingHours as WorkingHours[]) ?? []}
      />

      {/* Reviews Section */}
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '0 20px 48px',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '32px' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--white)',
                margin: 0,
                fontFamily: 'DM Serif Display, serif',
                letterSpacing: '-0.01em',
              }}
            >
              Yorumlar
            </h2>
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StarDisplay rating={Math.round(avgRating)} size={16} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gold)' }}>
                  {avgRating.toFixed(1)}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  ({reviews.length})
                </span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div
              style={{
                padding: '24px',
                background: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: '1.6' }}>
                Henüz yorum yok. İlk yorumu siz yapın!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {last5Reviews.map((review: {
                id: string
                customer_name: string
                rating: number
                comment: string | null
                created_at: string
              }) => (
                <div
                  key={review.id}
                  style={{
                    padding: '16px',
                    background: 'var(--bg2)',
                    border: '1px solid var(--line)',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'var(--dim)',
                          border: '1px solid var(--line2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: 'var(--white)',
                          flexShrink: 0,
                        }}
                      >
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>
                        {review.customer_name}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {formatDateShort(review.created_at)}
                    </span>
                  </div>
                  <div style={{ marginBottom: review.comment ? '8px' : '0' }}>
                    <StarDisplay rating={review.rating} size={13} />
                  </div>
                  {review.comment && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--muted)',
                        lineHeight: '1.6',
                        margin: 0,
                      }}
                    >
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
