# Boleiro Mestre

Plataforma Next.js para gerar palpites de futebol, organizar bolões e acompanhar previsões por campeonato.

O domínio usa `competitions`, `teams`, `matches` e `predictions` para receber Copa do Mundo, Brasileirão, Libertadores, La Liga, Champions League e outros calendários.

## Dados reais de jogos

O app já tem uma agenda local da Copa 2026 para operar enquanto as integrações oficiais não estão conectadas. Para produção, ligue uma API em rota server-side e grave/normalize os dados nas tabelas `teams` e `matches`.

APIs indicadas:

- [football-data.org](https://www.football-data.org/): melhor primeira escolha para a primeira integração. Tem cobertura de FIFA World Cup, Campeonato Brasileiro Série A, La Liga e Copa Libertadores, com filtros de partidas por `dateFrom`/`dateTo` e token via `X-Auth-Token`.
- [Sportmonks Football API](https://docs.sportmonks.com/v3/endpoints-and-entities/endpoints/fixtures): boa para produto mais completo, com fixtures por data/range, livescores, estatísticas e includes como venue, participants e scores.
- [API-Football](https://www.api-football.com/documentation-v3): alternativa forte para fixtures, standings e eventos ao vivo, geralmente usada via API-SPORTS/RapidAPI.
- [TheSportsDB](https://www.thesportsdb.com/api.php): útil para dados esportivos e artes em JSON, mas valide cobertura e limites antes de depender dela para agenda oficial.

Nunca chame essas APIs direto do navegador com token privado. Crie uma rota em `app/api/*`, normalize o retorno para o tipo `Match` e use a agenda local como fallback quando a API estiver indisponível.

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure as variáveis do Supabase em `.env.local`. Sem elas, o app roda em modo demo, mas login e salvamento ficam indisponíveis.

## Banco Supabase

Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase. Ele cria a competição ativa, times, partidas, palpites e índices para filtros por `competition_id` e `slug`.

## Publicação

Cadastre as variáveis de ambiente do arquivo `.env.example` no ambiente de hospedagem escolhido antes de publicar.
