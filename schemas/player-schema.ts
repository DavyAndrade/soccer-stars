import { z } from 'zod';

/**
 * Constantes de validação de atributos
 */
export const PONTOS_OBRIGATORIOS = 6; // 1 ponto em cada atributo (6 atributos)
export const PONTOS_LIVRES = 12; // Pontos livres para distribuir
export const TOTAL_PONTOS = PONTOS_OBRIGATORIOS + PONTOS_LIVRES; // 18 total

export const MIN_ATRIBUTO = 1;
export const MAX_ATRIBUTO = 5;

/**
 * Schema para atributos de jogador de campo
 * 
 * Regras:
 * - Cada atributo: min 1, max 5
 * - Total de pontos: exatamente 18
 */
export const PlayerAttributesSchema = z.object({
  chute: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
  drible: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
  passe: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
  bloqueio: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
  desarme: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
  interceptacao: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
}).refine(
  (attrs) => {
    const total = attrs.chute + attrs.drible + attrs.passe + 
                  attrs.bloqueio + attrs.desarme + attrs.interceptacao;
    return total === TOTAL_PONTOS;
  },
  {
    message: `Total de atributos deve ser exatamente ${TOTAL_PONTOS}`,
  }
);

/**
 * Schema para atributos de goleiro
 * 
 * Regras:
 * - Apenas Captura e Espalme
 * - Total: 6 pontos
 * - Min 1, Max 5 por atributo
 */
export const GoalkeeperAttributesSchema = z.object({
  captura: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
  espalme: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
}).refine(
  (attrs) => attrs.captura + attrs.espalme === 6,
  {
    message: 'Total de atributos de goleiro deve ser exatamente 6',
  }
);

/**
 * Schema para posição do jogador
 */
export const PlayerPositionSchema = z.enum(['GK', 'DF', 'MF', 'FW']);

/**
 * Schema para upload de avatar
 * 
 * Regras:
 * - Base64 string
 * - Tamanho máximo: 10MB (base64 ~1.37x maior que binário)
 * - Formatos aceitos: PNG, JPG, JPEG, WEBP, GIF
 */
const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_BASE64_SIZE = Math.ceil(MAX_AVATAR_SIZE * 1.37); // ~13.7MB em base64

export const AvatarSchema = z.string()
  .startsWith('data:image/')
  .refine(
    (data) => {
      const base64Part = data.split(',')[1];
      if (!base64Part) return false;
      
      const sizeInBytes = (base64Part.length * 3) / 4;
      return sizeInBytes <= MAX_AVATAR_SIZE;
    },
    {
      message: `Avatar deve ter no máximo ${MAX_AVATAR_SIZE / (1024 * 1024)}MB`,
    }
  )
  .refine(
    (data) => {
      const mimeType = data.split(';')[0].split(':')[1];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
      return allowedTypes.includes(mimeType);
    },
    {
      message: 'Formato de imagem não suportado. Use PNG, JPG, WEBP ou GIF',
    }
  );

/**
 * Schema para criação de jogador
 */
export const CreatePlayerSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
  
  posicao: PlayerPositionSchema,
  
  avatar: AvatarSchema.optional(),
}).and(
  z.discriminatedUnion('posicao', [
    z.object({
      posicao: z.literal('GK'),
      atributos: GoalkeeperAttributesSchema,
    }),
    z.object({
      posicao: z.enum(['DF', 'MF', 'FW']),
      atributos: PlayerAttributesSchema,
    }),
  ])
);

/**
 * Type inference
 */
export type PlayerAttributesInput = z.infer<typeof PlayerAttributesSchema>;
export type GoalkeeperAttributesInput = z.infer<typeof GoalkeeperAttributesSchema>;
export type PlayerPositionInput = z.infer<typeof PlayerPositionSchema>;
export type AvatarInput = z.infer<typeof AvatarSchema>;
export type CreatePlayerInput = z.infer<typeof CreatePlayerSchema>;
