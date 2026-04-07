# ⚠️ MUDANÇAS PENDENTES - Sistema de Atributos

**Data**: 05/04/2026  
**Status**: Aguardando especificação completa

---

## 🔄 Mudança: Sistema de Atributos Simplificado

### ❌ Sistema Antigo (6 atributos)
- Chute
- Drible
- Passe
- Bloqueio
- Desarme
- Interceptação

**Total**: 18 pontos (6 obrigatórios + 12 livres)

### ✅ Novo Sistema (3 atributos)
- **Potência**
- **Rapidez**
- **Técnica**

**Total**: A definir (aguardando especificação)

---

## 📋 Arquivos Afetados pela Mudança

### Precisa Atualizar:
1. ✅ `types/player.ts` - Interface `PlayerAttributes`
2. ✅ `schemas/player-schema.ts` - Validação Zod (distribuição de pontos)
3. ✅ `lib/combat.ts` - Mapeamento de ações → atributos
4. ✅ `store/player-store.ts` - Tipos (mínimo)
5. ✅ Testes relacionados (player-store.test.ts, combat.test.ts)
6. ✅ `docs/GDD.md` - Documentação de mecânicas
7. ✅ `docs/CLAUDE.md` - Guardrails
8. ✅ `docs/GEMINI.md` - Guardrails

### UI Futura (ainda não implementada):
- `components/jogador/distribuidor-atributos.tsx` - Sliders/contadores
- Criação de jogador será mais simples (3 atributos vs 6)

---

## ✅ Especificação Completa (07/04/2026)

### Distribuição de Pontos
- [x] **Total de pontos**: 9 pontos para distribuir
- [x] **Pontos obrigatórios**: Mínimo 1 em cada atributo (3 pontos obrigatórios)
- [x] **Pontos livres**: 6 pontos livres para distribuir
- [x] **Min/Max por atributo**: Mínimo 1, Máximo 5

### Mapeamento Ação → Atributo
- [x] **Chute** → **Potência**
- [x] **Drible** → **Rapidez**
- [x] **Passe** → **Técnica**
- [x] **Bloqueio** (defesa de chute) → **Potência**
- [x] **Desarme** (defesa de drible) → **Rapidez**
- [x] **Interceptação** (defesa de passe) → **Técnica**

### Goleiro
- [x] **Goleiro usa os mesmos 3 atributos** (Potência, Rapidez, Técnica)
- [x] **Mesma distribuição**: 9 pontos totais (min 1, max 5)
- [x] **Mecânica especial de defesa**:
  - **Escolha aleatória** entre Captura ou Espalme (rolagem ou 50/50)
  - **Espalme**: `d20 + floor((Potência + Rapidez) / 2)`
  - **Captura**: `d20 + floor((Potência + Técnica) / 2)`
  - **Arredondamento**: Sempre para baixo (floor)

---

## ✅ Mapeamento Confirmado (Opção A: Mapeamento Direto)

### Jogadores de Campo
```
Ofensivo:
- Chute → Potência
- Drible → Rapidez  
- Passe → Técnica

Defensivo:
- Bloqueio → Potência
- Desarme → Rapidez
- Interceptação → Técnica
```

### Goleiro (Mecânica Especial)
```
1. Sistema sorteia aleatoriamente: Captura ou Espalme
2. Cálculo de defesa:
   - Se Espalme: d20 + floor((Potência + Rapidez) / 2)
   - Se Captura: d20 + floor((Potência + Técnica) / 2)
3. Comparar com rolagem do atacante
```

**Exemplo de Goleiro**:
- Potência: 3
- Rapidez: 2
- Técnica: 4

Se escolher **Espalme**: `d20 + floor((3 + 2) / 2)` = `d20 + 2`  
Se escolher **Captura**: `d20 + floor((3 + 4) / 2)` = `d20 + 3`

---

## 🚧 Status de Implementação

**Atual**: Sistema antigo (6 atributos) está IMPLEMENTADO e TESTADO  
**Próximo**: ✅ **ESPECIFICAÇÃO COMPLETA RECEBIDA** - Pronto para refatorar

**Impacto**: Refatoração de ~8 arquivos + todos os testes relacionados

**Decisão**: 07/04/2026 - Migração para 3 atributos confirmada

---

## 📝 Próximos Passos (Quando Especificado)

1. ✅ Atualizar `types/player.ts`
2. ✅ Atualizar `schemas/player-schema.ts` (Red → Green → Refactor via TDD)
3. ✅ Atualizar `lib/combat.ts` + testes
4. ✅ Atualizar stores + testes
5. ✅ Atualizar documentação (GDD, CLAUDE, GEMINI)
6. ✅ Rodar todos os testes (`npm run test`)
7. ✅ Validar cobertura > 80%

---

**✅ Especificação recebida e documentada! Pronto para implementação. 🎯**
