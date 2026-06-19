import { redirect } from 'next/navigation'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { RepairForm } from '@/components/modules/RepairForm'
import { createRepair } from '../actions'

export default async function NuevaReparacionPage() {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') redirect('/reparaciones')

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva reparación" backHref="/reparaciones" />
      <RepairForm action={createRepair} />
    </div>
  )
}
