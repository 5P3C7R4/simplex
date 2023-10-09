import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-formulario-simplex',
  templateUrl: './formulario-simplex.component.html',
  styleUrls: ['./formulario-simplex.component.scss']
})
export class FormularioSimplexComponent implements OnInit {

  public form!: FormGroup
  public zVars: number = 1;
  public zVarsCache: number = 1;
  public restrictNum: number = 1;
  public sense: number = 0;
  public Xghost = new Array(9)
  public X: Array<number | null> = [null, null, null, null, null, null, null, null, null]
  public Rghost = [new Array(1), [], [], [], [], [], [], [], []]
  public R: Array<Array<number | null>> = [
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
  ];
  public signs: string[] = ["<=", "<=", "<=", "<=", "<=", "<=", "<=", "<=", "<=",];
  public b: number[] = new Array<number>(9);

  @Output() public xEmitter: EventEmitter<Array<number>> = new EventEmitter();
  @Output() public rEmitter: EventEmitter<Array<Array<number>>> = new EventEmitter();
  @Output() public signEmitter: EventEmitter<Array<string>> = new EventEmitter();
  @Output() public bEmitter: EventEmitter<Array<number>> = new EventEmitter();

  ngOnInit(): void {
    this.changesOnZVars().subscribe({
      next: (zVar) => {
        if (zVar != this.zVarsCache) {
          this.zVarsCache = zVar
          this.Rghost = [Array.from({ length: this.zVarsCache }, () => 0), [], [], [], [], [], [], [], []]
        }
      }
    })
  }

  solve() {
    let R_clean: number[][] = []

    let X_clean: number[] = []
    this.X.slice(0, this.zVars).forEach(x => {
      if (x === null) {
        X_clean.push(0)
      } else
        X_clean.push(x)
    })

    this.R.slice(0, this.restrictNum).forEach(r => {
      let arrayR: number[] = []
      r.splice(0, this.zVars).forEach(el => {
        if (el === null) {
          arrayR.push(0)
        } else {
          arrayR.push(el)
        }
      })
      R_clean.push(arrayR)
    })

    this.xEmitter.emit(X_clean)
    this.rEmitter.emit(R_clean)
    this.signEmitter.emit(this.signs.splice(0, this.restrictNum))
    this.bEmitter.emit(this.b.splice(0, this.restrictNum))
  }

  changesOnZVars() {
    return new Observable<number>(observable => {
      setInterval(() => {
        if (this.zVars != this.zVarsCache)
          observable.next(this.zVars)
      }, 100)
    })
  }

}
