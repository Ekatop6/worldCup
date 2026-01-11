import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CompetitorsComponent } from './pages/competitors/competitors';
import { CategoriesComponent } from './pages/categories/categories';
import { Tatamis } from './pages/tatamis/tatamis';
import { CoachesComponent } from './pages/coaches/coaches';
import { AdminPanelComponent } from './pages/admin/add-panel';
import { AdminGuard } from './guards/admin.guard';
import { LoginComponent } from './pages/login/login.component';
import { LeagueComponent } from './pages/league/league';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'competitors', component: CompetitorsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'tatamis', component: Tatamis },
  { path: 'coaches', component: CoachesComponent },
  { path: 'home', component: Home },
  { path: 'add-panel', component: AdminPanelComponent, canActivate: [AdminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'league', component: LeagueComponent },

];
