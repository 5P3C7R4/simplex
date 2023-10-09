import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioSimplexComponent } from './formulario-simplex.component';

describe('FormularioSimplexComponent', () => {
  let component: FormularioSimplexComponent;
  let fixture: ComponentFixture<FormularioSimplexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormularioSimplexComponent]
    });
    fixture = TestBed.createComponent(FormularioSimplexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
