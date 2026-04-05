# 🗺️ Soccer Stars - Roadmap de Implementação

**Última Atualização**: 05/04/2026  
**Status Atual**: Fase 2 completa (Core Logic 100%), iniciando Fase 3 (Game Engine)

---

## 📊 Progresso Geral

```
✅ Fase 1: Fundação        100% (10/10)
✅ Fase 2: Core Logic      100% (8/8)
🚧 Fase 3: Game Engine       0% (0/6)
🚧 Fase 4: UI/UX             0% (0/3)
📋 Fase 5: Polish            0% (0/2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Total                   62% (18/29)
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

### ⏳ Aguardando Resposta:

#### 1. Estilo Visual do Campo
- [ ] Retângulos coloridos simples (MVP, mais rápido)
- [ ] Assets gráficos customizados

#### 2. Sprites dos Jogadores
- [ ] Círculos coloridos (verde = protagonista, vermelho = adversário)
- [ ] Sprites de jogadores importados

#### 3. Ordem de Implementação
- [ ] Começar por criação de jogador (React, mais simples)
- [ ] Começar por Phaser (game engine, mais complexo)

#### 4. Package Manager
- [ ] Instalar Bun (`curl -fsSL https://bun.sh/install | bash`)
- [ ] Continuar com npm/pnpm (mais lento mas funciona)

#### 5. Sistema de Atributos (detalhes)
- [ ] Distribuição de pontos (total, obrigatório, livre, min/max)
- [ ] Mapeamento ação → atributo (ver `docs/MUDANCAS-ATRIBUTOS.md`)
- [ ] Goleiro usa sistema separado ou igual?

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
