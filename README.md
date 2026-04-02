# Soccer Stars

RPG de Futebol Single-Player inspirado no anime **Ao Ashi**.

## 🎮 Sobre o Jogo

Soccer Stars é um jogo web turn-based onde você controla um jogador de futebol em partidas completas 11v11. Tome decisões táticas, gerencie sua energia e vença confrontos baseados em rolagem de dados (d20) + seus atributos.

## 🚀 Stack Tecnológica

- **Framework:** Next.js 15+ (App Router)
- **Linguagem:** TypeScript (strict mode)
- **Game Engine:** Phaser.js 3.8+
- **UI:** Tailwind CSS 4 + shadcn/ui
- **State Management:** Zustand
- **Runtime:** Bun >=1.0 ⚡
- **Deploy:** Vercel / Netlify

## 📋 Pré-requisitos

- **Bun** >= 1.0.0 ([Instalar Bun](https://bun.sh/))

## 🛠️ Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd SoccerStars

# Instale as dependências com Bun
bun install
```

## 💻 Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
bun run dev

# Acesse http://localhost:3000
```

## 🏗️ Build

```bash
# Build de produção
bun run build

# Inicie o servidor de produção
bun run start
```

## 📦 Scripts Disponíveis

- `bun run dev` - Servidor de desenvolvimento
- `bun run build` - Build de produção
- `bun run start` - Servidor de produção
- `bun run lint` - Linting com ESLint

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure o build command: `bun run build`
3. Deploy automático a cada push

### Netlify

1. Configure `netlify.toml` (já incluído)
2. Conecte seu repositório
3. Deploy automático

## 📖 Documentação

- [Game Design Document (GDD)](./docs/GDD.md) - Mecânicas e regras do jogo
- [Guia para Claude AI](./docs/CLAUDE.md) - Diretrizes de desenvolvimento para IA
- [Guia para Gemini AI](./docs/GEMINI.md) - Diretrizes de desenvolvimento para IA

## 🎯 Escopo do MVP

- ✅ Sistema de atributos (18 pontos para distribuir)
- ✅ Confrontos baseados em d20 + atributos
- ✅ Campo com 5 zonas
- ✅ Partidas 11v11 com IA
- ✅ Sistema de energia (10 pontos)
- ✅ Goleiro com Captura/Espalme
- ✅ 90 minutos + acréscimos
- ✅ Mobile First
- ✅ Persistência via LocalStorage

## 🎮 Como Jogar

1. **Crie seu jogador**: Distribua 18 pontos entre 6 atributos
2. **Entre em campo**: Partidas completas de 90 minutos
3. **Tome decisões**: Chute, Drible ou Passe
4. **Gerencie energia**: Cada ação consome 1 de energia
5. **Vença confrontos**: d20 + seu atributo vs d20 + atributo adversário

## 📁 Estrutura do Projeto

```
SoccerStars/
├── docs/              # Documentação
│   ├── GDD.md        # Game Design Document
│   ├── CLAUDE.md     # Guia para AI (Claude)
│   └── GEMINI.md     # Guia para AI (Gemini)
├── types/            # Tipos TypeScript
├── lib/              # Utilitários e lógica core
├── store/            # Zustand stores
├── components/       # Componentes React
├── game/             # Lógica Phaser.js
└── public/           # Assets estáticos
```

## 🤝 Contribuindo

Este é um projeto em desenvolvimento ativo. Veja o [GDD](./docs/GDD.md) para mecânicas pendentes e roadmap.

## 📝 Licença

[Definir licença]

---

**Desenvolvido com ⚽ e inspirado em Ao Ashi**
