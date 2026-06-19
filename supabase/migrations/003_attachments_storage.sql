-- ===================================================
-- Tabla de adjuntos (fotos, PDFs) ligados a registros
-- ===================================================

CREATE TABLE public.attachments (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id      uuid        NOT NULL REFERENCES public.boats(id)  ON DELETE CASCADE,
  entity_type  text        NOT NULL CHECK (entity_type IN ('repair','expense','trip','fishing_log','document')),
  entity_id    uuid        NOT NULL,
  file_name    text        NOT NULL,
  file_path    text        NOT NULL UNIQUE,   -- ruta en Storage: {boat_id}/{entity_type}/{entity_id}/…
  file_size    bigint,
  mime_type    text,
  created_by   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_attachments_entity ON public.attachments (entity_type, entity_id);
CREATE INDEX idx_attachments_boat   ON public.attachments (boat_id);

-- RLS --
CREATE POLICY "attachments_select"
  ON public.attachments FOR SELECT
  USING (public.is_boat_member(boat_id));

CREATE POLICY "attachments_insert"
  ON public.attachments FOR INSERT
  WITH CHECK (
    public.get_boat_role(boat_id) IN ('admin','editor') AND
    created_by = auth.uid()
  );

CREATE POLICY "attachments_delete"
  ON public.attachments FOR DELETE
  USING (public.get_boat_role(boat_id) = 'admin');

-- ===================================================
-- Bucket de almacenamiento (privado, límite 10 MB)
-- Ejecutar en Supabase si el bucket no existe aún
-- ===================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'boat-files',
  'boat-files',
  false,
  10485760,
  ARRAY[
    'image/jpeg','image/png','image/gif','image/webp','image/heic',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- RLS del bucket boat-files
-- La ruta siempre empieza con {boat_id}/...
-- ===================================================

CREATE POLICY "storage_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'boat-files' AND
    public.is_boat_member( (string_to_array(name,'/'))[1]::uuid )
  );

CREATE POLICY "storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'boat-files' AND
    public.get_boat_role( (string_to_array(name,'/'))[1]::uuid ) IN ('admin','editor')
  );

CREATE POLICY "storage_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'boat-files' AND
    public.get_boat_role( (string_to_array(name,'/'))[1]::uuid ) IN ('admin','editor')
  );

CREATE POLICY "storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'boat-files' AND
    public.get_boat_role( (string_to_array(name,'/'))[1]::uuid ) = 'admin'
  );
