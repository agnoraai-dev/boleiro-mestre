# Auditoria de textos e calendários

Data da auditoria: 23/06/2026

## Direção de produto

O Boleiro Mestre deve se apresentar como uma plataforma de palpites de futebol multi-campeonato. Textos visíveis para usuários finais devem evitar termos de infraestrutura como Supabase, Vercel, Postgres, RLS, `.env`, API key, MVP, demo e deploy.

Mensagem central recomendada:

> Gere palpites para os próximos jogos, acompanhe probabilidades e organize suas escolhas por campeonato em uma tabela de bolão.

## Calendários mapeados

| Campeonato | Janela usada no código | Observação |
| --- | --- | --- |
| Copa do Mundo 2026 | 11/06/2026 a 19/07/2026 | Agenda local seedada para os próximos jogos da fase de grupos. |
| Campeonato Brasileiro Série A 2026 | 28/01/2026 a 02/12/2026 | Catalogado como liga doméstica, com pausa durante a Copa. Deve receber fixtures via API. |
| La Liga 2026/27 | Início em 15/08/2026 | Catalogada como liga doméstica. Conectar partidas quando a tabela completa estiver disponível. |
| Copa Libertadores 2026 | 03/02/2026 a 28/11/2026 | Catalogada como copa continental. Próxima janela útil: mata-mata a partir de agosto. |
| UEFA Champions League 2026/27 | Qualificatórias em julho/agosto; fase de liga a partir de setembro | Catalogada para expansão futura. |

## Fontes de dados recomendadas

1. football-data.org: primeira escolha para integrar Copa, Brasileirão, La Liga, Libertadores e Champions.
2. Sportmonks Football: alternativa mais completa para fixtures, estatísticas, livescores e odds.
3. API-Football: alternativa ampla para fixtures, standings e eventos ao vivo.

## Áreas do site revisadas

| Área | Problema anterior | Ação aplicada |
| --- | --- | --- |
| Home | Citava infraestrutura e focava somente na Copa. | Reposicionada para palpites multi-campeonato e benefícios do usuário. |
| Gerador | Títulos e CTA falavam apenas em Copa. | Agora fala em campeonato, próximos jogos e bolão. |
| Histórico | Era histórico da Copa. | Agora é "Meu bolão" multi-campeonato. |
| Login | Citava Supabase Auth, Postgres e RLS. | Agora fala em salvar histórico e organizar palpites. |
| Política de privacidade | Citava tecnologia interna. | Agora fala em conta, perfil e controles de acesso da plataforma. |
| Banner | Citava Google AdSense e banner futuro. | Agora usa texto genérico de parceiros/conteúdo. |
| Metadata | Usava descrição focada na Copa e domínio Vercel. | Agora usa descrição multi-campeonato e domínio de marca. |

## Próxima etapa técnica

1. Conectar `app/api/fixtures/route.ts` ao provedor escolhido.
2. Persistir `source_provider` e `source_match_id` para evitar duplicidade.
3. Sincronizar `teams` e `matches` por competição antes de cada rodada.
4. Revisar juridicamente política, termos e qualquer copy relacionada a anúncios ou apostas.
