import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { TableroSimplexComponent } from './components/tablero-simplex/tablero-simplex.component';
import { FormularioSimplexComponent } from './components/formulario-simplex/formulario-simplex.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConcatVarsPipe } from 'src/app/pipes/concat-vars.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TableroSimplexComponent,
    FormularioSimplexComponent,
    ConcatVarsPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
