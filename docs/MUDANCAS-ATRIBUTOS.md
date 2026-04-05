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

## 🤔 Perguntas Pendentes

### Distribuição de Pontos
- [ ] Total de pontos para distribuir? (manter 18 ou mudar?)
- [ ] Pontos obrigatórios? (ex: 1 em cada = 3 pontos obrigatórios)
- [ ] Pontos livres? (ex: 15 livres se total = 18)
- [ ] Min/Max por atributo? (manter 1-5 ou mudar?)

### Mapeamento Ação → Atributo
- [ ] **Chute** usa qual atributo? (Potência? Técnica?)
- [ ] **Drible** usa qual atributo? (Rapidez? Técnica?)
- [ ] **Passe** usa qual atributo? (Técnica? Potência?)
- [ ] **Bloqueio** (defesa de chute) usa qual? (Potência?)
- [ ] **Desarme** (defesa de drible) usa qual? (Rapidez?)
- [ ] **Interceptação** (defesa de passe) usa qual? (Rapidez? Técnica?)

### Goleiro
- [ ] Goleiro mantém atributos separados (Captura/Espalme)?
- [ ] Ou goleiro também usa Potência/Rapidez/Técnica?
- [ ] Se separado, quantos pontos totais?

---

## 💡 Sugestões de Mapeamento (Aguardando Confirmação)

### Opção A: Mapeamento Direto
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

### Opção B: Mapeamento Combinado
```
Ofensivo:
- Chute → Potência + Técnica (média)
- Drible → Rapidez + Técnica (média)
- Passe → Técnica + Rapidez (média)

Defensivo:
- Bloqueio → Potência
- Desarme → Rapidez  
- Interceptação → Técnica
```

### Opção C: Mapeamento Flexível
```
Cada ação tem atributo primário + secundário

Chute:
  - MI2: Técnica (primário)
  - DF2: Potência (primário)
  
Drible: Rapidez (primário) + Técnica (secundário)
Passe: Técnica (primário) + Rapidez (secundário)
Bloqueio: Potência (primário)
Desarme: Rapidez (primário)
Interceptação: Técnica (primário)
```

---

## 🚧 Status de Implementação

**Atual**: Sistema antigo (6 atributos) está IMPLEMENTADO e TESTADO  
**Próximo**: Aguardando especificação completa para refatorar

**Impacto**: Refatoração de ~8 arquivos + todos os testes relacionados

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

**Aguardando especificação detalhada do usuário! 🎯**
