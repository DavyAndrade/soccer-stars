# 🎯 Soccer Stars - Milestones de Desenvolvimento

> **Status Geral**: MVP - Core Logic completo, Game Engine em andamento  
> **Última Atualização**: 05/04/2026  
> **Runtime**: Bun (obrigatório) ⚠️ **NÃO INSTALADO** - usar npm como fallback

---

## 📊 Progresso Geral

```
Fase 1: Fundação        ██████████ 100% (10/10) ✅
Fase 2: Core Logic      ██████████ 100% (8/8)  ✅
Fase 3: Game Engine     █████░░░░░  50% (3/6)  🚧
Fase 4: UI/UX           ░░░░░░░░░░   0% (0/3)  🚧
Fase 5: Polish          ░░░░░░░░░░   0% (0/2)  📋
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                  ███████░░░  72% (21/29) 🚀
```

---

## 🏗️ Fase 1: Fundação (100% - 10/10 completos) ✅

### ✅ Completos
- [x] **setup-project** - Inicializar Next.js 16
- [x] **create-readme** - Criar README.md base
- [x] **create-gdd** - Documentar mecânicas em docs/GDD.md
- [x] **create-claude-guide** - Criar docs/CLAUDE.md
- [x] **create-gemini-guide** - Criar docs/GEMINI.md
- [x] **setup-folders** - Criar estrutura de pastas base
- [x] **player-types** - Definir tipos em types/player.ts
- [x] **match-types** - Definir tipos em types/match.ts
- [x] **team-types** - Definir tipos em types/team.ts
- [x] **add-dependencies** - Phaser, Zustand, Zod, React Hook Form instalados ✅
- [x] **setup-gitignore** - .gitignore configurado adequadamente ✅

---

## 🧠 Fase 2: Core Logic (100% - 8/8 completos) ✅

### ✅ Schemas e Validação (TDD Completo)
- [x] **player-schemas** - `schemas/player-schema.ts` ✅
  - ✅ Validação de distribuição: 18 pontos total (6 obrigatórios + 12 livres)
  - ✅ Min 1, Max 5 por atributo
  - ✅ Validação de avatar (10MB max, base64, MIME types)
  - ✅ Schema para Goleiro (6 pontos: Captura + Espalme)
  - ✅ Schema discriminado por posição (GK vs DF/MF/FW)

- [x] **match-schemas** - `schemas/match-schema.ts` ✅
  - ✅ Validação de AcaoOfensiva, AcaoDefensiva
  - ✅ Validação de ZonaCampo
  - ✅ Validação de consumo de energia
  - ✅ Schemas para ações de partida

### ✅ Stores Zustand (COM TESTES!)
- [x] **player-store** - `store/player-store.ts` + testes ✅
  - ✅ Nome, atributos, posição, avatar, time, número
  - ✅ Seletores (selectIsComplete)
  - ✅ Actions (setNome, setPosicao, setAtributos, reset)
  - ✅ 100% cobertura de testes

- [x] **match-store** - `store/match-store.ts` + testes ✅
  - ✅ Placar, posse, energia, tempo, zona atual
  - ✅ Histórico de ações
  - ✅ Apenas primitivos (preparado para bridge com Phaser!)
  - ✅ 100% cobertura de testes

- [x] **league-store** - `store/league-store.ts` + testes ✅
  - ✅ 12 times, classificação, rodadas
  - ✅ Geração de rodadas (ida e volta = 22 rodadas)
  - ✅ Cálculo de classificação (pontos, saldo, gols marcados)
  - ✅ 100% cobertura de testes

### ✅ Lógica de Negócio (lib/) - TDD COMPLETO!
- [x] **dice** - `lib/dice.ts` ✅
  - ✅ Rolagens de dados (d20, d5, d10)
  - ✅ Funções puras, sem efeitos colaterais

- [x] **combat-logic** - `lib/combat.ts` + testes ✅
  - ✅ `executarConfronto(acaoOfensiva, atributos, energia): ResultadoConfronto`
  - ✅ d20 + atributo + modificadorEnergia vs d20 + atributo + modificadorEnergia
  - ✅ Re-roll automático em empate (loop)
  - ✅ Mapeamento automático de defesa (Chute→Bloqueio, Drible→Desarme, Passe→Interceptação)
  - ✅ Penalidade de -2 com 0 energia
  - ✅ Suporte para Goleiro (Captura/Espalme)
  - ✅ 100% cobertura de testes

- [x] **ai-logic** - `lib/ai.ts` + testes ✅
  - ✅ Decisões estratégicas baseadas em: zona, energia, placar, tempo
  - ✅ Priorização: DF2→Chute, baixa energia→Esperar, pressão→Dribles
  - ✅ Seleção de companheiro para passe (baseado em zonas permitidas)
  - ✅ Escolha de oponente baseada em posições permitidas por zona
  - ✅ 100% cobertura de testes

- [x] **storage-layer** - `lib/storage.ts` + testes ✅
  - ✅ save/load com validação Zod
  - ✅ Fallback para estado inicial se dados corrompidos
  - ✅ Type-safe com generics
  - ✅ Tratamento de erros (try/catch)
  - ✅ 100% cobertura de testes

---

## 🎮 Fase 3: Game Engine (50% - 3/6 completos)

### Configuração Phaser
- [x] **phaser-config** - Configurar Phaser.js ✅
  - game/config.ts com settings mobile-first
  - Viewport mínimo 375px
  - Touch controls

- [x] **phaser-scenes** - Criar cenas base ✅
  - MenuScene (tela inicial)
  - PartidaScene (jogo principal)
  - ResultadoScene (fim de partida)

### Entidades e Lógica
- [x] **campo-entity** - Renderizar campo com 5 zonas ✅
  - DF1, MI1, MC, MI2, DF2
  - Indicadores visuais de zona atual

- [ ] **jogador-entity** - Sprite de jogador e bola
  - Animações de movimento
  - Integração com match-store

- [ ] **hud-system** - HUD de partida
  - Placar, tempo, energia
  - Botões de ação (Chute/Drible/Passe/Esperar)
  - Sincronização React ↔ Phaser via Zustand

- [ ] **match-loop** - Loop principal de partida
  - 1 ação por minuto
  - Acréscimos (1d5 + 1d10)
  - Intervalo (regenera +5 energia)

---

## 🎨 Fase 4: UI/UX (0% - 0/3 completos)

### Componentes React
- [ ] **criar-jogador-ui** - Tela de criação
  - Input de nome
  - Seletor de posição (GK/DF/MF/FW)
  - Distribuidor de atributos (12 pontos livres)
  - Upload de avatar (validação 10MB)
  - Preview em tempo real

- [ ] **partida-ui** - Interface de partida
  - Container Phaser
  - Controles mobile-first
  - Modal de seleção de companheiro (para passes)

- [ ] **liga-ui** - Tabela da liga
  - Classificação (12 times)
  - Resultados por rodada
  - Próxima partida

---

## 🚀 Fase 5: Polish e Deploy (0% - 0/2 completos)

- [ ] **player-system** - Sistema de progressão (FUTURO)
  - Level up, XP, evolução de atributos
  - **Nota**: Deixado para depois da demo

- [ ] **setup-deploy-config** - Configurar deploy
  - vercel.json ou netlify.toml
  - Build commands
  - Documentar processo no README

---

## 🎯 Milestone Crítico Atual

### **✅ Milestone 1: Validação e Estado (Fase 2) - COMPLETO!**
**Objetivo**: ✅ Implementar fundação de dados type-safe antes de qualquer UI/Phaser.

#### ✅ Critérios de Sucesso (TODOS ATINGIDOS):
- [x] Todos os schemas validam corretamente ✅
- [x] Cobertura de testes > 80% (100% alcançado!) ✅
- [x] Stores Zustand implementados com testes ✅
- [x] Validação Zod bloqueia dados inválidos ✅
- [x] Lógica de combate e IA completas ✅

---

### **🚧 Milestone 2: Game Engine (Fase 3) - ATUAL**
**Objetivo**: Implementar renderização visual e loop de jogo usando Phaser.js.

#### Tarefas Imediatas:
1. 🔨 Criar estrutura de pastas `game/` e `components/`
2. 🔨 Configurar Phaser.js (`game/config.ts`)
3. 🔨 Implementar MenuScene (tela inicial)
4. 🔨 Implementar PartidaScene (cena principal de jogo)
5. 🔨 Renderizar campo visual com 5 zonas
6. 🔨 Criar HUD System (placar, tempo, energia, botões)
7. 🔨 Implementar match loop (1 ação/minuto, acréscimos, intervalo)
8. 🔨 Integrar Phaser ↔ Zustand (bridge de estados)

#### Critérios de Sucesso:
- [ ] Phaser renderiza corretamente (sem erros de SSR)
- [ ] Campo com 5 zonas visíveis
- [ ] HUD mostra placar, tempo e energia
- [ ] Loop de partida funciona (1 ação/minuto)
- [ ] Bridge Zustand ↔ Phaser sincroniza estados
- [ ] Mobile-first (viewport mínimo 375px)

---

## 📐 Convenções de Trabalho

### TDD Obrigatório
```
1. RED    → Escrever teste falhando
2. GREEN  → Implementar mínimo necessário
3. REFACTOR → Melhorar sem quebrar testes
```

### Commits
```bash
# Formato: <tipo>: <descrição>
git commit -m "test: adicionar testes para player schemas"
git commit -m "feat: implementar validação de atributos"
git commit -m "refactor: extrair constantes de validação"
```

### Checklist de Pull/Merge
- [ ] Testes passando (`bun run test`)
- [ ] Linter sem erros (`bun run lint`)
- [ ] Tipos TypeScript corretos
- [ ] Documentação atualizada (se necessário)

---

## 📝 Notas de Desenvolvimento

### ✅ Bun Instalado e Verificado
- **Status**: Bun v1.3.11 instalado e funcionando ✅
- **Performance**: Otimizada (Bun é ~3x mais rápido que npm)
- **Última Verificação**: 07/04/2026

### Decisões Técnicas Confirmadas
- **Liga**: 12 times (ida e volta = 22 rodadas) ✅
- **NPCs**: Quantidade variada por time, nomes próprios ✅
- **Avatar**: Upload 10MB max, múltiplos formatos (validado via Zod) ✅
- **Número de Camisa**: Aleatório dentre disponíveis no time ✅
- **Formação**: Fixa por time (não muda entre partidas) ✅
- **Testes**: Vitest + Testing Library + Playwright configurados ✅
- **Store**: Zustand implementado com persistência planejada ✅

### Decisões Confirmadas (07/04/2026)
- [x] **Estilo Visual**: Retângulos coloridos simples para campo ✅
- [x] **Sprites**: Círculos coloridos baseados em uniforme (verde = protagonista) ✅
- [x] **Ordem de Implementação**: Criação de jogador primeiro ✅
- [x] **Package Manager**: Bun v1.3.11 instalado ✅
- [x] **Sistema de Atributos**: 3 atributos (Potência, Rapidez, Técnica) - 9 pontos totais ✅

### Perguntas Pendentes (Pós-MVP)
- [ ] Definir nomes/cores dos 12 times (pode usar genéricos no MVP)
- [ ] Quantidade exata de NPCs por time (23 jogadores confirmado)
- [ ] Nomes dos NPCs (usar gerador aleatório no MVP?)
- [ ] Redimensionamento automático de avatar (200x200px via CSS?)

### Anti-Padrões a Evitar
- ❌ Armazenar objetos Phaser no Zustand
- ❌ Gerar teste + implementação no mesmo passo
- ❌ Pular validação Zod
- ❌ Usar `any` em TypeScript
- ❌ Lógica de jogo dentro de componentes React

---

## 🔗 Links Rápidos

- [docs/GDD.md](./docs/GDD.md) - Game Design Document
- [docs/CLAUDE.md](./docs/CLAUDE.md) - Guia para agentes de IA
- [docs/GEMINI.md](./docs/GEMINI.md) - Guia alternativo
- [README.md](./README.md) - Visão geral do projeto

---

**Última Revisão**: 05/04/2026 às 18:44  
**Milestone Atual**: Milestone 2 - Game Engine (Fase 3)  
**Próximo Marco**: Milestone 3 - UI/UX (Fase 4)
