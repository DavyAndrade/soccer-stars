import { z } from 'zod';

/**
 * Schema para zonas do campo
 */
export const ZonaCampoSchema = z.enum(['DF1', 'MI1', 'MC', 'MI2', 'DF2']);

/**
 * Schema para ações ofensivas
 */
export const AcaoOfensivaSchema = z.enum(['chute', 'drible', 'passe']);

/**
 * Schema para ações defensivas
 */
export const AcaoDefensivaSchema = z.enum(['bloqueio', 'desarme', 'interceptacao']);

/**
 * Schema para ações de goleiro
 */
export const AcaoGoleiroSchema = z.enum(['captura', 'espalme']);

/**
 * Schema para resultado de confronto
 */
export const ResultadoConfrontoSchema = z.object({
  vencedor: z.enum(['atacante', 'defensor']),
  rolagemAtacante: z.number().int().min(1).max(20),
  rolagemDefensor: z.number().int().min(1).max(20),
  totalAtacante: z.number().int(),
  totalDefensor: z.number().int(),
  tentativas: z.number().int().min(1),
});

/**
 * Schema para ação de partida (jogador com posse escolhe ação)
 */
export const AcaoPartidaSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('chute'),
    jogadorId: z.number().int(),
    zona: z.enum(['MI2', 'DF2']), // Só pode chutar dessas zonas
  }),
  z.object({
    tipo: z.literal('drible'),
    jogadorId: z.number().int(),
    zona: ZonaCampoSchema,
  }),
  z.object({
    tipo: z.literal('passe'),
    jogadorId: z.number().int(),
    destinatarioId: z.number().int(),
    zona: ZonaCampoSchema,
  }),
  z.object({
    tipo: z.literal('esperar'),
    jogadorId: z.number().int(),
  }),
]);

/**
 * Schema para validação de energia
 */
export const EnergiaSchema = z.number().int().min(0).max(10);

/**
 * Schema para validação de tempo de partida
 */
export const TempoPartidaSchema = z.object({
  minuto: z.number().int().min(0).max(120), // Incluindo acréscimos
  periodo: z.enum(['primeiro_tempo', 'intervalo', 'segundo_tempo', 'finalizado']),
});

/**
 * Type inference
 */
export type ZonaCampoInput = z.infer<typeof ZonaCampoSchema>;
export type AcaoOfensivaInput = z.infer<typeof AcaoOfensivaSchema>;
export type AcaoDefensivaInput = z.infer<typeof AcaoDefensivaSchema>;
export type AcaoGoleiroInput = z.infer<typeof AcaoGoleiroSchema>;
export type ResultadoConfrontoInput = z.infer<typeof ResultadoConfrontoSchema>;
export type AcaoPartidaInput = z.infer<typeof AcaoPartidaSchema>;
export type EnergiaInput = z.infer<typeof EnergiaSchema>;
export type TempoPartidaInput = z.infer<typeof TempoPartidaSchema>;
