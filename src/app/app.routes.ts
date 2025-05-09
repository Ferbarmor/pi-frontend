import { Routes } from '@angular/router';
import { ListadoTestsComponent } from './components/listado-tests/listado-tests.component';
import { FormRegisterComponent } from './components/form-register/form-register.component';
import { FormLoginComponent } from './components/form-login/form-login.component';
import { FormUploadPhotoComponent } from './components/form-upload-photo/form-upload-photo.component';
import { Component } from '@angular/core';
import { PhotosComponent } from './components/photos/photos.component';
import { PanelAdminComponent } from './components/panel-admin/panel-admin.component';
import { ContestRulesComponent } from './components/contest-rules/contest-rules.component';
import { HomeComponent } from './components/home/home.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { StatisticComponent } from './components/statistic/statistic.component';

export const routes: Routes = [
    {path: "listado-tests-photos", component: ListadoTestsComponent},
    {path: "register", component: FormRegisterComponent},
    //{path:"register/:id", component: FormRegisterComponent},
    {path: "login", component: FormLoginComponent},
    {path: "upload-photo", component: FormUploadPhotoComponent},
    //{path: "upload-photo/:id", component: FormUploadPhotoComponent},
    {path: "photos", component: PhotosComponent},
    {path: "photos/:id", component: PhotosComponent, runGuardsAndResolvers: 'paramsChange'},
    {path: "admin", component: PanelAdminComponent},
    {path: "contest-rules", component: ContestRulesComponent},
    {path: "", component: HomeComponent},
    {path: "configuration", component: ConfigurationComponent},
    {path: "estadisticas", component: StatisticComponent},
    
];
