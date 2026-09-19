-- Evento inicial + páginas do convite.
-- Ajuste os valores aqui ou depois pelo painel (/admin/evento).

insert into events (
  slug, couple_names, monogram, title, blessing_line, event_date,
  venue_name, venue_address, pix_key, pix_key_owner, pix_city, pix_suggestions
) values (
  'nossa-festa',
  'Guilherme & Marina',
  'GM',
  'Bodas de Trigo',
  'Três anos depois do sim, a festa que faltava',
  '2026-12-12T19:00:00-03:00',
  'Casa das Oliveiras',
  'Rua das Palmeiras, 120 — Itaipava, Petrópolis/RJ',
  null, null, 'Sao Paulo', '{50,100,200}'
)
on conflict (slug) do nothing;

insert into invite_pages (event_id, position, kind, eyebrow, title, body, background_kind, overlay, config)
select
  e.id, p.position, p.kind, p.eyebrow, p.title, p.body, 'color', p.overlay, p.config
from events e
cross join (values
  (0, 'cover',    'Com a bênção de quem caminhou conosco', null, null, 0, '{}'::jsonb),
  (1, 'menu',     'Toque nos ícones', 'para interagir', null, 0.45, jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('icon','location','label','Saiba como chegar','target','location'),
      jsonb_build_object('icon','gift','label','Para nos presentear','target','gift'),
      jsonb_build_object('icon','rsvp','label','Confirmar presença','target','rsvp'),
      jsonb_build_object('icon','gallery','label','Nossos momentos','target','gallery'),
      jsonb_build_object('icon','dresscode','label','Dress code','target','dresscode'),
      jsonb_build_object('icon','guide','label','Manual dos convidados','target','guide')
  ))),
  (2, 'rsvp',     'Confirmação de presença', 'Quem vem com você?',
      'Confirme cada pessoa da família. Se algo mudar, é só voltar neste link e atualizar.', 0, '{}'::jsonb),
  (3, 'location', 'Saiba como chegar', 'O lugar',
      'Estacionamento no local. Recomendamos chegar 30 minutos antes.', 0, '{}'::jsonb),
  (4, 'gift',     'Para nos presentear', 'Presente via PIX',
      'Sua presença já é o maior presente. Mas se quiser nos mimar, ficamos felizes com qualquer valor.', 0, '{}'::jsonb),
  (5, 'gallery',  'Nossos momentos', 'Três anos em fotos', null, 0, jsonb_build_object('gallery', '[]'::jsonb)),
  (6, 'content',  'Dress code', 'Esporte fino',
      E'Elas: vestido midi ou longo.\nEles: calça social e camisa.\n\nDeixamos o branco reservado para os anfitriões.', 0.4,
      jsonb_build_object('slug','dresscode')),
  (7, 'content',  'Manual dos convidados', 'Boas-vindas',
      E'18h — Recepção\n19h — Jantar\n21h — Festa\n\nCrianças são muito bem-vindas.\nO espaço é ao ar livre: leve um casaquinho.', 0.4,
      jsonb_build_object('slug','guide')),
  (8, 'closing',  null, 'Esperamos por você', null, 0.3, '{}'::jsonb)
) as p(position, kind, eyebrow, title, body, overlay, config)
where e.slug = 'nossa-festa'
on conflict do nothing;
