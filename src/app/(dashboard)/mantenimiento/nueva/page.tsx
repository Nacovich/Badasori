import { redirect } from 'next/navigation'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { MaintenanceForm } from '@/components/modules/MaintenanceForm'
import { createMaintenanceItem } from '../actions'

export default async function NuevaRevisionPage() {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') redirect('/mantenimiento')

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva revisión" backHref="/mantenimiento" />
      <MaintenanceForm action={createMaintenanceItem} />
    </div>
  )
}
