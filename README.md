# Boleiro Mestre

Plataforma Next.js para gerar palpites de futebol, organizar boloes e acompanhar previsoes por campeonato.

O dominio usa `competitions`, `teams`, `matches` e `predictions` para receber Copa do Mundo, Brasileirao, Libertadores, La Liga, Champions League e outros calendarios.

## Dados reais de jogos

O app ja tem uma agenda local da Copa 2026 para operar enquanto as integracoes oficiais nao estao conectadas. Para producao, ligue uma API em rota server-side e grave/normalize os dados nas tabelas `teams` e `matches`.

APIs indicadas:

- [football-data.org](https://www.football-data.org/): melhor primeira escolha para a primeira integracao. Tem cobertura de FIFA World Cup, Campeonato Brasileiro Serie A, La Liga e Copa Libertadores, com filtros de partidas por `dateFrom`/`dateTo` e token via `X-Auth-Token`.
- [Sportmonks Football API](https://docs.sportmonks.com/v3/endpoints-and-entities/endpoints/fixtures): boa para produto mais completo, com fixtures por data/range, livescores, estatisticas e includes como venue, participants e scores.
- [API-Football](https://www.api-football.com/documentation-v3): alternativa forte para fixtures, standings e eventos ao vivo, geralmente usada via API-SPORTS/RapidAPI.
- [TheSportsDB](https://www.thesportsdb.com/api.php): util para dados esportivos e artes em JSON, mas valide cobertura e limites antes de depender dela para agenda oficial.

Nunca chame essas APIs direto do navegador com token privado. Crie uma rota em `app/api/*`, normalize o retorno para o tipo `Match` e use a agenda local como fallback quando a API estiver indisponivel.

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

## Publicacao

Cadastre as variaveis de ambiente do arquivo `.env.example` no ambiente de hospedagem escolhido antes de publicar.
