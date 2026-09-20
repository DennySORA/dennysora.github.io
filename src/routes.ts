import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('app/home.tsx'),
  route('*', 'app/page.tsx'),
] satisfies RouteConfig;
