# 📘 Game Design Document - Soccer Stars

> **Versão**: 1.0.0  
> **Última Atualização**: 02/04/2026  
> **Status**: Desenvolvimento Inicial

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

#### Jogador de Campo (6 atributos)
| Atributo      | Descrição |
|---------------|-----------|
| **Chute**     | Força e precisão dos chutes ao gol |
| **Drible**    | Habilidade de avançar com a bola |
| **Passe**     | Precisão e alcance dos passes |
| **Bloqueio**  | Defesa contra chutes |
| **Desarme**   | Defesa contra dribles |
| **Interceptação** | Defesa contra passes |

**Distribuição de Pontos:**
- **Obrigatório**: 1 ponto em cada atributo (6 pontos total)
- **Livres**: 12 pontos para distribuir livremente
- **Total**: 18 pontos
- **Limites**: Mínimo 1, Máximo 5 por atributo

#### Goleiro (2 atributos)
| Atributo    | Descrição |
|-------------|-----------|
| **Captura** | Defende e mantém a posse (pode passar para zona MI) |
| **Espalme** | Defende mas a bola sobra 50/50 para qualquer time |

**Distribuição de Pontos:**
- **Total**: 6 pontos
- **Limites**: Mínimo 1, Máximo 5 por atributo

---

### 3. Sistema de Energia

| Propriedade | Valor |
|-------------|-------|
| **Máximo** | 10 pontos |
| **Custo por Ação** | 1 ponto (ofensiva ou defensiva) |
| **Regeneração** | +5 no intervalo (não ultrapassa 10) |
| **Penalidade (0 energia)** | `1d20 - 2` (sem bônus de atributo) |

**Ações que consomem energia:**
- Chute, Drible, Passe (ofensivas)
- Bloqueio, Desarme, Interceptação (defensivas automáticas)
- **Esperar** (escolha do jogador): Não consome energia

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

**Regra**: Quando há confronto, a IA escolhe aleatoriamente um jogador adversário dentre as posições que podem atuar naquela zona.

---

### 5. Ações de Partida

#### Chute
- **Zonas permitidas**: MI2 (sem modificador) ou DF2 (com modificador)
- **Confronto em MI2**: `d20 puro` vs `d20 + Bloqueio`
- **Confronto em DF2**: `d20 + Chute` vs `d20 + Bloqueio`
- **Se vencer bloqueio**: Goleiro reage
  - **Captura vence**: Goleiro fica com a posse (pode passar para zona MI)
  - **Captura perde**: GOL!
  - **Espalme vence**: Bola sobra 50/50 (random para qualquer time)
  - **Espalme perde**: GOL!

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

#### Esperar
- **Efeito**: Não faz nada, não consome energia
- **Uso**: Poupar energia estrategicamente

---

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
- **Se Jogador de Campo**: 12 pontos livres (+ 6 obrigatórios = 18 total)
- **Se Goleiro**: 6 pontos para distribuir entre Captura e Espalme

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
1. **Sorteio**: Time da casa inicia com posse
2. **Posição Inicial**: MC (meio-campo)
3. **Energia Inicial**: 10 pontos para todos

#### Loop de Jogo (por minuto)
```
Para cada minuto (1 até 90 + acréscimos):
  
  SE protagonista COM posse:
    1. Mostrar opções: Chute / Drible / Passe / Esperar
    2. Jogador escolhe ação
    3. Se Passe: Mostrar menu de companheiros
    4. Resolver confronto (d20 + atributo)
    5. Atualizar posse, zona, energia (-1)
    6. Se gol: Atualizar placar, reiniciar no MC
  
  SE protagonista SEM posse:
    1. IA decide ação ofensiva
    2. Protagonista defende automaticamente (baseado em mapeamento)
    3. Resolver confronto
    4. Atualizar posse, zona, energia (-1)
    5. Se gol: Atualizar placar, reiniciar no MC
  
  SE minuto == 45 + acréscimos 1º:
    → INTERVALO (regenera +5 energia, max 10)
  
  SE minuto == 90 + acréscimos 2º:
    → FIM DE JOGO (Vitória / Empate / Derrota)
```

#### IA dos NPCs

**Estratégia de Decisão** (ordem de prioridade):
1. **Se em DF2**: Sempre chutar (chance de gol)
2. **Se energia baixa (<3)**: Preferir Esperar
3. **Se perdendo e tempo < 10min**: Arriscar dribles
4. **Se vencendo e tempo < 10min**: Preferir passes seguros
5. **Caso contrário**: Escolha aleatória ponderada (40% drible, 40% passe, 20% esperar)

**Defesa**: Sempre automática baseada no mapeamento.

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
- Se seu time ficar em 1º lugar, disputa a FINAL contra o 1º da outra conferência

---

## 🏗️ Arquitetura Técnica

### Stack
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Game Engine | Phaser.js 3.x |
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
├── game/             # Phaser scenes
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
- **Canvas Phaser**: Campo com 5 zonas visuais
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
- [ ] Animações de partida (Phaser)
- [ ] Sons e música
- [ ] Tutoriais/onboarding
- [ ] Redimensionamento automático de avatar (200x200px?)

---

## 📝 Changelog

### v1.0.0 - 02/04/2026
- ✅ Mecânicas core definidas (combate, atributos, energia)
- ✅ Estrutura de liga (12 times, ida e volta)
- ✅ Criação de jogador completa
- ✅ Sistema de zonas e ações
- ✅ Fluxo de partida definido
- ✅ Stack técnica confirmada

---

**Documento Vivo**: Este GDD será atualizado conforme novas decisões forem tomadas.

**Última Revisão**: 02/04/2026 por Claude Sonnet 4.5
