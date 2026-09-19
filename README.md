# Convite em livro

Convite de casamento digital no formato "livro": o convidado vira as páginas
com o dedo, cada família recebe um link próprio com os nomes já preenchidos, e
tudo — textos, fotos, vídeos, ordem das páginas — é editável num painel.

O MVP é a festa de 3 anos de casamento; a estrutura já é multi-evento para
virar produto depois.

## Como funciona

| Rota | O que é |
| --- | --- |
| `/convite/[slug]` | O convite da família. O `slug` é o link único enviado no WhatsApp. |
| `/entrar` | Login dos anfitriões (Supabase Auth). |
| `/admin` | Resumo: confirmações, recados, presentes. |
| `/admin/convidados` | Famílias, convidados, link único e disparo do convite. |
| `/admin/paginas` | Conteúdo, mídia e ordem das páginas. |
| `/admin/evento` | Data, local, PIX e mensagem do WhatsApp. |

### Páginas do convite

Cada página tem um `kind` que define o comportamento, e todo o resto vem do
banco:

- `cover` — capa com monograma, nomes, data e local
- `menu` — os ícones de atalho ("toque nos ícones para interagir")
- `content` — texto livre (dress code, manual dos convidados, história...)
- `gallery` — fotos e vídeos
- `rsvp` — confirmação individual de cada pessoa da família
- `location` — mapa, endereço e rota
- `gift` — PIX com QR Code e copia-e-cola
- `closing` — encerramento

Qualquer página aceita foto ou vídeo de fundo, com controle de escurecimento
para o texto continuar legível.

### Confirmação de presença

O link único identifica a família, então o convidado não digita nada: ele vê
os nomes já cadastrados e marca "vou / não vou" para cada um. Pode voltar no
mesmo link depois para alterar.

Existe um **prazo de confirmação** (`/admin/evento`). Até lá, a página mostra
"confirme até 30 de novembro". Depois do prazo o formulário fecha — inclusive
no servidor, então não adianta tentar por fora — e quem não respondeu passa a
contar como ausente no painel. A resposta original continua guardada: o painel
diferencia "não vai" de "não respondeu no prazo".

### Presente via PIX

O BR Code é gerado no próprio app (`src/lib/pix.ts`), sem gateway e sem taxa:
o dinheiro cai direto na chave cadastrada. O convidado escolhe um valor
sugerido ou digita o dele, copia o código ou lê o QR. Como PIX estático não
notifica quem pagou, existe um campo de recado para o convidado se identificar.

### Disparo por WhatsApp

Dois modos, definidos pelo ambiente:

- **Manual (padrão, sem custo):** o painel monta a mensagem já com o link da
  família e abre o WhatsApp Web/app com tudo preenchido. Um clique por família,
  e o envio fica registrado.
- **Automático (WhatsApp Cloud API):** com `WHATSAPP_PHONE_NUMBER_ID` e
  `WHATSAPP_TOKEN` preenchidos, aparece o botão "enviar automático", que
  dispara pela API oficial da Meta. Exige conta WhatsApp Business e, para
  enviar a quem nunca te escreveu, um template aprovado.

A mensagem é um template editável com as variáveis `{saudacao}`, `{familia}`,
`{casal}`, `{titulo}`, `{data}`, `{hora}`, `{local}` e `{link}`.

## Rodando localmente

```bash
npm install
npm run dev
```

Sem `.env.local`, o app roda em **modo demonstração**: `/convite/demo` mostra o
convite com conteúdo de exemplo e nada é gravado.

Precisa de Node 20.9 ou mais novo (`node -v`).

### Se o `npm run dev` quebrar com erro do Turbopack

O Next 16 usa o Turbopack por padrão, e ele depende de binários nativos por
plataforma. Quando ele falha (um panic logo no primeiro compile), rode com o
bundler antigo:

```bash
npm run dev:webpack
```

Mesmo app, mesmo resultado — só o empacotador muda, e o start fica um pouco
mais lento. Se acontecer, vale apagar `.next` antes de tentar de novo. O mesmo
vale para o build: `npm run build:webpack`.

### Se o dev server encerrar sozinho logo depois do "Ready"

Roda em modo produção, que não depende do observador de arquivos:

```bash
npm run build:webpack && npm start
```

### Ligando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Copie `.env.example` para `.env.local` e preencha as chaves.
3. Gere um token pessoal em
   [account/tokens](https://supabase.com/dashboard/account/tokens) e ponha em
   `SUPABASE_ACCESS_TOKEN`.
4. Rode o setup:

```bash
npm run db:setup -- --email voce@exemplo.com --senha suasenha
```

Um comando faz tudo: cria as tabelas, insere o evento com as páginas do
convite, cria o bucket público `convite` para as mídias e cadastra o usuário do
painel. É idempotente — rodar de novo não duplica nada, então serve também para
aplicar mudanças de schema.

Com o token, o SQL vai pela API de gerenciamento, por HTTPS — sem depender de
conexão direta ao Postgres, que em rede IPv4 esbarra no fato de o Supabase só
publicar IPv6 nesse endereço. Quem preferir conectar no banco pode usar
`SUPABASE_DB_PASSWORD` ou `SUPABASE_DB_URL` no lugar do token.

As tabelas ficam com RLS ligado e sem policies: nada é lido direto do browser.
Todo acesso passa pelo servidor Next usando a service role key.

## Testes

```bash
npm test          # unitários (vitest): PIX, prazo de RSVP, WhatsApp, datas, slugs
npm run test:e2e  # ponta a ponta (playwright): o convite inteiro num celular
```

O e2e sobe o dev server sozinho e navega como um convidado de verdade: folheia
o livro, confirma a família, gera e copia o PIX, testa os links de rota e
confere que o painel exige login. Na primeira vez, rode `npx playwright install
chromium` para baixar o navegador.

## Deploy

Vercel, apontando para este repositório. As mesmas variáveis do `.env.local`
vão em Environment Variables. Depois, em `/admin/evento`, preencha o "endereço
do site" para os links das famílias saírem com o domínio certo.

## Próximos passos

- Lista de presentes item a item (hoje o PIX é valor livre)
- Confirmação automática de pagamento via gateway
- Múltiplos eventos por conta e temas de cor no painel
- Página de agradecimento pós-festa com as fotos
