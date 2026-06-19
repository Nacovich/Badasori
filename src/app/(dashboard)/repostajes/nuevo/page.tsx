import { redirect } from 'next/navigation'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { FuelForm } from '@/components/modules/FuelForm'
import { createFuelLog } from '../actions'

export default async function NuevoRepostajePage() {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') redirect('/repostajes')

  return (
    <div className="space-y-4">
      <PageHeader title="Nuevo repostaje" backHref="/repostajes" />
      <FuelForm action={createFuelLog} />
    </div>
  )
}
