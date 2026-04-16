import { z } from 'zod';

/**
 * Constantes de validação de atributos (novo sistema - 3 atributos)
 */
export const PONTOS_OBRIGATORIOS = 3; // 1 ponto em cada atributo (3 atributos)
export const PONTOS_LIVRES = 6; // Pontos livres para distribuir
export const TOTAL_PONTOS = PONTOS_OBRIGATORIOS + PONTOS_LIVRES; // 9 total

export const MIN_ATRIBUTO = 1;
export const MAX_ATRIBUTO = 5;

/**
 * Schema para atributos universais (todos os jogadores incluindo GK)
 * 
 * Regras:
 * - Cada atributo: min 1, max 5
 * - Total de pontos: exatamente 9
 * - Aplicável a todos os jogadores (GK, DF, MF, FW)
 */
export const PlayerAttributesSchema = z.object({
  potencia: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
  rapidez: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
  tecnica: z.number().int().min(MIN_ATRIBUTO).max(MAX_ATRIBUTO),
}).refine(
  (attrs) => {
    const total = attrs.potencia + attrs.rapidez + attrs.tecnica;
    return total === TOTAL_PONTOS;
  },
  {
    message: `Total de atributos deve ser exatamente ${TOTAL_PONTOS}`,
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
 * Schema para criação de jogador (simplificado - todos usam mesmo schema)
 */
export const CreatePlayerSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
  
  posicao: PlayerPositionSchema,

  timeId: z.string().min(1, 'Time é obrigatório'),

  numeroCamisa: z.number().int().min(1).max(99),

  nacionalidade: z.string()
    .min(2, 'Nacionalidade deve ter pelo menos 2 caracteres')
    .max(40, 'Nacionalidade deve ter no máximo 40 caracteres')
    .trim(),

  idade: z.number().int().min(15, 'Idade mínima é 15').max(18, 'Idade máxima é 18'),
  
  atributos: PlayerAttributesSchema,
  
  avatar: AvatarSchema.optional(),
});

/**
 * Type inference
 */
export type PlayerAttributesInput = z.infer<typeof PlayerAttributesSchema>;
export type PlayerPositionInput = z.infer<typeof PlayerPositionSchema>;
export type AvatarInput = z.infer<typeof AvatarSchema>;
export type CreatePlayerInput = z.infer<typeof CreatePlayerSchema>;
