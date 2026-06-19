import { redirect } from 'next/navigation'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { TripForm } from '@/components/modules/TripForm'
import { createTrip } from '../actions'

export default async function NuevaSalidaPage() {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') redirect('/bitacora')

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva salida" backHref="/bitacora" />
      <TripForm action={createTrip} />
    </div>
  )
}
