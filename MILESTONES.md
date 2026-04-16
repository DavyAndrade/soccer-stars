# 🎯 Soccer Stars - Milestones de Desenvolvimento

> **Status Geral**: MVP - Core Logic completo, Carreira/Partida em estabilização  
> **Última Atualização**: 16/04/2026  
> **Runtime**: Bun (obrigatório) ✅ **INSTALADO** (v1.3.11)

> **Decisão Temporária**: Phaser pausado por ora. O desenvolvimento da partida seguirá em **React/Next + lógica em lib/** até nova decisão.

---

## 📊 Progresso Geral

```
Fase 1: Fundação        ██████████ 100% (10/10) ✅
Fase 2: Core Logic      ██████████ 100% (8/8)  ✅
Fase 3: Partida (React) ████████░░  80% (4/5)  🚧
Fase 4: UI/UX           ██████░░░░  60% (2/3)  🚧
Fase 5: Polish          ░░░░░░░░░░   0% (0/2)  📋
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                  ████████░░  78% (24/31) 🚀
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
  - ✅ Validação de distribuição: 9 pontos total (3 obrigatórios + 6 livres)
  - ✅ Min 1, Max 5 por atributo
  - ✅ Validação de avatar (10MB max, base64, MIME types)
  - ✅ Goleiro com os mesmos 3 atributos e mecânica especial (Captura/Espalme)
  - ✅ Schema discriminado por posição (GK vs jogadores de linha)

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

## 🎮 Fase 3: Partida Runtime (React-first, sem Phaser por ora) (80% - 4/5 completos)

### Fluxo de Partida
- [x] **partida-base** - Página de partida com preparação e início ✅
  - Escolha de uniforme (primário/secundário)
  - Pontapé inicial e posse

- [x] **match-loop** - Loop principal com tempo e logs ✅
  - 1 ação por minuto
  - Acréscimos e intervalo
  - Atualização de zona e posse

- [x] **energia-e-substituicao** - Estamina e troca automática ✅
  - Consumo por ação
  - Regeneração no intervalo
  - Substituição automática apenas no 2º tempo

- [x] **regras-especiais** - Regras críticas de confronto ✅
  - Sem prioridade fixa do protagonista na posse (evita desgaste excessivo)
  - Escolha de marcador por prioridade de zona (aleatório ponderado)
  - Chute livre após vencer último defensor na zona final

- [ ] **e2e-partida-critica** - Cobertura E2E dos cenários críticos
  - Substituição automática no 2º tempo
  - Chute livre pós último defensor
  - Fluxo completo de rodada até retorno da carreira

---

## 🎨 Fase 4: UI/UX (60% - 2/3 completos)

### Componentes React
- [x] **criar-jogador-ui** - Tela de criação ✅
  - Input de nome
  - Seletor de posição (GK/DF/MF/FW)
  - Distribuidor de atributos (9 pontos totais)
  - Upload de avatar (validação 10MB)
  - Preview em tempo real

- [x] **partida-ui** - Interface de partida ✅
  - Container React
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

- [ ] **season-transition** - Virada de temporada (PENDENTE)
  - Estado de temporada existe (`temporadaAtual`) ✅
  - Função de avanço existe em `lib/storage.ts` (`advanceSeason`) ✅
  - Integração automática ao finalizar a 22ª rodada ✅
  - Tela/fluxo de encerramento de temporada ❌

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

### **🚧 Milestone 2: Carreira/Partida Estável (React-first) - ATUAL**
**Objetivo**: estabilizar os fluxos de carreira e partida sem dependência de Phaser nesta fase.

#### Tarefas Imediatas:
1. 🔨 Finalizar validação manual do fluxo `/carreira/time` (trocas + autosave)
2. 🔨 Cobrir hotfixes críticos com E2E
3. 🔨 Consolidar UI da liga e fluxo completo de rodada
4. 🔨 Revisar documentação para remover conflitos (atributos, liga, progresso)
5. 🔨 Definir regra de encerramento da temporada ao final da 22ª rodada

#### Critérios de Sucesso:
- [x] Troca titular/reserva persiste imediatamente (coberto por teste unitário)
- [x] Ordenação por posição aplicada nas listas da escalação
- [x] Regras críticas de partida implementadas (prioridade protagonista, chute livre, autosub 2º tempo)
- [ ] E2E cobre os 3 cenários críticos de carreira/partida
- [ ] Validação manual final dos fluxos `/carreira/time` e `/partida`

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

### Atualização recente — Modo Carreira
- ✅ Fluxo `/carreira` → `/partida` com **próxima partida por rodada** implementado
- ✅ Persistência de resultado em save por slot (`resultados` + `rodadaAtual`)
- ✅ Tabela da conferência em `/carreira/time` agora usa estatísticas reais (**Pts, PJ, V, E, D**)
- ✅ Estrutura de dados de carreira preservada ao editar protagonista/escalação (sem perder histórico da liga)
- ✅ Partida deixou de aceitar placar manual: resultado agora vem da gameplay em `/partida`
- ✅ Finalização de rodada simula automaticamente os demais confrontos da EAST/WEST e avança a temporada regular
- ✅ Virada automática de temporada ao concluir a rodada 22 (rodada reinicia em 1)
- ✅ IA da partida ajustada: removida prioridade fixa do protagonista e marcador por prioridade de zona

### 🚨 Hotfix imediato (estado atual)
- [x] Fluxo de substituição em `/carreira/time` (campo ↔ reservas) com persistência imediata por troca
- [ ] Revisar sincronização de estado após autosave da escalação (evitar reset visual de titulares/formação) **(validação manual pendente)**
- [x] Layout desktop da Escalação: campo à esquerda e reservas à direita
- [x] Ordenação por posição em todas as listas da Escalação (GK → DF → MF → FW)
- [x] Revalidação técnica no `/partida`:
  - sem prioridade fixa do protagonista
  - marcador escolhido por prioridade de zona
  - chute livre após vencer último defensor
  - substituição automática só no 2º tempo
- [ ] Executar validação final manual dos fluxos `/carreira/time` e `/partida`

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
- ❌ Armazenar objetos de engine/render no Zustand
- ❌ Gerar teste + implementação no mesmo passo
- ❌ Pular validação Zod
- ❌ Usar `any` em TypeScript
- ❌ Lógica de jogo dentro de componentes React

---

## 🔗 Links Rápidos

- [docs/GDD.md](./docs/GDD.md) - Game Design Document
- [docs/CLAUDE.md](./docs/CLAUDE.md) - Guia para agentes de IA
- [docs/GEMINI.md](./docs/GEMINI.md) - Guia alternativo
- [docs/HOTFIX-EXECUCAO-16-04-2026.md](./docs/HOTFIX-EXECUCAO-16-04-2026.md) - Checklist executável dos hotfixes
- [README.md](./README.md) - Visão geral do projeto

---

**Última Revisão**: 16/04/2026 às 19:10  
**Milestone Atual**: Milestone 2 - Carreira/Partida Estável (React-first)  
**Próximo Marco**: Milestone 3 - E2E crítico + validação manual final
