import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'competitors',
    renderMode: RenderMode.Client   
  },
  {
    path: 'categories',
    renderMode: RenderMode.Client
  },
  {
    path: 'tatamis',
    renderMode: RenderMode.Client
  },
  {
    path: 'coaches',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
