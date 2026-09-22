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

### Envelope de entrada

O convite abre lacrado: envelope escuro, monograma em relevo, lacre de cera com
as iniciais do casal e uma etiqueta com o nome da família — a mesma saudação
usada no WhatsApp. Um toque rompe o lacre e revela o livro. O envelope aparece
sempre que houver monograma cadastrado; sem ele, o convite abre direto na capa.

### Cores e temas

Em `/admin/evento` dá para trocar as cinco cores do convite: destaque, papel,
texto, envelope e lacre. Elas viram custom properties aplicadas na raiz do
convite, então valem para tudo — filetes, ícones, botões e o lacre.

A seção **Tipografia** troca a fonte do convite inteiro. A escolha é de
combinação, não de peça solta: cada opção traz a fonte dos nomes e a do texto
que foram pensadas para conviver — Clássico, Romântico, Editorial, Moderno e
Rústico. Os cartões são desenhados na própria fonte, então dá para escolher
olhando, e o tamanho do texto vai de 85% a 125%.

O tamanho sai do `font-size` da raiz, em porcentagem: como o convite mede tudo
em `rem`, texto e espaçamento crescem juntos e a página continua equilibrada —
e quem aumentou a fonte no navegador continua sendo respeitado. Os poucos
pontos que medem em `vw` (os nomes na capa, a etiqueta do envelope) leem a
variável `--font-scale` para crescer na mesma proporção.

Só o par padrão é pré-carregado; os outros entram com `preload: false`, então a
declaração vai no CSS mas o navegador só baixa a família que o tema usa.

Na mesma tela, a seção **Envelope** ajusta o tamanho do lacre, das iniciais
gravadas nele e das iniciais em relevo, de 50% a 180% do padrão. São
multiplicadores, não medidas fixas: o convite continua se adaptando à tela do
aparelho. Ao lado dos controles fica uma prévia em miniatura, na proporção de
um celular, que responde enquanto você arrasta.

Para trocar o clima inteiro de uma vez, `supabase/temas/` guarda temas prontos
que mexem em cores e textos juntos:

```bash
npm run db:setup -- --tema country
```

Cada tema é um `.sql` que atualiza o evento e as páginas. Depois de aplicar, o
painel continua mandando: qualquer ajuste manual sobrescreve o tema.

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

### Galeria de fotos

A página `gallery` ("Nossos momentos") já vem no convite, vazia. Em
`/admin/paginas` ela abre com uma grade de miniaturas na mesma ordem em que o
convidado vai ver: o envio aceita vários arquivos de uma vez, `←` e `→` movem
uma foto de lugar e `✕` remove — apagando também o arquivo do Storage. A
legenda vale só quando você envia um arquivo por vez, senão a mesma frase
cairia embaixo de todas as fotos. Vídeos entram na mesma grade e aparecem no
convite com controles.

### Tela cheia no celular

O livro ocupa exatamente a área visível: a altura vem de `svh`, a única
unidade que já conta com as barras do Safari na tela — com `dvh` o iPhone
resolve a altura como se elas estivessem recolhidas e o rodapé do convite fica
escondido embaixo da barra de endereço. O documento não rola; quem rola é o
texto dentro da página, então as barras não somem e voltam a cada gesto. E
`viewport-fit=cover` mais `env(safe-area-inset-*)` mantêm a navegação e o botão
de música longe do entalhe e do indicador de home.

Para tirar as barras do navegador de vez, o convite tem manifest e abre em
modo aplicativo: no iPhone, **Compartilhar → Adicionar à Tela de Início**; no
Android, **⋮ → Instalar aplicativo**. Salvo assim, ele abre sem barra nenhuma e
volta direto para o convite da família, não para a home do site.

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

## Deploy na Vercel

1. [vercel.com/new](https://vercel.com/new) → importe o repositório. Ela
   reconhece Next.js sozinha; não mexa em build command nem output directory.
2. Em **Environment Variables**, só estas três:

   | Variável | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | a URL do projeto |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave `sb_publishable_...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | a chave `sb_secret_...` |

   O `SUPABASE_ACCESS_TOKEN` e a senha do banco **não vão** — são só do
   `db:setup`, que roda da sua máquina.
3. Confira em Settings → Git que a **Production Branch** é a que você usa.
4. Depois do primeiro deploy, em `/admin/evento`, preencha o "endereço do site"
   com a URL da Vercel. É de lá que sai o link de cada família no WhatsApp; sem
   isso os links saem com o host da requisição.

Sem as variáveis o deploy sobe do mesmo jeito, em modo demonstração — serve
para ver o convite antes de ligar o banco.

## Próximos passos

- Lista de presentes item a item (hoje o PIX é valor livre)
- Confirmação automática de pagamento via gateway
- Múltiplos eventos por conta e temas de cor no painel
- Página de agradecimento pós-festa com as fotos
