import { redirect } from 'next/navigation'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { FishingForm } from '@/components/modules/FishingForm'
import { createFishingLog } from '../actions'

export default async function NuevaPescaPage() {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') redirect('/pesca')

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva captura" backHref="/pesca" />
      <FishingForm action={createFishingLog} />
    </div>
  )
}
