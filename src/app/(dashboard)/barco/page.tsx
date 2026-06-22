import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { AttachmentSection } from '@/components/modules/AttachmentSection'
import { SociosForm } from '@/components/modules/SociosForm'
import { BoatDataForm } from '@/components/modules/BoatDataForm'
import { Anchor } from 'lucide-react'
import type { Boat } from '@/types'

export default async function BoatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('boat_members')
    .select('boat_id, role, boats(*)')
    .eq('user_id', user.id)
    .single()

  const boat = membership?.boats as unknown as Boat | null

  if (!boat) {
    return (
      <EmptyState
        title="Sin barco asignado"
        description="Contacta con el administrador."
        icon={<Anchor className="w-12 h-12" />}
      />
    )
  }

  const isAdmin = membership?.role === 'admin'
  const canEdit = membership?.role !== 'viewer'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-sky-500 rounded-xl p-2.5">
          <Anchor className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{boat.name}</h2>
      </div>

      <BoatDataForm boat={boat} isAdmin={isAdmin} />

      <SociosForm
        initialSocios={boat.socios ?? []}
        canEdit={canEdit}
      />

      <AttachmentSection
        entityType="boat"
        entityId={String(boat.id)}
        boatId={String(boat.id)}
        canEdit={canEdit}
        canDelete={isAdmin}
        returnUrl="/barco"
        title="Fotos del barco"
      />

      <p className="text-xs text-slate-400 text-center">
        Rol en este barco: <strong className="text-slate-600">{membership?.role}</strong>
      </p>
    </div>
  )
}
