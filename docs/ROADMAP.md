# 🗺️ Soccer Stars - Roadmap de Implementação

**Última Atualização**: 05/04/2026  
**Status Atual**: Fase 3 em andamento (Game Engine base iniciada)

---

## 📊 Progresso Geral

```
✅ Fase 1: Fundação        100% (10/10)
✅ Fase 2: Core Logic      100% (8/8)
🚧 Fase 3: Game Engine      50% (3/6)
🚧 Fase 4: UI/UX             0% (0/3)
📋 Fase 5: Polish            0% (0/2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Total                   72% (21/29)
```

---

## 🎯 Próximas Tarefas Imediatas (Grupo 1)

### 1. Criar estrutura de pastas
```bash
mkdir -p game/scenes game/entities game/utils
mkdir -p components/ui components/jogador components/partida components/liga
mkdir -p app/criar-jogador app/partida app/liga
```

### 2. Configurar Phaser.js
- Criar `game/config.ts` com configuração mobile-first
- Viewport mínimo 375px
- Touch controls habilitados

### 3. Criar componentes UI primitivos
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/modal.tsx`
- `components/ui/card.tsx`

---

## 🤔 Decisões Pendentes

### ✅ Respondidas:
- **Liga**: Prince Takamado JFA U-18 (EAST + WEST, 24 times - 12 por conferência)
- **NPCs**: 23 jogadores por time, nomes genéricos
- **Atributos**: Mudança planejada de 6 → 3 (Potência/Rapidez/Técnica)

### ✅ Decisões Confirmadas (07/04/2026):

#### 1. Estilo Visual do Campo
- [x] **Retângulos coloridos simples** (MVP, mais rápido)

#### 2. Sprites dos Jogadores
- [x] **Círculos coloridos baseados nas cores do uniforme do time**
  - Verde = protagonista
  - Outras cores = baseado no uniforme do time adversário
  - ⚠️ Feature pode ter alterações futuras dependendo da implementação do game

#### 3. Ordem de Implementação
- [x] **Começar por criação de jogador** (React, mais simples)

#### 4. Package Manager
- [x] **Bun instalado e verificado** (v1.3.11 ✅)

#### 5. Sistema de Atributos
- [x] **Migração para 3 atributos confirmada** (ver `docs/MUDANCAS-ATRIBUTOS.md`)
  - Potência, Rapidez, Técnica
  - 9 pontos totais (min 1, max 5)
  - GK usa mesmo sistema com mecânica especial

---

## 📚 Documentos Importantes

- **`docs/GDD.md`** - Game Design Document completo
- **`docs/LIGA.md`** - Estrutura da Prince Takamado League
- **`docs/MUDANCAS-ATRIBUTOS.md`** - Mudança pendente (6→3 atributos)
- **`docs/CLAUDE.md`** - Guia para IA (guardrails, convenções)
- **`MILESTONES.md`** - Progresso detalhado por fase

---

## 🔗 Referência Rápida

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev           # Iniciar servidor
npm run build         # Build de produção
npm run lint          # ESLint
npm run test          # Testes unitários (Vitest)
npm run test:e2e      # Testes E2E (Playwright)

# Gerenciar dependências
npm install <pkg>     # Adicionar dependência
```

### Arquivos Chave
- `store/` - Estados Zustand (player, match, league)
- `lib/` - Lógica core (combat, ai, dice)
- `schemas/` - Validação Zod
- `types/` - Tipos TypeScript

---

## 🚀 Como Continuar

### Opção A: Aguardar Todas as Decisões
Esperar respostas às 5 perguntas antes de começar.

### Opção B: Começar com Decisões Padrão (MVP)
```
1. Campo: Retângulos coloridos simples ✅
2. Sprites: Círculos coloridos ✅
3. Ordem: Criação de jogador primeiro ✅
4. PM: Continuar com npm ✅
5. Atributos: Manter 6 atributos por ora, refatorar depois ⏳
```

### Opção C: Implementar em Paralelo
- Criar estrutura base (Grupo 1) independente das decisões
- Enquanto isso, usuário responde as perguntas
- Depois implementar UI específica baseada nas respostas

---

**Aguardando orientação do usuário para prosseguir! 🎮**
