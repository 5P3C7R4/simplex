import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TableroSimplexComponent } from './components/tablero-simplex/tablero-simplex.component';
import { FormularioSimplexComponent } from './components/formulario-simplex/formulario-simplex.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    TableroSimplexComponent,
    FormularioSimplexComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
