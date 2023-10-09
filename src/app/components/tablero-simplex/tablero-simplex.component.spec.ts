import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableroSimplexComponent } from './tablero-simplex.component';

describe('TableroSimplexComponent', () => {
  let component: TableroSimplexComponent;
  let fixture: ComponentFixture<TableroSimplexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableroSimplexComponent]
    });
    fixture = TestBed.createComponent(TableroSimplexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
