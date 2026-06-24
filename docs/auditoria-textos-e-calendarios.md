# Auditoria de textos e calendarios

Data da auditoria: 23/06/2026

## Direcao de produto

O Boleiro Mestre deve se apresentar como uma plataforma de palpites de futebol multi-campeonato. Textos visiveis para usuarios finais devem evitar termos de infraestrutura como Supabase, Vercel, Postgres, RLS, `.env`, API key, MVP, demo e deploy.

Mensagem central recomendada:

> Gere palpites para os proximos jogos, acompanhe probabilidades e organize suas escolhas por campeonato em uma tabela de bolao.

## Calendarios mapeados

| Campeonato | Janela usada no codigo | Observacao |
| --- | --- | --- |
| Copa do Mundo 2026 | 11/06/2026 a 19/07/2026 | Agenda local seedada para os proximos jogos da fase de grupos. |
| Campeonato Brasileiro Serie A 2026 | 28/01/2026 a 02/12/2026 | Catalogado como liga domestica, com pausa durante a Copa. Deve receber fixtures via API. |
| La Liga 2026/27 | Inicio em 15/08/2026 | Catalogada como liga domestica. Conectar partidas quando a tabela completa estiver disponivel. |
| Copa Libertadores 2026 | 03/02/2026 a 28/11/2026 | Catalogada como copa continental. Proxima janela util: mata-mata a partir de agosto. |
| UEFA Champions League 2026/27 | Qualificatorias em julho/agosto; fase de liga a partir de setembro | Catalogada para expansao futura. |

## Fontes de dados recomendadas

1. football-data.org: primeira escolha para integrar Copa, Brasileirao, La Liga, Libertadores e Champions.
2. Sportmonks Football: alternativa mais completa para fixtures, estatisticas, livescores e odds.
3. API-Football: alternativa ampla para fixtures, standings e eventos ao vivo.

## Areas do site revisadas

| Area | Problema anterior | Acao aplicada |
| --- | --- | --- |
| Home | Citava infraestrutura e focava somente na Copa. | Reposicionada para palpites multi-campeonato e beneficios do usuario. |
| Gerador | Titulos e CTA falavam apenas em Copa. | Agora fala em campeonato, proximos jogos e bolao. |
| Historico | Era historico da Copa. | Agora e "Meu bolao" multi-campeonato. |
| Login | Citava Supabase Auth, Postgres e RLS. | Agora fala em salvar historico e organizar palpites. |
| Politica de privacidade | Citava tecnologia interna. | Agora fala em conta, perfil e controles de acesso da plataforma. |
| Banner | Citava Google AdSense e banner futuro. | Agora usa texto generico de parceiros/conteudo. |
| Metadata | Usava descricao focada na Copa e dominio Vercel. | Agora usa descricao multi-campeonato e dominio de marca. |

## Proxima etapa tecnica

1. Conectar `app/api/fixtures/route.ts` ao provedor escolhido.
2. Persistir `source_provider` e `source_match_id` para evitar duplicidade.
3. Sincronizar `teams` e `matches` por competicao antes de cada rodada.
4. Revisar juridicamente politica, termos e qualquer copy relacionada a anuncios ou apostas.
