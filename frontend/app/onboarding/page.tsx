import OnboardingClient from './onboarding-client'

type OnboardingPageProps = {
  searchParams?: {
    source?: string
    status?: string
  }
}

export default function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const initialStep = searchParams?.source === 'faceit' && searchParams?.status === 'connected' ? 2 : 0

  return <OnboardingClient initialStep={initialStep} />
}
