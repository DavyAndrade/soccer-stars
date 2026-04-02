# 🎯 Soccer Stars - Milestones de Desenvolvimento

> **Status Geral**: MVP em Desenvolvimento Inicial  
> **Última Atualização**: 02/04/2026  
> **Runtime**: Bun (obrigatório)

---

## 📊 Progresso Geral

```
Fase 1: Fundação        ████████░░ 80% (8/10)
Fase 2: Core Logic      ░░░░░░░░░░  0% (0/8)
Fase 3: Game Engine     ░░░░░░░░░░  0% (0/6)
Fase 4: UI/UX           ░░░░░░░░░░  0% (0/3)
Fase 5: Polish          ░░░░░░░░░░  0% (0/2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                  ███░░░░░░░ 28% (8/29)
```

---

## 🏗️ Fase 1: Fundação (80% - 8/10 completos)

### ✅ Completos
- [x] **setup-project** - Inicializar Next.js 16 com Bun
- [x] **create-readme** - Criar README.md base
- [x] **create-gdd** - Documentar mecânicas em docs/GDD.md
- [x] **create-claude-guide** - Criar docs/CLAUDE.md
- [x] **create-gemini-guide** - Criar docs/GEMINI.md
- [x] **setup-folders** - Criar estrutura de pastas
- [x] **player-types** - Definir tipos em types/player.ts
- [x] **match-types** - Definir tipos em types/match.ts (incluído em player-types)

### 🔄 Em Progresso
Nenhum

### ⏳ Pendentes
- [ ] **add-dependencies** - Instalar Phaser, Zustand, Zod, shadcn/ui
- [ ] **setup-gitignore** - Configurar .gitignore adequado

---

## 🧠 Fase 2: Core Logic (0% - 0/8 completos)

### Schemas e Validação (TDD Obrigatório)
- [ ] **player-schemas** - Zod schemas para validação de atributos
  - Validar distribuição: 12 pontos livres + 6 obrigatórios = 18 total
  - Min 1, Max 5 por atributo
  - Validar upload de avatar (10MB max)
  - Testes primeiro (Red → Green → Refactor)

- [ ] **match-schemas** - Zod schemas para ações de partida
  - Validar AcaoOfensiva, AcaoDefensiva
  - Validar mudança de zona
  - Validar consumo de energia

### Stores Zustand
- [ ] **player-store** - Estado do protagonista
  - Nome, atributos, posição, avatar, time, número
  - Persistência LocalStorage
  - Integração com Zod validation

- [ ] **match-store** - Estado da partida
  - Placar, posse, energia, tempo, zona atual
  - Histórico de ações
  - Bridge com Phaser (apenas primitivos!)

- [ ] **league-store** - Estado da liga
  - Classificação (12 times)
  - Resultados (ida e volta = 22 rodadas)
  - Próxima partida

### Lógica de Negócio (lib/)
- [ ] **combat-logic** - Sistema de confronto (TDD)
  - `resolverConfronto(atacante, defensor): ResultadoConfronto`
  - d20 + atributo vs d20 + atributo
  - Re-roll em empate
  - Testes cobrindo todos os cenários

- [ ] **ai-logic** - IA estratégica dos NPCs (TDD)
  - Decisões baseadas em: posição, energia, placar, tempo
  - Seleção de companheiro para passe
  - Defesa automática (mapeamento)

- [ ] **storage-layer** - Wrapper LocalStorage type-safe
  - save/load com validação Zod
  - Fallback para estado inicial se corrompido
  - Tratamento de erros

---

## 🎮 Fase 3: Game Engine (0% - 0/6 completos)

### Configuração Phaser
- [ ] **phaser-config** - Configurar Phaser.js
  - game/config.ts com settings mobile-first
  - Viewport mínimo 375px
  - Touch controls

- [ ] **phaser-scenes** - Criar cenas base
  - MenuScene (tela inicial)
  - PartidaScene (jogo principal)
  - ResultadoScene (fim de partida)

### Entidades e Lógica
- [ ] **campo-entity** - Renderizar campo com 5 zonas
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

### **Milestone 1: Validação e Estado (Fase 2)**
**Objetivo**: Implementar fundação de dados type-safe antes de qualquer UI/Phaser.

#### Tarefas Imediatas (TDD):
1. ✅ Instalar dependências (`add-dependencies`)
2. ✅ Configurar .gitignore (`setup-gitignore`)
3. 🔴 RED: Escrever testes para `player-schemas`
4. 🟢 GREEN: Implementar schemas Zod
5. 🔵 REFACTOR: Otimizar validação
6. 🔴 RED: Escrever testes para `player-store`
7. 🟢 GREEN: Implementar Zustand store
8. 🔵 REFACTOR: Integrar com LocalStorage

#### Critérios de Sucesso:
- [ ] Todos os schemas validam corretamente
- [ ] Cobertura de testes > 80%
- [ ] Player store persiste em LocalStorage
- [ ] Validação Zod bloqueia dados inválidos

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

### Decisões Técnicas Confirmadas
- **Liga**: 12 times (ida e volta = 22 rodadas)
- **NPCs**: Quantidade variada por time, nomes próprios
- **Avatar**: Upload 10MB max, múltiplos formatos aceitos
- **Número de Camisa**: Aleatório dentre disponíveis no time
- **Formação**: Fixa por time (não muda entre partidas)

### Perguntas Pendentes
- [ ] Definir nomes/cores dos 12 times (FUTURO)
- [ ] Quantidade exata de NPCs por time
- [ ] Nomes dos NPCs (genéricos ou personalizados?)
- [ ] Redimensionamento automático de avatar (200x200px?)

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

**Última Revisão**: 02/04/2026  
**Próximo Marco**: Milestone 1 - Validação e Estado (Fase 2)
