# CLAUDE.md — Guia de Agente de IA para Soccer Stars

Este documento é destinado aos agentes de IA Claude trabalhando na codebase do Soccer Stars. Leia inteiramente antes de fazer qualquer alteração.

---

## 🏗️ Arquitetura do Projeto

Soccer Stars é uma aplicação Next.js 16 (App Router) de RPG de futebol single-player, inspirado no anime Ao Ashi. Construído com:

| Camada | Tecnologia | Localização |
|---|---|---|
| Framework | Next.js 16, React 19, TypeScript | `app/` |
| Game Engine | Phaser.js 3.x | `game/` |
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
  └── Phaser Scene (game/) → Renderização e lógica de partida
        └── Zustand Store (store/) → Sincronização com React
```

### Responsabilidades das Pastas

```
/
├── app/                   Next.js App Router (páginas e layouts)
│   ├── page.tsx          Tela inicial
│   ├── criar-jogador/    Criação de protagonista
│   ├── partida/          Cena de jogo Phaser
│   └── liga/             Tabela e resultados
├── components/           Componentes React reutilizáveis
│   ├── ui/               Primitivos (Botão, Input, Modal)
│   ├── jogador/          Criação e perfil de jogador
│   ├── partida/          HUD, controles de ação, placar
│   └── liga/             Tabelas, classificação
├── game/                 Phaser.js scenes e lógica de jogo
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
│   ├── player-schema.ts  Validação de atributos (12 pontos livres)
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
game/       → store/ → lib/ → types/ / schemas/
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
- **Jogadores**: 6 atributos (Chute, Drible, Passe, Bloqueio, Desarme, Interceptação)
- **Distribuição**: 1 ponto obrigatório em cada (6 pontos) + 12 pontos livres = 18 total
- **Limites**: Min 1, Max 5 por atributo
- **Goleiros**: Apenas Captura e Espalme (6 pontos totais)

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
- **Pontos**: 6 totais para distribuir

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

### Phaser
- **CRÍTICO**: Phaser DEVE rodar apenas no cliente (`"use client"`).
- **Nunca** armazenar objetos Phaser (GameObjects, Scenes) no Zustand — apenas primitivos (numbers, strings, booleans).
- Usar Zustand como ponte entre Phaser e React.
- Inicializar Phaser apenas após montagem do componente (`useEffect`).

### Estado
- **Estado da partida** (placar, posse, energia, tempo) → Zustand (`match-store.ts`)
- **Estado do jogador** (atributos, nome, avatar, time) → Zustand (`player-store.ts`) + LocalStorage
- **Estado da liga** (classificação, resultados) → Zustand (`league-store.ts`)
- Nunca armazenar objetos Phaser no Zustand. Nunca armazenar estado de UI temporário em LocalStorage.

---

## 🔒 Guardrails de Segurança

### LocalStorage
- **Dados sensíveis**: Não há dados sensíveis no MVP (sem backend, sem autenticação).
- **Validação**: Sempre validar com Zod ao carregar de LocalStorage.
- **Fallback**: Se dados corrompidos, resetar para estado inicial.

### Validação de Entrada
- Sempre validar distribuição de atributos (total = 18, min = 1, max = 5).
- Validar upload de avatar (tamanho ≤ 10MB, formatos aceitos).
- Validar número de camisa (único dentro do time).

---

## 🛠️ Como Modificar Código com Segurança

### Adicionando uma nova mecânica de jogo
1. Adicionar lógica pura em `lib/` (ex: `lib/combat.ts`).
2. Adicionar tipos em `types/` se necessário.
3. Adicionar validação Zod em `schemas/` se necessário.
4. Atualizar Zustand store em `store/` se necessário.
5. Integrar na Phaser Scene em `game/scenes/`.
6. **TDD obrigatório** (ver seção abaixo).

### Adicionando um novo componente UI
1. Verificar se um componente base em `components/ui/` já cobre a necessidade.
2. Se não, criar em `components/` no subfolder relevante.
3. Usar Zustand para estado compartilhado com Phaser.
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

- Não armazenar objetos Phaser (GameObjects, Scenes, Sprites) no Zustand — apenas primitivos.
- Não usar Phaser em Server Components — sempre `"use client"`.
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
- ✅ **Fase 1 (Parcial)**: Estrutura criada, tipos definidos, GDD documentado
- ⏳ **Próximo**: Schemas Zod, stores Zustand, lógica de combate, UI de criação de jogador

### Decisões Técnicas
- **12 times na liga** (ida e volta)
- **NPCs com nomes próprios** (times e elencos a serem definidos)
- **Avatar**: Upload de imagem, máx 10MB, múltiplos formatos aceitos
- **Número de camisa**: Aleatório dentre os disponíveis no time

### Perguntas Pendentes
- Nomes, cores e formações dos 12 times?
- Quantidade de NPCs por elenco (23 jogadores padrão)?
- Nomes dos NPCs (genéricos ou personalizados)?
- Redimensionamento automático de avatar (ex: 200x200px)?

---

## 📄 Metadados
- **Versão**: 0.1.0 (MVP)
- **Atualização**: Abril de 2026
- **Status**: Desenvolvimento Inicial

**FIM DO DOCUMENTO**
