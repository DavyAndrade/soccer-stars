# 📦 Instalação de Dependências

> **Nota**: Execute estes comandos quando a internet estiver estável.

## Comandos de Instalação

### 1. Dependências Core
```bash
bun add zustand zod
```

### 2. Game Engine e Forms
```bash
bun add phaser react-hook-form @hookform/resolvers
```

### 3. Verificar Instalação
```bash
bun run dev
```

---

## ✅ Checklist

- [ ] zustand@5.x instalado
- [ ] zod@4.x instalado
- [ ] phaser@3.x instalado
- [ ] react-hook-form instalado
- [ ] @hookform/resolvers instalado
- [ ] `bun run dev` funcionando sem erros

---

## 🔧 Troubleshooting

### Erro: "Failed to resolve"
```bash
# Limpar cache e reinstalar
rm -rf node_modules bun.lockb
bun install
```

### Erro: "Module not found"
```bash
# Verificar package.json
cat package.json
# Re-adicionar dependência específica
bun add <package-name>
```

---

**Última Atualização**: 02/04/2026
