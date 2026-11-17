import { routes } from '../doofpi';
import { healthRoute } from './health/healthRoute';

const appRoute = routes({ health: healthRoute });

export type AppRoute = typeof appRoute;
export default appRoute;