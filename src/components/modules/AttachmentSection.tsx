import { createClient } from '@/lib/supabase/server'
import { deleteAttachment } from '@/lib/attachments'
import { UploadForm } from './UploadForm'
import { DeleteAttachmentButton } from './DeleteAttachmentButton'
import { isImage, formatFileSize, BUCKET } from '@/lib/storage'
import type { AttachmentEntityType } from '@/types'

interface Props {
  entityType: AttachmentEntityType
  entityId: string
  boatId: string
  canEdit: boolean
  canDelete: boolean
  returnUrl: string
  title?: string
}

export async function AttachmentSection({
  entityType,
  entityId,
  boatId,
  canEdit,
  canDelete,
  returnUrl,
  title = 'Adjuntos',
}: Props) {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('attachments')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  const attachments = await Promise.all(
    (rows ?? []).map(async (att) => {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(att.file_path, 3600)
      return { ...att, signedUrl: data?.signedUrl ?? null }
    }),
  )

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 text-sm">
          {title}
          {attachments.length > 0 && (
            <span className="ml-1.5 text-slate-400 font-normal">({attachments.length})</span>
          )}
        </h3>
        {canEdit && (
          <UploadForm
            entityType={entityType}
            entityId={entityId}
            boatId={boatId}
            returnUrl={returnUrl}
          />
        )}
      </div>

      {attachments.length === 0 && (
        <p className="text-sm text-slate-400">Sin archivos adjuntos</p>
      )}

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {attachments.map((att) => {
            const boundDelete = deleteAttachment.bind(null, att.id, att.file_path, returnUrl)

            return (
              <div key={att.id} className="relative group rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                {isImage(att.mime_type) && att.signedUrl ? (
                  <a href={att.signedUrl} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.signedUrl}
                      alt={att.file_name}
                      className="w-full h-24 object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={att.signedUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center h-24 gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-2xl">{att.mime_type === 'application/pdf' ? '📄' : '📎'}</span>
                    <span className="text-xs text-center px-2 leading-tight truncate w-full text-center">
                      {att.file_name}
                    </span>
                  </a>
                )}

                <div className="px-2 py-1 text-xs text-slate-500 truncate bg-white border-t border-slate-100">
                  {att.file_name}
                  {att.file_size && <span className="ml-1 text-slate-400">{formatFileSize(att.file_size)}</span>}
                </div>

                {canDelete && <DeleteAttachmentButton deleteAction={boundDelete} />}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
