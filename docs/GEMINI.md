# GEMINI.md — Guia de Agente de IA para Soccer Stars

> **Propósito**: Este documento fornece contexto estruturado sobre o projeto "Soccer Stars" para auxiliar agentes de IA (Gemini, GPT, Claude, etc.) a entender a arquitetura, tomar decisões informadas e gerar código consistente, reduzindo alucinações e aumentando a eficiência.

---

## 🎯 Visão Geral do Projeto

**Nome**: Soccer Stars  
**Tipo**: RPG de futebol single-player baseado em turnos  
**Arquitetura**: Next.js 16 (App Router) + Phaser.js + Zustand  
**Princípio Core**: **MOBILE FIRST** - Interface otimizada para dispositivos móveis com suporte a desktop. Persistência local via LocalStorage (sem backend no MVP).

### Objetivo
Sistema de jogo onde o jogador cria e evolui um protagonista no universo do anime Ao Ashi, disputando partidas 11v11 em uma liga com sistema de combate baseado em rolagens de d20 + atributos.

### Filosofia de Design
- **KISS (Keep It Simple, Stupid)**: Evitar complexidade desnecessária.
- **Mobile First**: Touch controls, viewport mínimo 375px, interface responsiva.
- **Performance**: Bun como runtime obrigatório (3x mais rápido que npm).
- **Português BR**: Todo UI, conteúdo e comentários de código em Português do Brasil.
- **TDD Obrigatório**: Ciclo Red → Green → Refactor para toda lógica de jogo.

---

## 📁 Estrutura do Projeto

```
SoccerStars/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Tela inicial
│   ├── criar-jogador/       # Criação de protagonista
│   ├── partida/             # Cena de jogo Phaser
│   └── liga/                # Tabela e resultados
│
├── components/              # Componentes React
│   ├── ui/                  # Primitivos (Botão, Input, Modal)
│   ├── jogador/             # Criação e perfil
│   ├── partida/             # HUD, controles, placar
│   └── liga/                # Tabelas, classificação
│
├── game/                    # Phaser.js (lógica de jogo)
│   ├── scenes/              # Cenas (MenuScene, PartidaScene)
│   ├── entities/            # Jogador, Bola, Campo
│   └── config.ts            # Configuração do Phaser
│
├── lib/                     # Lógica de negócio pura
│   ├── dice.ts              # Rolagens (d20, d5, d10)
│   ├── combat.ts            # Sistema de confronto
│   ├── ai.ts                # IA dos NPCs
│   └── utils.ts             # Helpers gerais
│
├── store/                   # Zustand stores
│   ├── match-store.ts       # Estado da partida
│   ├── player-store.ts      # Protagonista
│   └── league-store.ts      # Liga e classificação
│
├── schemas/                 # Zod validation
│   ├── player-schema.ts     # Validação de atributos
│   └── match-schema.ts      # Validação de ações
│
├── types/                   # TypeScript tipos
│   ├── player.ts            # Player, Goalkeeper
│   ├── match.ts             # EstadoPartida, ResultadoConfronto
│   └── team.ts              # Time, Formacao, Liga
│
└── public/                  # Assets estáticos
```

---

## 🔧 Stack Tecnológica

### Frontend
| Tecnologia | Propósito |
|-----------|-----------|
| Next.js 16 | Framework React com App Router |
| React 19 | Biblioteca UI |
| TypeScript 5 | Type safety |
| Phaser.js 3.x | Game engine 2D |
| Zustand | State management |
| Zod | Validação de schemas |
| Tailwind CSS v4 | Estilização |
| Bun | Runtime e package manager (OBRIGATÓRIO) |

---

## 🎮 Mecânicas Core do Jogo

### Sistema de Combate
```
Atacante: d20 + Atributo Ofensivo
   vs
Defensor: d20 + Atributo Defensivo

Maior vence | Empate = Re-rolar
```

**Mapeamento Automático de Defesa:**
- Chute → Bloqueio
- Drible → Desarme
- Passe → Interceptação

### Atributos de Jogador
- **6 Atributos**: Chute, Drible, Passe, Bloqueio, Desarme, Interceptação
- **Distribuição**: 1 ponto obrigatório em cada (6 pontos) + **12 pontos livres** = 18 total
- **Limites**: Mínimo 1, Máximo 5 por atributo

### Atributos de Goleiro
- **2 Atributos**: Captura, Espalme
- **Distribuição**: 6 pontos totais
- **Captura**: Vencedor mantém posse + pode passar para zona MI
- **Espalme**: Bola sobra 50/50 para qualquer time

### Sistema de Energia
- **Máximo**: 10 pontos
- **Custo**: 1 por ação (ofensiva ou defensiva)
- **Regeneração**: +5 no intervalo (limite de 10)
- **Penalidade**: 0 energia = `1d20 - 2` (sem bônus de atributo)

### Zonas do Campo
```
DF1 ← MI1 ← MC → MI2 → DF2
```
- **Início da partida**: MC (meio-campo)
- **Movimento**: Drible avança 1 zona | Passe avança para próxima zona (apenas para frente)
- **Chute**: Apenas de DF2 (`d20 + Chute`) ou MI2 (`d20 puro`)

### Posições e Zonas Permitidas
| Zona | Posições que Podem Atuar |
|------|-------------------------|
| DF1  | DF (Defensor), MF (Meio-Campista) |
| MI1  | DF, MF |
| MC   | DF, MF, FW (Forward/Atacante) |
| MI2  | MF, FW |
| DF2  | MF, FW |

### Tempo de Partida
- **Duração**: 90 minutos + acréscimos
- **Acréscimos**: 1º tempo (`1d5`) | 2º tempo (`1d10`)
- **Intervalo**: Aos 45 minutos + acréscimos do 1º tempo
- **Ações**: 1 ação por minuto (apenas se com posse de bola)

---

## 🔄 Fluxos Críticos

### 1. Criação de Jogador
```
1. Nome (input texto)
2. Posição (GK, DF, MF, FW)
3. Distribuição de Atributos (12 pontos livres, validado por Zod)
4. Upload de Avatar (max 10MB, múltiplos formatos)
5. Escolha de Time (dentre 12 pré-definidos)
6. Número de Camisa (atribuído aleatoriamente dentre disponíveis)
```

### 2. Fluxo de Partida
```
1. Início no MC (time da casa com posse)
2. Loop por minuto (até 90 + acréscimos):
   - Se com posse: Jogador escolhe ação (Chute/Drible/Passe) ou Esperar
   - Se sem posse: Jogador aguarda
   - Resolução de confronto (d20 + atributo)
   - Atualização de energia (-1 por ação)
   - Movimento de zona (se drible/passe vencedor)
3. Intervalo (regenera +5 energia)
4. 2º tempo
5. Fim: Vitória, Empate ou Derrota
```

### 3. IA dos NPCs
- **Estratégica**: Tomar decisões baseadas em posição, energia, placar e tempo restante
- **Defesa Automática**: Responde automaticamente à ação ofensiva do jogador
- **Companheiro de Time**: Escolhido aleatoriamente dentre jogadores que podem atuar na zona de destino do passe

---

## 📐 Convenções de Código

### TypeScript
- **Strict mode**: Sempre ativo
- **Sem `any`**: Usar `unknown` para casos inevitáveis
- **Tipagem explícita**: Sempre tipar retornos de função em `lib/` e `game/`
- **Interfaces vs Types**: `interface` para objetos, `type` para unions

### Nomenclatura
- **Arquivos**: `kebab-case.ts` / `kebab-case.tsx`
- **Componentes**: `PascalCase` (named export)
- **Hooks**: `useCamelCase` (prefixo `use` obrigatório)
- **Stores**: `useCamelCaseStore`
- **Phaser Scenes**: `PascalCaseScene`

### Phaser + React
- **CRÍTICO**: Phaser SEMPRE `"use client"` (nunca em Server Components)
- **Bridge**: Zustand conecta Phaser ↔ React
- **Proibido**: Armazenar objetos Phaser (GameObjects, Scenes) no Zustand — apenas primitivos
- **Inicialização**: Phaser apenas após `useEffect` (evitar SSR)

### Estado (Zustand)
- **match-store.ts**: Placar, posse, energia, tempo, zona atual
- **player-store.ts**: Nome, atributos, avatar, time, número da camisa
- **league-store.ts**: Classificação, resultados, rodadas

**Regra de Ouro**: Nunca armazenar dados de servidor (inexistente no MVP) ou objetos Phaser no Zustand.

---

## 🧪 Diretrizes de Teste

### TDD Obrigatório (Agentic TDD)

**Ciclo Red → Green → Refactor:**

1. **RED**: Escrever teste falhando (descreve comportamento esperado)
2. **GREEN**: Implementar mínimo necessário para passar
3. **REFACTOR**: Melhorar código mantendo testes verdes

**Exemplo (lib/combat.ts):**
```bash
# 1. RED
# Criar combat.test.ts com teste falhando

# 2. GREEN
# Implementar função em combat.ts

# 3. REFACTOR
# Otimizar legibilidade sem quebrar testes
```

**Proibido**: Gerar teste e implementação no mesmo passo.

### Rodando Testes
```bash
bun run test       # Testes unitários
bun run test:e2e   # Testes end-to-end (futuro)
```

---

## 🔒 Segurança e Validação

### LocalStorage
- **Validação**: Sempre validar com Zod ao carregar
- **Fallback**: Se corrompido, resetar para estado inicial
- **Sem dados sensíveis**: MVP não tem autenticação/backend

### Upload de Avatar
- **Tamanho**: Máximo 10MB
- **Formatos**: PNG, JPG, JPEG, WEBP, GIF (validar MIME type)
- **Sanitização**: Validar no frontend antes de armazenar como base64

### Distribuição de Atributos
```typescript
// Validação Zod obrigatória
const PlayerAttributesSchema = z.object({
  chute: z.number().min(1).max(5),
  drible: z.number().min(1).max(5),
  passe: z.number().min(1).max(5),
  bloqueio: z.number().min(1).max(5),
  desarme: z.number().min(1).max(5),
  interceptacao: z.number().min(1).max(5),
}).refine(
  (attrs) => Object.values(attrs).reduce((a, b) => a + b) === 18,
  { message: "Total de atributos deve ser 18" }
);
```

---

## 🛠️ Como Modificar Código

### Adicionando Nova Mecânica
1. **TDD**: Escrever teste falhando em `lib/__tests__/`
2. **Implementar**: Lógica pura em `lib/`
3. **Tipos**: Adicionar em `types/` se necessário
4. **Validação**: Schema Zod em `schemas/`
5. **Estado**: Atualizar Zustand store se necessário
6. **Integração**: Conectar Phaser Scene ou componente React

### Adicionando Componente UI
1. Verificar primitivos em `components/ui/`
2. Criar em subfolder relevante (`jogador/`, `partida/`, `liga/`)
3. Usar Tailwind CSS v4
4. Conectar a Zustand se necessário

### Comandos Úteis
```bash
bun run dev       # Dev server
bun run build     # Build de produção
bun run lint      # ESLint
bun add <pkg>     # Adicionar dependência
bun add -d <pkg>  # Dependência dev
```

---

## ❌ Proibições Absolutas

### Nunca Fazer:
- ❌ Armazenar objetos Phaser (GameObjects, Scenes) no Zustand
- ❌ Usar Phaser em Server Components (sempre `"use client"`)
- ❌ Substituir Bun por npm/yarn/pnpm
- ❌ Pular validação Zod em inputs de usuário
- ❌ Gerar teste + implementação no mesmo passo (TDD obrigatório)
- ❌ Adicionar pacotes sem autorização explícita
- ❌ Comentários que explicam *o que* (apenas *por que*)
- ❌ Lógica de jogo dentro de componentes React (usar `lib/`)
- ❌ Duplicar lógica de rolagem de dados (usar `lib/dice.ts`)
- ❌ Usar `any` em TypeScript (usar `unknown`)

### Anti-Padrões:
| ❌ Errado | ✅ Correto |
|---------|----------|
| Lógica duplicada em múltiplos arquivos | Extrair para `lib/utils.ts` |
| Super-engenharia para caso único | YAGNI (build apenas o necessário) |
| Comentários óbvios | Código auto-explicativo |
| Lógica de combate em componente | `lib/combat.ts` |
| Inventar dependências | Usar apenas `package.json` existente |

---

## 📊 Status Atual do Projeto

### Completo ✅
- Estrutura de pastas Next.js
- Tipos TypeScript (`player.ts`, `match.ts`, `team.ts`)
- Utilitários de dados (`lib/dice.ts`)
- Documentação (GDD, CLAUDE.md, GEMINI.md)

### Próximos Passos 🚧
1. Schemas Zod (`player-schema.ts`, `match-schema.ts`)
2. Stores Zustand (`match-store.ts`, `player-store.ts`, `league-store.ts`)
3. Lógica de combate (`lib/combat.ts`) — **TDD obrigatório**
4. IA dos NPCs (`lib/ai.ts`)
5. UI de criação de jogador (`components/jogador/criar-jogador.tsx`)
6. Phaser Scene de partida (`game/scenes/partida-scene.ts`)

### Decisões Técnicas
- **Liga**: Prince Takamado JFA U-18 Premier League (EAST + WEST)
  - 24 times total (12 EAST + 12 WEST)
  - EAST: Hokkaido, Tohoku, Kanto, Chubu
  - WEST: Kansai, Chugoku, Shikoku, Kyuushuu, Okinawa
  - 22 partidas por time (ida e volta dentro da conferência)
  - Final: 1º EAST vs 1º WEST
- **Times**: Baseados em times reais japoneses (escolares + times de base)
- **NPCs**: 23 jogadores por time, nomes genéricos
- **Avatar**: Upload 10MB max, múltiplos formatos
- **Número de Camisa**: 1-99, aleatório dentre disponíveis

### Perguntas Pendentes
- Selecionar 12 times EAST e 12 WEST da liga real?
- Cores/uniformes dos times?
- Formações fixas para cada time?
- Redimensionamento de avatar (ex: 200x200px)?
- Gerador de nomes genéricos para 23 NPCs por time?

---

## 📝 Disciplina de Prompt

### Ao Trabalhar em Problemas:
- **Contexto Mínimo**: Enviar apenas arquivo/função relevante (não despejar codebase)
- **Mudanças Mínimas**: Preferir patches BUSCAR/SUBSTITUIR sobre reescritas
- **Restrições Explícitas**: Declarar se assinatura de função não pode mudar

### Exemplo de Prompt Bom:
```
"Implementar função `resolverConfronto` em lib/combat.ts.
Entrada: { atacante: number, defensor: number }
Saída: { vencedor: 'atacante' | 'defensor', rolagemAtacante: number, rolagemDefensor: number }
Regra: d20 + atributo vs d20 + atributo, empate re-rola.
TDD obrigatório (teste primeiro)."
```

### Exemplo de Prompt Ruim:
```
"Fazer o jogo funcionar"
```

---

## 📄 Metadados
- **Versão**: 0.1.0 (MVP)
- **Última Atualização**: Abril de 2026
- **Status**: Desenvolvimento Inicial
- **Runtime**: Bun (obrigatório)
- **Idioma**: Português BR

**FIM DO DOCUMENTO**
