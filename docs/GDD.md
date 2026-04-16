# 📘 Game Design Document - Soccer Stars

> **Versão**: 1.1.0  
> **Última Atualização**: 16/04/2026  
> **Status**: Em desenvolvimento (React-first)

> **Nota de Escopo Atual**: Phaser está pausado temporariamente. O fluxo de partida atual é implementado em React/Next com lógica em `lib/`.

---

## 🎯 Visão Geral

### Conceito
Soccer Stars é um RPG de futebol single-player baseado em turnos, inspirado no universo do anime **Ao Ashi**. O jogador cria e controla um protagonista que disputa partidas 11v11 em uma liga profissional, utilizando um sistema de combate baseado em rolagens de d20 + atributos.

### Objetivos do Jogo
- Criar um jogador personalizado (nome, posição, atributos, avatar)
- Disputar uma liga completa (12 times, ida e volta = 22 rodadas)
- Vencer partidas através de decisões estratégicas
- Gerenciar energia durante as partidas

### Plataforma
- **Mobile First**: Interface otimizada para dispositivos móveis (viewport mínimo 375px)
- **Desktop**: Suporte completo para desktop
- **Persistência**: LocalStorage (sem backend no MVP)
- **Deploy**: Vercel ou Netlify

---

## ⚽ Mecânicas Core

### 1. Sistema de Combate

#### Fórmula Base
```
Atacante: d20 + Atributo Ofensivo
    vs
Defensor: d20 + Atributo Defensivo

→ Maior vence
→ Empate: Re-rolar até ter vencedor
```

#### Mapeamento de Defesa (Automático)
| Ação Ofensiva | Defesa Automática |
|--------------|-------------------|
| Chute        | Bloqueio          |
| Drible       | Desarme           |
| Passe        | Interceptação     |

**Regra**: A defesa é sempre automática baseada na ação ofensiva escolhida.

---

### 2. Atributos

#### Sistema Universal (3 atributos para TODOS os jogadores)
| Atributo      | Descrição | Ações Associadas |
|---------------|-----------|------------------|
| **Potência**  | Força física e impacto | Chute (ataque), Bloqueio (defesa) |
| **Rapidez**   | Velocidade e agilidade | Drible (ataque), Desarme (defesa) |
| **Técnica**   | Habilidade e precisão | Passe (ataque), Interceptação (defesa) |

**Distribuição de Pontos (Todos os Jogadores):**
- **Obrigatório**: 1 ponto em cada atributo (3 pontos total)
- **Livres**: 6 pontos para distribuir livremente
- **Total**: 9 pontos
- **Limites**: Mínimo 1, Máximo 5 por atributo

#### Goleiro (Mecânica Especial)
**Atributos**: Mesmos 3 atributos (Potência, Rapidez, Técnica)

**Mecânica de Defesa:**
1. Sistema escolhe aleatoriamente: **Captura** ou **Espalme**
2. **Espalme**: `d20 + floor((Potência + Rapidez) / 2)` → Bola sobra 50/50
3. **Captura**: `d20 + floor((Potência + Técnica) / 2)` → Mantém posse, pode passar para MI

**Arredondamento**: Sempre para baixo (floor)

**Exemplo**:
- GK com Potência 3, Rapidez 2, Técnica 4
- Se Espalme: `d20 + floor(5/2)` = `d20 + 2`
- Se Captura: `d20 + floor(7/2)` = `d20 + 3`

---

### 3. Sistema de Energia

| Propriedade | Valor |
|-------------|-------|
| **Máximo** | 10 pontos |
| **Custo por Ação** | 1 ponto por jogador envolvido no lance (atacante e defensor) |
| **Regeneração** | +5 no intervalo para cada jogador em campo (não ultrapassa 10) |
| **Penalidade (0 energia)** | `1d20 - 2` (sem bônus de atributo) |

**Ações que consomem energia por jogador:**
- Chute, Drible, Passe (ofensivas)
- Bloqueio, Desarme, Interceptação (defensivas automáticas)

---

### 4. Campo e Zonas

```
[GOL] ← DF1 ← MI1 ← MC → MI2 → DF2 → [GOL]
```

| Zona | Nome | Descrição |
|------|------|-----------|
| **DF1** | Defesa 1 | Zona defensiva inicial |
| **MI1** | Meio 1 | Meio-campo defensivo |
| **MC**  | Meio-Campo | Centro (zona inicial da partida) |
| **MI2** | Meio 2 | Meio-campo ofensivo |
| **DF2** | Defesa 2 | Zona de finalização |

#### Posições por Zona (Para IA escolher oponente)
| Zona | Posições que Podem Atuar |
|------|--------------------------|
| **DF1** | DF (Defensor), MF (Meio-Campista) |
| **MI1** | DF, MF |
| **MC**  | DF, MF, FW (Forward/Atacante) |
| **MI2** | MF, FW |
| **DF2** | MF, FW |

**Regra**: Quando há confronto, a marcação é escolhida de forma aleatória ponderada por prioridade de zona e estamina, respeitando as posições válidas da zona.

---

### 5. Ações de Partida

#### Chute
- **Zonas permitidas**: MI2 (sem modificador) ou DF2 (com modificador)
- **Confronto em MI2**: `d20 puro` vs `d20 + Bloqueio`
- **Confronto em DF2**: `d20 + Chute` vs `d20 + Bloqueio`
- **Se vencer bloqueio**: Goleiro reage
  - **Captura vence**: Goleiro fica com a posse e repõe para o próprio time no MC
  - **Captura perde**: GOL!
  - **Espalme vence**: Bola sobra 50/50 na área defendida (DF1 ou DF2, conforme o lado)
  - **Espalme perde**: GOL!
- **Regra do último defensor**: após drible/passe bem-sucedido na zona final (DF2 para quem ataca), o próximo chute sai livre de bloqueio e vai direto para a reação do goleiro.

#### Drible
- **Zonas**: Qualquer zona (exceto já estar em DF2 atacando)
- **Confronto**: `d20 + Drible` vs `d20 + Desarme`
- **Se vencer**: Mantém posse + **avança 1 zona automaticamente**
- **Se perder**: Adversário ganha posse na mesma zona

#### Passe
- **Direção**: Apenas para frente (próxima zona)
- **Seleção**: Jogador escolhe companheiro do time via menu
- **Confronto**: `d20 + Passe` vs `d20 + Interceptação`
- **Se vencer**: Companheiro recebe na próxima zona
- **Se perder**: Adversário ganha posse na mesma zona

### 6. Tempo de Partida

| Período | Duração |
|---------|---------|
| **1º Tempo** | 45 minutos |
| **Acréscimos 1º** | `1d5` minutos |
| **Intervalo** | Regenera +5 energia (max 10) |
| **2º Tempo** | 45 minutos |
| **Acréscimos 2º** | `1d10` minutos |
| **Total** | ~90-100 minutos |

**Regra**: 1 ação por minuto (apenas se jogador tiver posse de bola).

---

## 🎮 Fluxo de Jogo

### 1. Criação de Jogador

#### Informações Básicas
1. **Nome**: Input de texto (2-50 caracteres)
2. **Posição**: Escolher entre:
   - GK (Goleiro)
   - DF (Defensor)
   - MF (Meio-Campista)
   - FW (Forward/Atacante)

#### Distribuição de Atributos
- **Todos os jogadores**: 9 pontos totais (3 obrigatórios + 6 livres)
- **Limites por atributo**: mínimo 1, máximo 5

#### Avatar
- **Upload**: Imagem do dispositivo
- **Tamanho máximo**: 10MB
- **Formatos aceitos**: PNG, JPG, JPEG, WEBP, GIF
- **Armazenamento**: Base64 no LocalStorage

#### Time e Número
- **Escolha de Time**: Selecionar dentre os 12 times da liga
- **Número da Camisa**: Atribuído **aleatoriamente** dentre os disponíveis no time

---

### 2. Fluxo de Partida

#### Início
1. **Seleção de Uniforme**: antes de iniciar, usuário escolhe uniforme (primário/secundário) de ambos os times
2. **Sorteio**: Time da casa inicia com posse
3. **Posição Inicial**: MC (meio-campo), com pontapé inicial priorizando MF/FW
4. **Energia Inicial**: 10 pontos para todos

#### Loop de Jogo (por minuto)
```
Para cada minuto (1 até 90 + acréscimos):
  
  SE protagonista COM posse:
    1. Mostrar opções: Chute / Drible / Passe
    2. Jogador escolhe ação
    3. Se Passe: Mostrar menu de companheiros
    4. Resolver confronto (d20 + atributo)
    5. Atualizar posse, zona e energia dos jogadores envolvidos (-1 cada)
    6. Se gol: Atualizar placar, reiniciar no MC
  
  SE protagonista SEM posse (ou não estiver em campo):
    1. IA decide ação ofensiva
    2. Jogadores envolvidos são escolhidos automaticamente
    3. Resolver confronto
    4. Atualizar posse, zona e energia dos jogadores envolvidos (-1 cada)
    5. Se gol: Atualizar placar, reiniciar no MC

  Obs:
    - Há delay narrativo de 2s entre lances no log
    - Existe opção "Pular para resultado" para simular o restante da partida
    - Substituições automáticas podem ocorrer por estamina baixa para evitar jogadores exaustos em campo
  
  SE minuto == 45 + acréscimos 1º:
    → INTERVALO (regenera +5 energia, max 10)
  
  SE minuto == 90 + acréscimos 2º:
    → FIM DE JOGO (Vitória / Empate / Derrota)
```

#### IA dos NPCs

**Estratégia de Decisão** (heurística ponderada):
1. **Zona**: defesa privilegia passe seguro; último terço aumenta agressividade
2. **Estamina**: baixa estamina reduz drible/forçação e aumenta passe
3. **Placar + tempo**: perdendo no fim aumenta risco (principalmente chute); vencendo no fim prioriza segurança
4. **Atributos**: Potência favorece chute, Rapidez favorece drible, Técnica favorece passe
5. **Seleção final**: ponderação com tendência a escolher a ação claramente dominante

**Prioridade de posse**: o protagonista não recebe prioridade fixa para ser sempre o portador da bola.

**Defesa**: Sempre automática baseada no mapeamento.

#### Narrativa dos Lances (log)
- O log deve evidenciar atacante e defensor em cada confronto.
- Os nomes dos jogadores devem aparecer com a cor do uniforme selecionado do respectivo time.
- Exemplos:
  - `O passe de JogadorX foi interceptado por JogadorY!`
  - `O JogadorX driblou JogadorY!`
  - `O JogadorX passou a bola para JogadorY com sucesso!`
  - `O JogadorX bloqueou o chute de JogadorY.`

#### Visualização de Escalação em Partida
- Abaixo do card principal da partida, exibir dois cards lado a lado (quando houver espaço).
- Cada card mostra os titulares do time correspondente com:
  - número da camisa
  - nome
  - posição
  - estamina atual

---

### 3. Sistema de Liga

#### Estrutura - Prince Takamado JFA U-18 Football Premier League

**Baseado na liga real japonesa de futebol sub-18**

##### Divisão em Conferências
- **EAST**: Times de Hokkaido, Tohoku, Kanto e Chubu (12 times)
- **WEST**: Times de Kansai, Chugoku, Shikoku, Kyuushuu e Okinawa (12 times)

##### Formato de Competição
- **Times por Conferência**: 12 times (EAST) + 12 times (WEST) = 24 times total
- **Fase Regular**: Cada conferência joga ida e volta (todos contra todos dentro da conferência)
  - Total de rodadas por conferência: 22 rodadas (11 ida + 11 volta)
  - Total de partidas por time: 22 partidas
- **Final**: Jogo decisivo entre 1º lugar EAST vs 1º lugar WEST
  - Define o campeão geral da liga

##### Tipos de Times
- **Times Escolares**: Equipes de escolas/colégios
- **Times de Base**: Equipes de formação de clubes profissionais
- Ambos competem na mesma liga

#### Formações dos Times
- **Formações Disponíveis**: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 4-5-1, 3-4-3
- **Regra**: Cada time tem formação **fixa** (não muda entre partidas)

#### Elencos
- **Quantidade de NPCs**: **23 jogadores por time** (padrão de futebol)
- **Nomes**: **Genéricos** (gerados proceduralmente ou lista simples)
- **Números de Camisa**: 1-99, únicos dentro de cada time
- **Posições**: Distribuídas realisticamente (3-4 GK, 6-8 DF, 6-8 MF, 4-6 FW)

#### Classificação (Por Conferência)
- **Vitória**: 3 pontos
- **Empate**: 1 ponto
- **Derrota**: 0 pontos
- **Critérios de Desempate**: 
  1. Pontos
  2. Saldo de gols
  3. Gols marcados
  4. Confronto direto
  
#### Progressão do Protagonista
- O jogador criado entra em um time de uma das conferências (EAST ou WEST)
- Disputa a fase regular (22 partidas)
- Ao concluir a rodada 22, o jogo inicia automaticamente a próxima temporada (temporada +1)
- Se seu time ficar em 1º lugar, disputa a FINAL contra o 1º da outra conferência

---

## 🏗️ Arquitetura Técnica

### Stack
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Runtime de Partida (atual) | React/Next + lógica em `lib/` |
| State Management | Zustand |
| Validation | Zod |
| Forms | React Hook Form |
| Styling | Tailwind CSS v4 |
| Runtime/PM | Bun (obrigatório) |
| Persistência | LocalStorage |

### Estrutura de Pastas
```
SoccerStars/
├── app/              # Next.js pages
├── components/       # React components
├── game/             # Opcional/futuro (Phaser, atualmente pausado)
├── lib/              # Business logic (combat, AI, dice)
├── store/            # Zustand stores
├── schemas/          # Zod schemas
├── types/            # TypeScript types
└── public/           # Static assets
```

### Stores Zustand

#### player-store.ts
```typescript
{
  nome: string
  posicao: 'GK' | 'DF' | 'MF' | 'FW'
  atributos: PlayerAttributes | GoalkeeperAttributes
  avatar?: string (base64)
  time: string
  numeroCamisa: number
}
```

#### match-store.ts
```typescript
{
  placar: { casa: number, visitante: number }
  posseTime: 'casa' | 'visitante'
  zonaAtual: ZonaCampo
  minutoAtual: number
  periodo: 'primeiro_tempo' | 'intervalo' | 'segundo_tempo'
  energiaProtagonista: number
  historicoAcoes: AcaoPartida[]
}
```

#### league-store.ts
```typescript
{
  times: Time[] // 12 times
  rodadas: Rodada[] // 22 rodadas
  classificacao: Classificacao[]
  proximaPartida: PartidaLiga
}
```

---

## 🎨 Design e UX

### Mobile First
- **Viewport mínimo**: 375px
- **Touch controls**: Botões grandes, fácil toque
- **Orientação**: Portrait (vertical)

### Telas Principais

#### 1. Tela Inicial
- Botão "Criar Jogador"
- Botão "Continuar" (se já existe save)

#### 2. Criação de Jogador
- Input de nome
- Seletor de posição (4 opções)
- Distribuidor de atributos (sliders ou +/- buttons)
- Upload de avatar (drag & drop ou file picker)
- Escolha de time (grid de 12 times)
- Preview em tempo real

#### 3. Tela de Liga
- Tabela de classificação (12 times)
- Resultados por rodada
- Botão "Jogar Próxima Partida"

#### 4. Tela de Partida
- **Container React**: Campo com 5 zonas visuais
- **HUD Superior**: Placar, Tempo, Energia
- **HUD Inferior**: Botões de ação (Chute/Drible/Passe/Esperar)
- **Modal de Seleção**: Escolher companheiro para passe

---

## 🧪 Testing

### TDD Obrigatório
- **Red**: Escrever teste falhando
- **Green**: Implementar mínimo necessário
- **Refactor**: Melhorar sem quebrar testes

### Cobertura Mínima
- **lib/** (combat, AI, dice): 80%+
- **schemas/**: 90%+
- **stores/**: 70%+

---

## 📋 Perguntas Pendentes / Decisões Futuras

### Times da Liga
- [x] **Estrutura Definida**: Prince Takamado JFA U-18 Premier League (EAST + WEST)
- [x] **Quantidade de Times**: 24 times (12 EAST + 12 WEST)
- [x] **NPCs por Time**: 23 jogadores (padrão de futebol)
- [x] **Nomes de NPCs**: Genéricos (gerados proceduralmente)
- [ ] Selecionar 12 times reais para EAST (Hokkaido, Tohoku, Kanto, Chubu)
- [ ] Selecionar 12 times reais para WEST (Kansai, Chugoku, Shikoku, Kyuushuu, Okinawa)
- [ ] Definir cores/uniformes de cada time
- [ ] Definir formações fixas de cada time (4-3-3, 4-4-2, etc.)
- [ ] Implementar gerador de nomes genéricos para NPCs

### Evolução (Pós-MVP)
- [ ] Sistema de level up e ganho de XP
- [ ] Evolução de atributos ao longo da carreira
- [ ] Conceitos do anime Ao Ashi (Flow, Zone, etc.)
- [ ] Sistema de treinamento

### Polimento
- [ ] Animações de partida (React/CSS; Phaser opcional se reativado)
- [ ] Sons e música
- [ ] Tutoriais/onboarding
- [ ] Redimensionamento automático de avatar (200x200px?)

---

## 📝 Changelog

### v1.1.0 - 16/04/2026
- ✅ Direção atualizada para React-first
- ✅ Phaser marcado como opcional/futuro
- ✅ Seção de criação de jogador alinhada com 3 atributos e 9 pontos totais
- ✅ IA ajustada: sem prioridade fixa do protagonista e marcação por prioridade de zona
- ✅ Virada automática de temporada ao concluir a rodada 22

### v1.0.0 - 02/04/2026
- ✅ Mecânicas core definidas (combate, atributos, energia)
- ✅ Estrutura de liga (12 times, ida e volta)
- ✅ Criação de jogador completa
- ✅ Sistema de zonas e ações
- ✅ Fluxo de partida definido
- ✅ Stack técnica confirmada

---

**Documento Vivo**: Este GDD será atualizado conforme novas decisões forem tomadas.

**Última Revisão**: 16/04/2026
