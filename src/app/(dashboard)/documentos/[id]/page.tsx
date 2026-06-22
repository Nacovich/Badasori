import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { DocumentForm } from '@/components/modules/DocumentForm'
import { Badge } from '@/components/ui/Badge'
import { updateDocument, deleteDocument } from '../actions'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { DOCUMENT_TYPE_LABEL } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { BUCKET } from '@/lib/storage'
import type { Document } from '@/types'

export default async function DocumentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('boat_id', membership.boat_id)
    .single()

  if (!data) notFound()

  const item = data as Document
  const editor = membership.role !== 'viewer'
  const admin = membership.role === 'admin'
  const updateAction = updateDocument.bind(null, id)
  const deleteAction = deleteDocument.bind(null, id)

  // Generate signed URL for the file if it exists
  let fileUrl: string | null = null
  if (item.file_url) {
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(item.file_url, 60 * 60 * 24 * 7)
    fileUrl = signed?.signedUrl ?? null
  }

  const days = item.expiry_date
    ? Math.floor((new Date(item.expiry_date).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className="space-y-4">
      <PageHeader title={editor ? 'Editar documento' : 'Documento'} backHref="/documentos" />

      {/* File viewer */}
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 hover:bg-blue-100 transition-colors"
        >
          <span className="text-2xl">📄</span>
          <div>
            <p className="text-sm font-medium text-blue-800">Ver / descargar archivo</p>
            <p className="text-xs text-blue-600 mt-0.5">Archivo guardado · enlace válido 7 días</p>
          </div>
        </a>
      )}

      {/* Expiry alert */}
      {item.expiry_date && days != null && days < 60 && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${days < 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
          {days < 0
            ? `Documento vencido hace ${Math.abs(days)} días`
            : days === 0
            ? 'El documento vence hoy'
            : `El documento vence en ${days} días (${formatDate(item.expiry_date)})`}
        </div>
      )}

      {editor ? (
        <DocumentForm action={updateAction} item={item} />
      ) : (
        <dl className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 text-sm">
          {[
            { label: 'Tipo', value: DOCUMENT_TYPE_LABEL[item.type] ?? item.type },
            { label: 'Nombre', value: item.name },
            { label: 'Vencimiento', value: item.expiry_date ? formatDate(item.expiry_date) : '—' },
            { label: 'Notas', value: item.notes ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-4 py-3 gap-4">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {admin && (
        <ConfirmDeleteButton
          action={deleteAction}
          message="¿Eliminar este documento y su archivo?"
          label="Eliminar documento"
        />
      )}
    </div>
  )
}
