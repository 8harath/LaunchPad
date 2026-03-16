import { NextResponse } from 'next/server'
import { FALLBACK_HIRING_INSIGHTS, FALLBACK_SUCCESS_STORIES } from '@/lib/recruitment'
import { serverSupabase } from '@/lib/server-supabase'

const fallbackReviews = [
  {
    id: 'review-1',
    company_name: 'Freshworks',
    reviewer_name: 'Campus hire',
    reviewer_role: 'Frontend Engineer',
    rating: 5,
    title: 'Structured interviews and fast feedback',
    review:
      'The process was clear, the team shared expectations early, and each round focused on practical problem-solving.',
    outcome: 'Offer received',
  },
  {
    id: 'review-2',
    company_name: 'Chargebee',
    reviewer_name: 'Internship applicant',
    reviewer_role: 'Backend Intern',
    rating: 4,
    title: 'Strong technical depth',
    review:
      'The interviewers cared about API design and ownership. Sharing project tradeoffs helped more than memorized answers.',
    outcome: 'Shortlisted',
  },
  {
    id: 'review-3',
    company_name: 'Razorpay',
    reviewer_name: 'Analyst candidate',
    reviewer_role: 'Product Analyst',
    rating: 4,
    title: 'Practical case-based assessment',
    review:
      'The hiring flow included realistic product thinking exercises and useful recruiter follow-up after each stage.',
    outcome: 'Interview scheduled',
  },
]

export async function GET() {
  try {
    const [reviewsResult, storiesResult, insightsResult] = await Promise.all([
      serverSupabase
        .from('company_reviews')
        .select('id, reviewer_name, reviewer_role, rating, title, review, outcome, companies:company_id(name)')
        .limit(6),
      serverSupabase.from('success_stories').select('*').limit(6),
      serverSupabase.from('hiring_insights').select('*').limit(6),
    ])

    const reviews =
      !reviewsResult.error && reviewsResult.data?.length
        ? reviewsResult.data.map((review) => {
            const companyRelation = Array.isArray(review.companies) ? review.companies[0] : review.companies

            return {
              id: review.id,
              company_name: companyRelation?.name || 'Company',
              reviewer_name: review.reviewer_name,
              reviewer_role: review.reviewer_role,
              rating: review.rating,
              title: review.title,
              review: review.review,
              outcome: review.outcome,
            }
          })
        : fallbackReviews

    const stories =
      !storiesResult.error && storiesResult.data?.length
        ? storiesResult.data
        : FALLBACK_SUCCESS_STORIES.map((story, index) => ({
            id: `story-${index + 1}`,
            ...story,
          }))

    const insights =
      !insightsResult.error && insightsResult.data?.length
        ? insightsResult.data
        : FALLBACK_HIRING_INSIGHTS.map((insight, index) => ({
            id: `insight-${index + 1}`,
            ...insight,
          }))

    return NextResponse.json({ reviews, stories, insights })
  } catch (error) {
    console.error('Error fetching community content:', error)

    return NextResponse.json({
      reviews: fallbackReviews,
      stories: FALLBACK_SUCCESS_STORIES.map((story, index) => ({
        id: `story-${index + 1}`,
        ...story,
      })),
      insights: FALLBACK_HIRING_INSIGHTS.map((insight, index) => ({
        id: `insight-${index + 1}`,
        ...insight,
      })),
    })
  }
}
