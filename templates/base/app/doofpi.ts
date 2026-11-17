import Doofpi from 'doofpi';

export const d = new Doofpi({ root: '/doofpi' }).onError(({ error }) => {
  console.error('onError: ', error.status + ' | ' + error.message);
  return { message: error.message, status: error.status, issues: error.issues };
});

export const publicEndpointBuilder = d.endpointBuilder;
export default d;
export const routes = d.routes.bind(d);
