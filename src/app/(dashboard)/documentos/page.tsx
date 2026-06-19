import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBoatMembership } from '@/lib/boat'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { DOCUMENT_TYPE_LABEL } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Document } from '@/types'

function NewDocButton() {
  return (
    <Link
      href="/documentos/nuevo"
      className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition-colors"
    >
      + Nuevo
    </Link>
  )
}

function expiryVariant(date: string | null): 'danger' | 'warning' | 'success' | 'default' {
  if (!date) return 'default'
  const days = Math.floor((new Date(date).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'danger'
  if (days < 30) return 'warning'
  return 'success'
}

function expiryLabel(date: string | null): string {
  if (!date) return ''
  const days = Math.floor((new Date(date).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'Vencido'
  if (days === 0) return 'Vence hoy'
  if (days < 30) return `Vence en ${days}d`
  return `Vence ${formatDate(date)}`
}

export default async function DocumentosPage() {
  const membership = await getBoatMembership()
  if (!membership) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('boat_id', membership.boat_id)
    .order('type')
    .order('name')

  const docs = (data ?? []) as Document[]
  const editor = membership.role !== 'viewer'

  // Group by type
  const grouped = docs.reduce<Record<string, Document[]>>((acc, doc) => {
    const g = acc[doc.type] ?? []
    g.push(doc)
    acc[doc.type] = g
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <PageHeader
        title="Documentos"
        action={editor ? <NewDocButton /> : undefined}
      />

      {docs.length === 0 ? (
        <div className="flex flex-col items-center">
          <EmptyState
            title="Sin documentos"
            description="Guarda seguros, ITB, licencias y otros documentos del barco."
            icon={<span className="text-5xl">📋</span>}
          />
          {editor && (
            <Link
              href="/documentos/nuevo"
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition-colors"
            >
              Añadir documento
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type} className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 px-1">
                {DOCUMENT_TYPE_LABEL[type] ?? type}
              </h2>
              <div className="space-y-2">
                {items.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documentos/${doc.id}`}
                    className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl flex-shrink-0">
                      {doc.file_url ? '📄' : '📋'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                      {doc.expiry_date && (
                        <p className="text-xs text-slate-500 mt-0.5">{expiryLabel(doc.expiry_date)}</p>
                      )}
                    </div>
                    {doc.expiry_date && (
                      <Badge variant={expiryVariant(doc.expiry_date)} className="flex-shrink-0 text-xs">
                        {expiryVariant(doc.expiry_date) === 'danger' ? 'Vencido' :
                         expiryVariant(doc.expiry_date) === 'warning' ? 'Próximo' : 'Vigente'}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
