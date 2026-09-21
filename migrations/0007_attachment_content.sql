alter table roc_attachments
  add column if not exists content_base64 text not null default '';
