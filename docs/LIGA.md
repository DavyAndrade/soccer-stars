# 🏆 Prince Takamado JFA U-18 Football Premier League

**Documento de Referência da Liga do Jogo**

---

## 📋 Visão Geral

O Soccer Stars é ambientado na **Prince Takamado JFA U-18 Football Premier League**, uma liga real de futebol sub-18 do Japão. Esta liga é dividida em duas conferências regionais (EAST e WEST) que competem separadamente antes de um jogo final decisivo.

> **Status atual de implementação:** fluxo de carreira focado na fase regular das conferências. A final EAST x WEST permanece como etapa planejada.

---

## 🗾 Estrutura da Liga

### Conferências

#### 🌅 EAST (東)
**Regiões**: Hokkaido, Tohoku, Kanto, Chubu  
**Times**: 12 equipes

#### 🌄 WEST (西)
**Regiões**: Kansai, Chugoku, Shikoku, Kyuushuu, Okinawa  
**Times**: 12 equipes

---

## 🏟️ Formato de Competição

### Fase Regular
- **Sistema**: Ida e volta (todos contra todos dentro da mesma conferência)
- **Partidas por time**: 22 jogos (11 em casa + 11 fora)
- **Total de rodadas**: 22 rodadas por conferência
- **Duração**: Aproximadamente 22 semanas

### Classificação
Dentro de cada conferência:
1. **Pontos** (Vitória: 3 | Empate: 1 | Derrota: 0)
2. **Saldo de gols** (em caso de empate em pontos)
3. **Gols marcados** (se ainda empatar)
4. **Confronto direto** (último critério)

### Final
- **Participantes**: 1º lugar EAST vs 1º lugar WEST
- **Formato**: Jogo único decisivo
- **Local**: Neutro (definido pela JFA)
- **Define**: Campeão geral da liga

---

## 🏫 Tipos de Times

### Times Escolares (学校)
Times de colégios/escolas que mantêm futebol competitivo.

**Características**:
- Jogadores são estudantes regulares
- Treinam após as aulas
- Forte senso de identidade escolar
- Exemplos na vida real: Aomori Yamada, Maebashi Ikuei, Ryutsu Keizai University Kashiwa

### Times de Base (クラブユース)
Times juvenis de clubes profissionais da J.League.

**Características**:
- Jogadores em formação profissional
- Estrutura de treinamento intensivo
- Objetivo de promover jogadores para o time principal
- Exemplos na vida real: Yokohama F. Marinos Youth, Kashima Antlers Youth, Gamba Osaka Youth

**Ambos competem em igualdade na mesma liga.**

---

## 👥 Elencos

### Composição
- **Total por time**: 23 jogadores
- **Distribuição sugerida**:
  - Goleiros (GK): 3 jogadores
  - Defensores (DF): 7 jogadores
  - Meio-campistas (MF): 8 jogadores
  - Atacantes (FW): 5 jogadores

### NPCs (Jogadores Não-Protagonistas)
- **Nomes**: Genéricos (ex: "Jogador 1", "Jogador 2", ou nomes simples gerados)
- **Números de Camisa**: 1-99, únicos dentro de cada time
- **Atributos**: Gerados proceduralmente (balanceados por posição)
- **Formação**: Fixa por time (não muda entre partidas)

---

## 🎮 Integração com o Jogo

### Protagonista
1. Jogador cria seu personagem (nome, posição, atributos, avatar)
2. Escolhe um time de uma das conferências (EAST ou WEST)
3. Recebe número de camisa aleatório dentre os disponíveis
4. Entra no elenco de 23 jogadores

### Progressão
1. **Fase Regular**: Disputa 22 partidas dentro da conferência
2. **Objetivo**: Levar seu time ao 1º lugar da conferência
3. **Final** (se classificar): Enfrenta o 1º lugar da outra conferência
4. **Vitória na Final**: Conquista o título da liga

### Partidas
- Apenas as partidas do protagonista são jogáveis
- Outras partidas da rodada são simuladas (resultados gerados automaticamente)
- Tabela de classificação atualiza após cada rodada

---

## 📊 Times a Serem Implementados

### ⏳ Pendente: Seleção de Times Reais

#### EAST (12 times)
_A definir: Selecionar 12 times reais das regiões de Hokkaido, Tohoku, Kanto e Chubu_

Exemplos de times reais elegíveis:
- Aomori Yamada High School (Tohoku)
- Kashima Antlers Youth (Kanto)
- Yokohama F. Marinos Youth (Kanto)
- Ryutsu Keizai University Kashiwa High School (Kanto)
- Maebashi Ikuei High School (Kanto)
- Shimizu S-Pulse Youth (Chubu)
- Júbilo Iwata U-18 (Chubu)

#### WEST (12 times)
_A definir: Selecionar 12 times reais das regiões de Kansai, Chugoku, Shikoku, Kyuushuu e Okinawa_

Exemplos de times reais elegíveis:
- Gamba Osaka Youth (Kansai)
- Vissel Kobe U-18 (Kansai)
- Sanfrecce Hiroshima F.C Youth (Chugoku)
- Avispa Fukuoka U-18 (Kyuushuu)
- Nagasaki Sogo Kagaku University Fuzoku High School (Kyuushuu)
- Okinawa SV U-18 (Okinawa)

---

## 🎨 Detalhes Visuais (Futuro)

### Uniformes
- Cores baseadas nos times reais (quando selecionados)
- Protagonista veste o uniforme do time escolhido
- Número da camisa visível no sprite/avatar

### Estádios
- Campo neutro genérico no MVP
- Futuro: Estádios específicos por região

---

## 📝 Notas de Implementação

### Stores Zustand
- `league-store.ts` deverá ser adaptado para:
  - Duas conferências (EAST e WEST)
  - 12 times por conferência (24 times total)
  - 22 rodadas por conferência
  - Sistema de final (desbloqueia se time for 1º lugar)

> Nota: o fluxo de simulação de rodada já está implementado para partidas das conferências; o fechamento completo da final segue como evolução de milestone.

> Nota: ao concluir a rodada 22 da fase regular, o sistema inicia automaticamente a próxima temporada.

### Geração de Rodadas
```typescript
// Pseudo-código
function gerarRodadasConferencia(times: Time[]): Rodada[] {
  // 12 times = 11 rodadas de ida + 11 rodadas de volta
  // Total: 22 rodadas
  // Cada rodada tem 6 partidas (12 times / 2)
}

function gerarFinal(campeaoEast: Time, campeaoWest: Time): Partida {
  // Jogo único decisivo
}
```

### Gerador de NPCs
```typescript
// 23 jogadores por time
// Distribuição: 3 GK, 7 DF, 8 MF, 5 FW
// Nomes genéricos: "GK1", "DF1", "MF1", "FW1"
// Ou usar biblioteca de nomes japoneses genéricos
```

---

## 🔗 Referências

- [Prince Takamado Trophy JFA U-18 Football Premier League (Wikipedia)](https://en.wikipedia.org/wiki/Prince_Takamado_Trophy_JFA_U-18_Football_Premier_League)
- [JFA Official Website](https://www.jfa.jp/)
- Inspiração: Anime "Ao Ashi" (青アシ)

---

**Última Atualização**: 16/04/2026  
**Status**: Estrutura definida, fase regular em foco e times específicos pendentes de seleção
