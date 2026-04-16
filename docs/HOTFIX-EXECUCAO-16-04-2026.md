# Checklist Executavel - Hotfix Carreira e Partida

Data: 16/04/2026
Origem: pendencias de MILESTONES (fluxos /carreira/time e /partida)

## Status Rapido

- Implementacao base dos hotfixes: presente no codigo
- Cobertura automatizada dos hotfixes de escalacao: adicionada nesta data
- Validacao manual fim-a-fim: pendente
- Documentacao com status consolidado: este arquivo

## Itens Criticos e Evidencias

### 1) Substituicao campo-reserva com persistencia imediata

- Status: Implementado e coberto por teste
- Evidencias de codigo:
  - app/carreira/time/time-client.tsx: persistEscalacao salva a cada troca
  - lib/storage.ts: updateTeamEscalacao persiste no slot
- Testes:
  - tests/lib/escalacao.test.ts: persiste troca titular/reserva imediatamente

### 2) Sincronizacao apos autosave da escalacao sem reset visual

- Status: Implementacao existente, requer validacao manual de UX
- Evidencias de codigo:
  - app/carreira/time/time-client.tsx: atualiza save e teamDraft apos updateTeamEscalacao
- Validacao pendente:
  - troca sequencial de 3+ jogadores sem perda de selecao visual
  - troca de formacao seguida de substituicao

### 3) Layout desktop da Escalacao (campo esquerda, reservas direita)

- Status: Implementado
- Evidencia de codigo:
  - app/carreira/time/time-client.tsx: grid md com 2fr/1fr para campo e reservas

### 4) Ordenacao por posicao nas listas da Escalacao

- Status: Implementado
- Evidencias de codigo:
  - app/carreira/time/time-client.tsx: reservas ordenadas GK -> DF -> MF -> FW
  - app/partida/partida-client.tsx: cards de escalacao ordenados por posicao

### 5) Regras de partida

- Status: Implementadas, sem E2E dedicado
- Evidencias de codigo:
  - app/partida/partida-client.tsx: bonus de prioridade do protagonista na posse
  - app/partida/partida-client.tsx: chute livre apos vencer ultimo defensor
  - app/partida/partida-client.tsx: substituicao automatica apenas apos intervalo

## Testes Adicionados

- tests/lib/escalacao.test.ts
  - persiste imediatamente troca entre titular e reserva
  - garante exatamente 11 titulares mesmo com payload incompleto

## Comandos de Validacao

1. bun run test tests/lib/escalacao.test.ts
2. bun run test tests/lib/career-round.test.ts tests/lib/storage.test.ts tests/lib/escalacao.test.ts
3. bun run lint

## Checklist Manual Final

1. Abrir /carreira/time com slot valido
2. Trocar titular por reserva e recarregar pagina
3. Confirmar persistencia da troca
4. Alterar formacao e repetir troca
5. Iniciar partida em /partida
6. Validar substituicao automatica somente no segundo tempo
7. Validar lance de chute livre apos ultima acao de drible/passe na zona final
8. Finalizar rodada e confirmar retorno para /carreira

## Proximo Passo Recomendado

- Criar E2E para carreira/time e partida cobrindo os 3 cenarios criticos:
  - troca + persistencia
  - substituicao automatica apos intervalo
  - chute livre apos ultimo defensor
