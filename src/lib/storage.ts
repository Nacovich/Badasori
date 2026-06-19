const BUCKET = 'boat-files'

export function buildStoragePath(
  boatId: string,
  entityType: string,
  entityId: string,
  fileName: string,
): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  return `${boatId}/${entityType}/${entityId}/${Date.now()}-${safe}`
}

export function isImage(mimeType: string | null | undefined): boolean {
  return !!mimeType && mimeType.startsWith('image/')
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export { BUCKET }
