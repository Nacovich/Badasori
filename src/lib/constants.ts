export const MAINTENANCE_CATEGORIES = [
  { value: 'motor', label: 'Motor' },
  { value: 'electricidad', label: 'Electricidad' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'casco', label: 'Casco' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'documentacion', label: 'Documentación' },
  { value: 'otros', label: 'Otros' },
]

export const MAINTENANCE_PERIODICITIES = [
  { value: '', label: 'Sin periodicidad' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'bienal', label: 'Bienal' },
]

export const MAINTENANCE_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  completed: 'Completado',
}

export const REPAIR_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  resolved: 'Resuelto',
}

export const EXPENSE_CATEGORIES = [
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'reparacion', label: 'Reparación' },
  { value: 'pesca', label: 'Pesca' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'equipamiento', label: 'Equipamiento' },
  { value: 'marina', label: 'Marina' },
  { value: 'otros', label: 'Otros' },
]

export const EXPENSE_CATEGORY_LABEL: Record<string, string> = {
  mantenimiento: 'Mantenimiento',
  reparacion: 'Reparación',
  pesca: 'Pesca',
  seguridad: 'Seguridad',
  equipamiento: 'Equipamiento',
  marina: 'Marina',
  otros: 'Otros',
  // valores legacy para gastos ya existentes
  gasoil: 'Gasoil',
  documentacion: 'Documentación',
  puerto: 'Puerto',
}

export const DOCUMENT_TYPES = [
  { value: 'seguro',       label: 'Seguro' },
  { value: 'itb',          label: 'ITB / Inspección' },
  { value: 'licencia',     label: 'Licencia navegación' },
  { value: 'licencia_pesca', label: 'Licencia pesca' },
  { value: 'licencia_radio', label: 'Licencia radioeléctrica' },
  { value: 'certificado',  label: 'Certificado seguridad' },
  { value: 'manual',       label: 'Manual / Catálogo' },
  { value: 'factura',      label: 'Factura' },
  { value: 'otro',         label: 'Otro' },
]

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  seguro:          'Seguro',
  itb:             'ITB / Inspección',
  licencia:        'Licencia navegación',
  licencia_pesca:  'Licencia pesca',
  licencia_radio:  'Licencia radioeléctrica',
  certificado:     'Certificado seguridad',
  manual:          'Manual / Catálogo',
  factura:         'Factura',
  otro:            'Otro',
}

export const WEATHER_OPTIONS = [
  { value: '', label: 'Sin registrar' },
  { value: 'soleado', label: '☀️ Soleado' },
  { value: 'nublado', label: '⛅ Nublado' },
  { value: 'lluvia', label: '🌧 Lluvia' },
  { value: 'viento_suave', label: '🌬 Viento suave' },
  { value: 'viento_fuerte', label: '💨 Viento fuerte' },
  { value: 'tormenta', label: '⛈ Tormenta' },
]
