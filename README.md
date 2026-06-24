# Boleiro Mestre

Projeto Next.js com TypeScript, Tailwind CSS, App Router, Supabase Auth/Postgres e rota server-side para comentarios com IA.

O MVP esta focado na Copa do Mundo 2026 (`copa-do-mundo-2026`), mas o dominio usa `competitions`, `teams`, `matches` e `predictions` para permitir novos campeonatos depois, como Brasileirao, Libertadores, Champions League e jogos avulsos.

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure as variaveis do Supabase em `.env.local`. Sem elas, o app roda em modo demo, mas login e salvamento ficam indisponiveis.

## Banco Supabase

Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase. Ele cria a competicao ativa, times, partidas, palpites e indices para filtros por `competition_id` e `slug`.

## Ingestao API-Football

O arquivo `database/api_football_schema.sql` contem o DDL relacional para a base externa usada pelo motor de probabilidades. A funcao serverless `api/football_sync.py` foi desenhada para Vercel Cron e roda pela rota `/api/football_sync`.

Configure `API_FOOTBALL_KEY`, `DATABASE_URL`, `API_FOOTBALL_LEAGUE_ID`, `API_FOOTBALL_SEASON` e, opcionalmente, `CRON_SECRET` no painel da Vercel. O `vercel.json` agenda a execucao em `0 * * * *`.

## Deploy

O projeto esta pronto para Vercel. Cadastre as variaveis de ambiente do arquivo `.env.example` no painel do projeto.
