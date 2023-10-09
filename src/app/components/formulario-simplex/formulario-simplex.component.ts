import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms'
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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
  public sense: string = "Min";
  public Xghost = new Array(9)
  public Cj: Array<number | null> = new Array(9).fill(null)
  public Rghost = [new Array(1), [], [], [], [], [], [], [], []]
  public R: Array<Array<number | null>> = new Array(9).fill(0).map(e => new Array(9).fill(null))
  public signs: string[] = ["<=", "<=", "<=", "<=", "<=", "<=", "<=", "<=", "<=",];
  public b: number[] = new Array<number>(9);

  @Output() public xEmitter: EventEmitter<Array<number>> = new EventEmitter();
  @Output() public rEmitter: EventEmitter<Array<Array<number>>> = new EventEmitter();
  @Output() public signEmitter: EventEmitter<Array<string>> = new EventEmitter();
  @Output() public bEmitter: EventEmitter<Array<number>> = new EventEmitter();
  @Output() public senseEmitter: EventEmitter<string> = new EventEmitter();
  @Output() public ready: EventEmitter<boolean> = new EventEmitter();

  constructor(private toastr: ToastrService) { }

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
    let Cj_clean: number[] = []

    this.Cj.slice(0, this.zVars).forEach(x => {
      if (x === null) {
        Cj_clean.push(0)
      } else
        Cj_clean.push(x)
    })

    let R_copy: number[][] = new Array(this.R.length).fill(null).map(cell => new Array(this.R[0].length))
    this.R.forEach((row, i) => row.map((el, j) => {
      if (el == null)
        R_copy[i][j] = 0
      else
        R_copy[i][j] = el
    }))

    R_copy.slice(0, this.restrictNum).forEach(r => {
      let arrayR: number[] = []
      r.splice(0, this.zVars).forEach((el) => {
          arrayR.push(el)
      })
      R_clean.push(arrayR)
    })

    let b_copy = new Array(this.b.length).fill(null)
    this.b.forEach((e, i) => {
      b_copy[i] = e
    })
    let sense_copy = new Array(this.signs.length)
    this.signs.forEach((e, i) => {
      sense_copy[i] = e
    })

    this.xEmitter.emit(Cj_clean)
    this.rEmitter.emit(R_clean)
    this.signEmitter.emit(sense_copy.splice(0, this.restrictNum))
    this.bEmitter.emit(b_copy.splice(0, this.restrictNum))
    this.senseEmitter.emit(this.sense);
    this.ready.emit(true);
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
