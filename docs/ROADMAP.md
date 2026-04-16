# 🗺️ Soccer Stars - Roadmap de Implementação

**Última Atualização**: 16/04/2026  
**Status Atual**: Carreira/Partida em estabilização (React-first)

---

## 📊 Progresso Geral

```
✅ Fase 1: Fundação          100% (10/10)
✅ Fase 2: Core Logic        100% (8/8)
🚧 Fase 3: Partida (React)    80% (4/5)
🚧 Fase 4: UI/UX              60% (2/3)
📋 Fase 5: Polish              0% (0/2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Total                     78% (24/31)
```

---

## 🎯 Prioridades Imediatas

### 1. Fechar validação de hotfixes
- Validar manualmente o fluxo de troca/autosave em `/carreira/time`
- Confirmar estabilidade visual após múltiplas trocas e mudança de formação

### 2. Cobertura E2E crítica
- Fluxo de troca com persistência imediata
- Substituição automática apenas no 2º tempo
- Chute livre após vencer último defensor
- Encerramento de partida e retorno correto para `/carreira`

### 3. Consolidar UI da liga
- Tabela de conferência completa
- Resultados por rodada
- Fluxo de próxima partida consistente com o estado salvo

### 4. Sanear documentação
- Unificar regras de atributos (3 atributos, 9 pontos)
- Manter Phaser como opcional/futuro
- Garantir consistência entre `MILESTONES.md`, `docs/GDD.md`, `docs/CLAUDE.md`, `docs/GEMINI.md`

### 5. Fechar ciclo de temporada
- Estado de temporada já existe (`temporadaAtual`)
- Função de avanço já existe (`advanceSeason`)
- Virada automática após a 22ª rodada já implementada
- Falta definir UX para encerramento e início da temporada seguinte

### 6. Ajuste fino da IA de partida
- Remover prioridade fixa do protagonista para posse (concluído)
- Marcação por prioridade de zona (concluído)
- Validar balanceamento de estamina em partidas longas (pendente)

---

## ✅ Decisões Atuais

- Runtime/PM: **Bun** (v1.3.11)
- Atributos: **3 atributos** (Potência, Rapidez, Técnica), **9 pontos totais**
- Direção de implementação: **React-first** para partida
- Phaser: **pausado temporariamente** (opcional/futuro)

---

## 📚 Documentos Importantes

- `MILESTONES.md` - Status principal e marcos
- `docs/HOTFIX-EXECUCAO-16-04-2026.md` - Checklist executável dos hotfixes
- `docs/GDD.md` - Regras e design do jogo
- `docs/CLAUDE.md` - Guia operacional para agentes
- `docs/GEMINI.md` - Guia operacional alternativo

---

## 🔗 Referência Rápida

### Comandos Úteis
```bash
bun run dev          # desenvolvimento
bun run build        # build produção
bun run lint         # lint
bun run test         # testes unitários
bun run test:e2e     # testes e2e
```

### Áreas-Chave do Código
- `app/partida/` - fluxo de partida React
- `app/carreira/` - fluxo de carreira e gestão de time
- `lib/` - lógica de combate/IA/storage
- `store/` - estado global
- `tests/` e `e2e/` - cobertura automatizada

---

## 🚀 Próximo Marco

**Milestone 3**: E2E crítico + validação manual final de carreira/partida.
