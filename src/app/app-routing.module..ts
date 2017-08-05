import { LoginPage } from './../pages/login/login';
import { RegistrarPage } from './../pages/registrar/registrar';
import { ConducaoPage } from './../pages/conducao/conducao';
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 

 
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'conducao',  component: ConducaoPage },
  { path: 'login', component: LoginPage },
  { path: 'registrar', component: RegistrarPage }
];
 
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}