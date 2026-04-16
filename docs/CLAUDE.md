# CLAUDE.md — Guia de Agente de IA para Soccer Stars

Este documento é destinado aos agentes de IA Claude trabalhando na codebase do Soccer Stars. Leia inteiramente antes de fazer qualquer alteração.

---

## 🏗️ Arquitetura do Projeto

Soccer Stars é uma aplicação Next.js 16 (App Router) de RPG de futebol single-player, inspirado no anime Ao Ashi. Construído com:

| Camada | Tecnologia | Localização |
|---|---|---|
| Framework | Next.js 16, React 19, TypeScript | `app/` |
| Runtime de Partida (atual) | React/Next + lógica em `lib/` | `app/partida/`, `lib/` |
| Estado da partida | Zustand | `store/` |
| Validação | Zod | `schemas/` |
| UI components | Tailwind CSS v4 | `components/` |
| Persistência | LocalStorage (MVP) | Browser API |
| Runtime/PM | Bun | `bun.lock`, `package.json` |

### Fluxo de Arquitetura

```
Browser
  ├── React Components (components/) → UI/Menus
  │     └── Zustand Store (store/) → Estado compartilhado
  │           └── LocalStorage → Persistência
  └── Runtime de partida em React (`app/partida/`) → lógica em `lib/`
        └── Zustand Store (store/) → Sincronização de estado
```

### Responsabilidades das Pastas

```
/
├── app/                   Next.js App Router (páginas e layouts)
│   ├── page.tsx          Tela inicial
│   ├── criar-jogador/    Criação de protagonista
│   ├── partida/          Partida (React-first)
│   └── liga/             Tabela e resultados
├── components/           Componentes React reutilizáveis
│   ├── ui/               Primitivos (Botão, Input, Modal)
│   ├── jogador/          Criação e perfil de jogador
│   ├── partida/          HUD, controles de ação, placar
│   └── liga/             Tabelas, classificação
├── game/                 Opcional/futuro (Phaser pausado no escopo atual)
│   ├── scenes/           Cenas (MenuScene, PartidaScene)
│   ├── entities/         Jogador, Bola, Campo
│   └── config.ts         Configuração do Phaser
├── lib/                  Utilitários e lógica de negócio
│   ├── dice.ts           Rolagens de dados (d20, d5, d10)
│   ├── combat.ts         Sistema de confronto (chute, drible, passe)
│   ├── ai.ts             IA dos NPCs (decisões estratégicas)
│   └── utils.ts          Helpers gerais
├── store/                Zustand stores (estado global)
│   ├── match-store.ts    Estado da partida (posse, placar, energia, tempo)
│   ├── player-store.ts   Protagonista e progresso
│   └── league-store.ts   Liga, classificação, resultados
├── schemas/              Zod schemas para validação
│   ├── player-schema.ts  Validação de atributos (9 pontos totais)
│   └── match-schema.ts   Validação de ações
├── types/                TypeScript interfaces e tipos
│   ├── player.ts         Player, Goalkeeper, Attributes
│   ├── match.ts          EstadoPartida, ResultadoConfronto
│   └── team.ts           Time, Formacao, Liga
└── public/               Assets estáticos (imagens, fontes)
```

### Direção de Dependências

Dependências devem fluir **para dentro**: camadas externas podem importar de camadas internas, nunca o inverso.

```
components/ → store/ → lib/ → types/ / schemas/
game/       → store/ → lib/ → types/ / schemas/ (somente se Phaser for reativado)
```

- `lib/` (combat, ai, dice) não deve importar de `components/`, `game/`, ou `store/`.
- `store/` não deve importar de `components/` ou `game/`.
- `schemas/` e `types/` não devem importar de nenhuma outra camada local.

Exemplos proibidos:
- Uma função de combate em `lib/combat.ts` importando um componente React
- Um Zod schema importando um Phaser GameObject
- `lib/` importando `useMatchStore`

---

## 🎮 Regras do Jogo (Core Mechanics)

### Sistema de Combate
- **Fórmula**: `d20 + Atributo Ofensivo` vs `d20 + Atributo Defensivo`
- **Empate**: Re-rolar até vencedor
- **Mapeamento**: Chute → Bloqueio | Drible → Desarme | Passe → Interceptação

### Atributos
- **Jogadores**: 3 atributos (Potência, Rapidez, Técnica)
- **Distribuição**: 1 ponto obrigatório em cada (3 pontos) + 6 pontos livres = 9 total
- **Limites**: Min 1, Max 5 por atributo
- **Mapeamento**: Potência (Chute/Bloqueio), Rapidez (Drible/Desarme), Técnica (Passe/Interceptação)
- **Goleiros**: Mesmos 3 atributos com mecânica especial (Captura/Espalme calculados)

### Energia
- **Máximo**: 10 pontos
- **Custo**: 1 por ação (ofensiva ou defensiva)
- **Regeneração**: +5 no intervalo (não ultrapassa 10)
- **Penalidade**: 0 energia = `1d20 - 2` (sem bônus de atributo)

### Zonas do Campo
```
DF1 ← MI1 ← MC → MI2 → DF2
```
- **Início**: MC (meio-campo)
- **Movimento**: Drible (avança 1 zona) | Passe (próxima zona, apenas para frente)
- **Chute**: DF2 (`d20 + Chute`) ou MI2 (`d20 puro, sem modificador`)

### Tempo de Partida
- **Duração**: 90 minutos + acréscimos
- **Acréscimos**: 1º tempo (`1d5`) | 2º tempo (`1d10`)
- **Intervalo**: 45 minutos + acréscimos do 1º tempo
- **Ações**: 1 ação por minuto (se com posse)

### IA de Confronto (escopo atual)
- Sem prioridade fixa do protagonista para posse.
- Seleção de marcador por prioridade de zona (aleatório ponderado), não pelo atributo defensivo da ação.

### Temporadas
- `temporadaAtual` e `advanceSeason` ativos no storage.
- Virada automática para a próxima temporada ao concluir a rodada 22.
- Tela/UX de encerramento de temporada ainda é evolução pendente.

### Posições e Zonas
| Zona | Posições Possíveis |
|------|-------------------|
| DF1  | DF, MF |
| MI1  | DF, MF |
| MC   | DF, MF, FW |
| MI2  | MF, FW |
| DF2  | MF, FW |

### Goleiro
- **Atributos**: Captura (mantém posse + pode passar para MI) | Espalme (bola sobra 50/50)
- **Regra**: Usa os mesmos 3 atributos base com cálculo específico para Captura/Espalme

---

## 📐 Convenções

### TypeScript
- **Modo estrito ativo.** Sem `any`, sem `as unknown as X` a menos que absolutamente inevitável e comentado.
- Sempre tipificar retornos de função explicitamente em `lib/` e `game/`.
- Usar `interface` para formas de objetos, `type` para unions/intersections.
- Preferir `unknown` sobre `any` para tratamento de erros.

### Nomenclatura de Arquivos
- Arquivos: `kebab-case.tsx` / `kebab-case.ts`
- Componentes React: `PascalCase` named export
- Hooks: `useCamelCase` — sempre prefixado com `use`
- Stores: `useCamelCaseStore`
- Phaser Scenes: `PascalCaseScene`

### Componentes
- Usar `"use client"` quando um componente requer APIs do browser, event handlers, ou React hooks.
- Server Components são o padrão — manter como RSC quando possível.
- Usar Tailwind para estilização — preferir classes utilitárias sobre CSS customizado.
- Usar variáveis CSS definidas em `globals.css` para theming.

### Engine de Partida (escopo atual)
- **Atual**: Implementação React-first em `app/partida/` com lógica em `lib/`.
- **Phaser**: Pausado temporariamente; tratar `game/` como opcional.
- **Se Phaser for reativado**: rodar somente no cliente (`"use client"`) e nunca armazenar objetos de engine no Zustand.

### Estado
- **Estado da partida** (placar, posse, energia, tempo) → Zustand (`match-store.ts`)
- **Estado do jogador** (atributos, nome, avatar, time) → Zustand (`player-store.ts`) + LocalStorage
- **Estado da liga** (classificação, resultados) → Zustand (`league-store.ts`)
- Nunca armazenar objetos de engine/render no Zustand. Nunca armazenar estado de UI temporário em LocalStorage.

---

## 🔒 Guardrails de Segurança

### LocalStorage
- **Dados sensíveis**: Não há dados sensíveis no MVP (sem backend, sem autenticação).
- **Validação**: Sempre validar com Zod ao carregar de LocalStorage.
- **Fallback**: Se dados corrompidos, resetar para estado inicial.

### Validação de Entrada
- Sempre validar distribuição de atributos (total = 9, min = 1, max = 5).
- Validar upload de avatar (tamanho ≤ 10MB, formatos aceitos).
- Validar número de camisa (único dentro do time).

---

## 🛠️ Como Modificar Código com Segurança

### Adicionando uma nova mecânica de jogo
1. Adicionar lógica pura em `lib/` (ex: `lib/combat.ts`).
2. Adicionar tipos em `types/` se necessário.
3. Adicionar validação Zod em `schemas/` se necessário.
4. Atualizar Zustand store em `store/` se necessário.
5. Integrar no fluxo de partida em `app/partida/`.
6. **TDD obrigatório** (ver seção abaixo).

### Adicionando um novo componente UI
1. Verificar se um componente base em `components/ui/` já cobre a necessidade.
2. Se não, criar em `components/` no subfolder relevante.
3. Usar Zustand para estado compartilhado com o fluxo de partida.
4. Implementar no Tailwind CSS.

### Modificando lógica de combate
1. **RED**: Escrever teste falhando em `lib/combat.test.ts`.
2. **GREEN**: Implementar mínimo necessário para passar.
3. **REFACTOR**: Melhorar legibilidade.

### Rodando o projeto
```bash
bun run dev       # servidor de desenvolvimento
bun run build     # build de produção
bun run lint      # ESLint
```

### Instalando pacotes
```bash
bun add <package>        # dependência de runtime
bun add -d <package>     # dependência de dev
```

---

## ❌ Coisas que Claude NÃO DEVE Fazer

- Não armazenar objetos de engine/render no Zustand — apenas primitivos.
- Se Phaser for reativado, não usar em Server Components — sempre `"use client"`.
- Não substituir `bun` por `npm`, `yarn`, ou `pnpm` em qualquer script ou instrução.
- Não pular validação Zod em inputs de usuário (distribuição de atributos, upload de avatar).
- Não commitar arquivos de ambiente (`.env.local`) — apenas `.env.local.example`.
- Não armazenar estado de jogo (placar, energia, tempo) em LocalStorage durante a partida — apenas Zustand.
- Não gerar um teste e sua implementação no mesmo passo — seguir Agentic TDD (ver abaixo).
- Não adicionar pacotes ou dependências que não foram explicitamente solicitados.
- Não adicionar comentários que explicam *o que* o código faz — apenas comentários para decisões *por que* não óbvias.
- Não criar lógica de negócio dentro de componentes React — manter em `lib/`.
- Não duplicar lógica de rolagem de dados — usar `lib/dice.ts`.

---

## 🤖 Regras de Desenvolvimento de IA

### Agentic TDD (obrigatório)

Todas as mudanças de código envolvendo lógica devem seguir o ciclo Red → Green → Refactor:

1. **RED** — Escrever um teste falhando que descreve o comportamento esperado. Não escrever implementação ainda.
2. **GREEN** — Escrever o código mínimo necessário para fazer aquele teste passar. Nada mais.
3. **REFACTOR** — Melhorar legibilidade e reduzir complexidade. Todos os testes devem permanecer verdes.

> Nunca gerar um teste e sua implementação na mesma resposta ou passo.

### Disciplina de Prompt

Ao trabalhar em um problema específico:

- Enviar apenas o arquivo/função relevante como contexto — evitar despejar arquivos inteiros.
- Solicitar mudanças determinísticas e mínimas — preferir formato de patch **BUSCAR / SUBSTITUIR** sobre reescritas completas.
- Restrições explícitas devem ser declaradas: se uma função não deve mudar sua assinatura, dizer isso.

### Anti-padrões a Evitar

| Anti-padrão | Abordagem Correta |
|---|---|
| Lógica duplicada copiada entre arquivos | Extrair para utilitário ou hook compartilhado |
| Abstrações super-engenheiradas para um único caso de uso | YAGNI — construir apenas o que é explicitamente necessário |
| Comentários excessivos explicando código trivial | Escrever código auto-explicativo; comentar apenas decisões não óbvias |
| Lógica de domínio dentro de componentes React | Manter lógica de jogo em `lib/` |
| Inventar novos pacotes ou dependências | Usar apenas pacotes já em `package.json` a menos que explicitamente autorizado |

---

## 📝 Contexto Atual do Projeto

### Progresso
- ✅ **Fase 1 e 2**: Fundação + Core Logic concluídos
- 🚧 **Atual**: Estabilização de carreira/partida em React-first

### Decisões Técnicas
- **12 times na liga por conferência** (EAST + WEST, 24 times totais)
- **NPCs com nomes genéricos** (23 jogadores por elenco)
- **Avatar**: Upload de imagem, máx 10MB, múltiplos formatos aceitos
- **Número de camisa**: Aleatório dentre os disponíveis no time
- **Sistema de Atributos**: 3 atributos (Potência, Rapidez, Técnica) - 9 pontos totais
- **Sprites**: Círculos coloridos baseados em uniforme (verde = protagonista)
- **Campo**: Retângulos coloridos simples (MVP)

### Perguntas Pendentes
- Nomes e cores específicas dos 12 times por conferência (EAST/WEST)?
- Implementação do gerador de nomes genéricos para NPCs?
- Redimensionamento automático de avatar (ex: 200x200px)?

---

## 📄 Metadados
- **Versão**: 0.1.0 (MVP)
- **Atualização**: Abril de 2026
- **Status**: Desenvolvimento Inicial

**FIM DO DOCUMENTO**
