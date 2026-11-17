import z from 'zod';

export namespace Health {
  export const Input = z.object({});
  export const Output = z.object({ status: z.literal('ok') });
}
