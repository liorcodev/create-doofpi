import { routes, publicEndpointBuilder } from '../../doofpi';
import { Greet } from './helloModel';

export const helloRoute = routes({
  greet: publicEndpointBuilder
    .model({ input: Greet.Input, output: Greet.Output })
    .read(({ input }) => ({ message: `Hello, ${input.name}!` }))
});
