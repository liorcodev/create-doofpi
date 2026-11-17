import z from 'zod';

export namespace Greet {
  export const Input = z.object({ name: z.string().min(1).default('world') });
  export const Output = z.object({ message: z.string() });
}
