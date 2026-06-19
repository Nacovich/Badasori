import { redirect } from 'next/navigation'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { DocumentForm } from '@/components/modules/DocumentForm'
import { createDocument } from '../actions'

export default async function NuevoDocumentoPage() {
  const membership = await getBoatMembership()
  if (!membership || membership.role === 'viewer') redirect('/documentos')

  return (
    <div className="space-y-4">
      <PageHeader title="Nuevo documento" backHref="/documentos" />
      <DocumentForm action={createDocument} />
    </div>
  )
}
