import OnboardingClient from './onboarding-client'

type OnboardingPageProps = {
  searchParams?: Promise<{
    source?: string
    status?: string
  }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = searchParams ? await searchParams : undefined
  const initialStep = params?.source === 'faceit' && params?.status === 'connected' ? 2 : 0

  return <OnboardingClient initialStep={initialStep} />
}
