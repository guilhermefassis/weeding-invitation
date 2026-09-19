-- Tema country: madeira, couro e latão. Aplica cores e reescreve os textos
-- das páginas do primeiro evento (o mesmo que o painel edita).
-- Rode com: npm run db:setup -- --tema country

with alvo as (select id from events order by created_at limit 1)
update events set
  theme = jsonb_build_object(
    'accent',   '#8f7a43',
    'paper',    '#f1ede1',
    'ink',      '#2b3327',
    'envelope', '#262e22',
    'seal',     '#a98a45'
  ),
  blessing_line = 'Bota o chapéu e vem comemorar com a gente'
where id in (select id from alvo);

-- ------------------------------------------------------------------ capa
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  eyebrow = 'Bota o chapéu e vem comemorar com a gente'
where kind = 'cover' and event_id in (select id from alvo);

-- ------------------------------------------------------------------ menu
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  eyebrow = 'Toque nos ícones',
  title = 'pra saber de tudo',
  config = jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('icon','location','label','Como chegar','target','location'),
    jsonb_build_object('icon','gift','label','Nos presentear','target','gift'),
    jsonb_build_object('icon','rsvp','label','Confirmar presença','target','rsvp'),
    jsonb_build_object('icon','gallery','label','Nossa história','target','gallery'),
    jsonb_build_object('icon','dresscode','label','O traje','target','dresscode'),
    jsonb_build_object('icon','guide','label','Como vai ser','target','guide')
  ))
where kind = 'menu' and event_id in (select id from alvo);

-- ------------------------------------------------------------------ rsvp
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  eyebrow = 'Confirmação de presença',
  title = 'Quem vem com você?',
  body = E'Marque cada pessoa da família. A gente precisa do número certo pra acertar a comida e as mesas.'
where kind = 'rsvp' and event_id in (select id from alvo);

-- -------------------------------------------------------------- localização
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  eyebrow = 'Como chegar',
  title = 'O lugar da festa',
  body = E'O último trecho é estrada de terra — venha com calma e sapato fechado.\nTem estacionamento no gramado.'
where kind = 'location' and event_id in (select id from alvo);

-- ------------------------------------------------------------------ pix
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  eyebrow = 'Pra nos presentear',
  title = 'Um agrado no PIX',
  body = E'Você na festa já é o melhor presente. Mas se quiser ajudar a encher a mesa, todo valor é bem-vindo.'
where kind = 'gift' and event_id in (select id from alvo);

-- ---------------------------------------------------------------- galeria
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  eyebrow = 'Nossa história',
  title = 'De lá pra cá'
where kind = 'gallery' and event_id in (select id from alvo);

-- --------------------------------------------------------------- dress code
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  eyebrow = 'O traje',
  title = 'Country raiz',
  body = E'Xadrez, jeans, bota e chapéu — o que você tiver.\nQuem não for muito do estilo, vá confortável.\n\nUm aviso prático: o chão é de terra batida, então salto fino não é boa ideia.'
where kind = 'content' and config->>'slug' = 'dresscode'
  and event_id in (select id from alvo);

-- ------------------------------------------------------------------ manual
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  eyebrow = 'Como vai ser',
  title = 'A noite inteira',
  body = E'18h — Chegada, quentão e petisco\n19h — Jantar na brasa\n21h — Sertanejo e forró até acabar\n\nA fogueira fica acesa a noite toda.\nCrianças são bem-vindas; tem espaço pra elas correrem.\nÉ ao ar livre: traga um casaco, que a serra esfria.'
where kind = 'content' and config->>'slug' = 'guide'
  and event_id in (select id from alvo);

-- -------------------------------------------------------------- encerramento
with alvo as (select id from events order by created_at limit 1)
update invite_pages set
  title = 'Te esperamos na porteira'
where kind = 'closing' and event_id in (select id from alvo);
