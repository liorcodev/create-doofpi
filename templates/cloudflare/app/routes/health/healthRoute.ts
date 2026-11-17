import { routes, publicEndpointBuilder } from '../../doofpi';
import { Health } from './healthModel';

export const healthRoute = routes({
  check: publicEndpointBuilder
    .model({ input: Health.Input, output: Health.Output })
    .read(() => ({ status: 'ok' as const }))
});
