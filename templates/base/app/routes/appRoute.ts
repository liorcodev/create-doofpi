import { routes } from '../doofpi';
import { helloRoute } from './hello/helloRoute';

const appRoute = routes({ hello: helloRoute });

export type AppRoute = typeof appRoute;
export default appRoute;
