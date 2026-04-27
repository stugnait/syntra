import OnboardingClient from './onboarding-client'

type OnboardingPageProps = {
  searchParams?: Promise<{
    source?: string
    status?: string
    step?: string
  }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = searchParams ? await searchParams : undefined
  const requestedStep = Number(params?.step)
  const hasValidStep = Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep <= 3
  const initialStep = hasValidStep
    ? requestedStep
    : params?.source === 'faceit' && params?.status === 'connected'
      ? 2
      : 0

  return <OnboardingClient initialStep={initialStep} />
}
