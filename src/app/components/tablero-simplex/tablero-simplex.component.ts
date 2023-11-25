import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as math from 'node_modules/mathjs';

@Component({
  selector: 'app-tablero-simplex',
  templateUrl: './tablero-simplex.component.html',
  styleUrls: ['./tablero-simplex.component.scss'],
})
export class TableroSimplexComponent implements OnInit {
  // @Input() public Cj: number[] = [];
  // @Input() public R: number[][] = [];
  // @Input() public sign: string[] = [];
  // @Input() public b_matrix: number[] = [];
  // @Input() public sense: string = "";

  // public b: any;
  // public R_matrix: any
  // public R_matrix_original: any
  // public b_original!: number[];
  // public Zj: number[] = []
  // public Cb: number[] = [];
  // public Zj_Cj: number[] = []
  // public Xb: string[] = []
  // public columns: string[] = [];
  // public B: number[][] = []
  // public B_inv: any;

  public boardSize!: number[];
  public zValue!: number;
  public ratios!: number[];

  public Cj_cache: Array<Array<number>> = [];
  public Cb_cache: Array<Array<number>> = [];
  public R_cache: Array<Array<Array<number>>> = [];
  public b_cache: Array<Array<number>> = [];
  public Xb_cache: Array<Array<string>> = [];
  public Zj_cache: Array<Array<number>> = [];
  public Zj_Cj_cache: Array<Array<number>> = [];
  public zValue_cache: Array<number> = [];
  public ratio_cache: Array<Array<number>> = [];
  public showBoard = false;
  public outgoingCol: string[] = [];
  public outgoingRow: string[] = [];

  // Cj = [20, 50, 35];
  // Cj_Two_Phases: number[] = [];
  // R = [
  //   [1, 1, 1],
  //   [-1 / 2, 1, 1],
  //   [2, 4, 3],
  // ];
  // artifIndexes: number[] = [];
  // R_matrix: any;
  // R_matrix_original: any;
  // sign = ['<=', '<=', '<='];
  // b_matrix: number[] = [75, 0, 240];
  // b: any;
  // b_original: number[] = [75, 0, 240];
  // Zj: number[] = [];
  // Cb: number[] = [];
  // Zj_Cj: number[] = [];
  // Xb: string[] = [];
  // columns: string[] = [];
  // B: number[][] = [];
  // B_inv: any;
  // sense: string = 'Max';
  // sense_cache = '';
  // sense_Two_Phases: string = 'Min';
  // method: string = 'M';
  // method: string = "TwoPhases"

  // Cj = [2,3, 4];
  // Cj_Two_Phases: number[] = [];
  // R = [
  //   [1, 2, 1],
  //   [1, -2, 1],
  //   [0, 2, 1],
  // ];
  // artifIndexes: number[] = [];
  // R_matrix: any;
  // R_matrix_original: any;
  // sign = ['=', '>=', '<='];
  // b_matrix: number[] = [3, 1, 1];
  // b: any;
  // b_original: number[] = [3, 1, 1];
  // Zj: number[] = [];
  // Cb: number[] = [];
  // Zj_Cj: number[] = [];
  // Xb: string[] = [];
  // columns: string[] = [];
  // B: number[][] = [];
  // B_inv: any;
  // sense: string = 'Max';
  // sense_cache = '';
  // sense_Two_Phases: string = 'Min';
  // method: string = 'M';
  // method: string = 'TwoPhases';

  Cj = [200,350,150,450];
  Cj_Two_Phases: number[] = [];
  R = [
    [1,1,1,1],
    [5,20,0,0],
    [0,0,11,23]
  ];
  artifIndexes: number[] = [];
  R_matrix: any;
  R_matrix_original: any;
  sign = ['>=', '<=', '<='];
  b_matrix: number[] = [22,80,80];
  b: any;
  b_original: number[] = [22,80,80];
  Zj: number[] = [];
  Cb: number[] = [];
  Zj_Cj: number[] = [];
  Xb: string[] = [];
  columns: string[] = [];
  B: number[][] = [];
  B_inv: any;
  sense: string = 'Max';
  sense_cache = '';
  sense_Two_Phases: string = 'Min';
  method: string = 'M';

  // Cj = [2,4, 5];
  // Cj_Two_Phases: number[] = [];
  // R = [
  //   [1, 3, 2],
  //   [1, 2, 3],
  // ];
  // artifIndexes: number[] = [];
  // R_matrix: any;
  // R_matrix_original: any;
  // sign = ['<=', '<='];
  // b_matrix: number[] = [5, 6];
  // b: any;
  // b_original: number[] = [5, 6];
  // Zj: number[] = [];
  // Cb: number[] = [];
  // Zj_Cj: number[] = [];
  // Xb: string[] = [];
  // columns: string[] = [];
  // B: number[][] = [];
  // B_inv: any;
  // sense: string = 'Max';
  // sense_cache = '';
  // sense_Two_Phases: string = 'Min';
  // method: string = 'M';

  p = 1;
  counter = 0;
  valid = true;
  validBoard = true;
  s_index = 1;
  a_index = 1;
  phase = 1;
  prueba = 0;
  standarVar: string[][] = [];
  stand: string[] = [];

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.validateShapes();
    this.initialize();
  }

  initialize() {
    if (this.validBoard) {
      this.b = math.matrix(this.b_matrix);
      this.b_original = this.b_matrix;

      this.Cj.forEach((c, ind) => {
        this.columns.push(`X${ind + 1}`);
      });

      this.normalize();
      this.getStandarVariables();
      this.boardSize = new Array(this.Xb.length);
      this.solveZ();

      if (this.p != 0) this.print();

      if (this.method == 'TwoPhases') {
        this.sense_cache = this.sense.toString();
        this.sense = this.sense_Two_Phases.toString();
      }

      let index = this.optimalityTest().index;
      this.calculateRatio(
        math.transpose(this.R_matrix).toArray()[index],
        this.b
      );

      if (!this.optimalityTest().optimal)
        this.updateBoard(this.optimalityTest().index);

      this.showBoard = true;
    }
  }

  getStandarVariables() {
    let array: string[] = [];
    this.Cj.forEach((el: any, ind: number) => {
      if (el == 1) array.push(this.columns[ind]);
      else array.push(el.toString() + this.columns[ind].toString());
    });
    this.standarVar.push(array);
    this.R_matrix.toArray().forEach((row: any) => {
      let array: any[] = [];
      row.forEach((el: any, ind: number) => {
        if (el == 1) array.push(this.columns[ind]);
        else array.push(el.toString() + this.columns[ind].toString());
      });
      this.standarVar.push(array);
    });

    this.sign.forEach((sign, ind) => {
      this.standarVar[ind + 1].push(sign);
    });
    this.b_matrix.forEach((b, ind) => {
      this.standarVar[ind + 1].push(b.toString());
    });
    console.log(this.standarVar);
    this.stand = this.standarVar.map((row) => row.join('+'));
  }

  getM(): number {
    let maxMatrix = math.max(this.Cj);
    let maxRestrictions = math.max(this.R_matrix);

    let maxBetween = Math.max(maxMatrix, maxRestrictions);
    let lengthMax = maxBetween.toString().length;
    let number = new Array(lengthMax + 2).fill(0);
    number[0] = this.sense == 'Min' ? 1 : -1;

    return parseInt(number.join(''));
  }

  magicRoundSeries(a: number[]) {
    let result: number[] = [];
    for (let num of a) {
      let proxToFloor = new RegExp(/\.(000+)/g);
      let proxToZero = new RegExp(/\de-[1-9]{2}$/g);
      let proxToCeil = new RegExp(/\.(999+)/g);
      let proxToFirstDecimal = new RegExp(/\.[1-8](999+)/g);

      if (proxToFirstDecimal.test(num.toString())) {
        result.push(math.round(num, 1));
      }
      if (
        proxToCeil.test(num.toString()) ||
        proxToZero.test(num.toString()) ||
        proxToFloor.test(num.toString())
      ) {
        result.push(math.round(num));
      } else {
        result.push(num);
      }
    }

    return result;
  }

  magicRound(num: number) {
    let proxToFloor = new RegExp(/\.(000+)/g);
    let proxToZero = new RegExp(/\de-[1-9]{2}$/g);
    let proxToCeil = new RegExp(/\.(999+)/g);
    let proxCeilToFirstDecimal = new RegExp(/\.[1-8](999+)/g);
    let proxFloorToFirstDecimal = new RegExp(/\.[1-8](000+)/g);

    if (
      proxCeilToFirstDecimal.test(num.toString()) ||
      proxFloorToFirstDecimal.test(num.toString())
    ) {
      return math.round(num, 1);
    }
    if (
      proxToCeil.test(num.toString()) ||
      proxToZero.test(num.toString()) ||
      proxToFloor.test(num.toString())
    ) {
      return math.round(num);
    } else {
      return num;
    }
  }

  normalize() {
    let identityMatrix = math.identity(this.R.length);
    this.R_matrix = math.concat(this.R, identityMatrix);

    let b = math.transpose(this.R_matrix).toArray();
    let counter = 0;
    this.sign.forEach((el, ind) => {
      if (el == '=') counter += 1;
      if (el == '<=') counter += 1;
      if (el == '>=') {
        let array = new Array(this.R.length);

        array.fill(0).forEach((e, i) => {
          if (i == ind) array[i] = -1;
        });

        b.unshift(array);

        for (let i = 0; i < this.Cj.length + counter; i++) {
          let tmp = b[i];
          b[i] = b[i + 1];
          b[i + 1] = tmp;
        }

        this.R_matrix = math.matrix(math.transpose(b));
        counter += 2;
      }
    });

    this.setNormalizedVariables();

    if (this.method == 'TwoPhases' && this.phase == 1) {
      this.columns.forEach((el, ind) => {
        if (el.startsWith('A')) {
          this.artifIndexes.push(ind);
        }
      });
      this.Cj.forEach((el) => {
        this.Cj_Two_Phases.push(el);
      });
      this.Cj = new Array(this.Cj.length).fill(0);
      this.artifIndexes.forEach((el) => {
        this.Cj[el] = 1;
      });
    }
    this.R_matrix_original = math.clone(this.R_matrix);
  }

  setNormalizedVariables() {
    let M = this.getM();

    for (let sign of this.sign) {
      switch (sign) {
        case '<=':
          this.columns.push(`S${this.s_index}`);
          this.Xb.push(`S${this.s_index}`);
          this.Cj.push(0);
          this.s_index += 1;
          this.Cb.push(0);
          break;
        case '>=':
          this.columns.push(`S${this.s_index}`);
          this.columns.push(`A${this.a_index}`);
          this.Cj.push(0);
          if (this.method != 'TwoPhases') {
            this.Cj.push(M);
            this.Cb.push(M);
          } else {
            this.Cj.push(1);
            this.Cb.push(1);
          }
          this.Xb.push(`A${this.a_index}`);
          this.s_index += 1;
          this.a_index += 1;
          break;
        case '=':
          this.columns.push(`A${this.a_index}`);
          this.Xb.push(`A${this.a_index}`);
          if (this.method != 'TwoPhases') {
            this.Cj.push(M);
            this.Cb.push(M);
          } else {
            this.Cj.push(1);
            this.Cb.push(1);
          }
          this.a_index += 1;
          break;
      }
    }
  }

  solveZ() {
    this.Zj = [];
    this.Zj_Cj = [];
    math.transpose(this.R_matrix.toArray()).forEach((row: []) => {
      this.Zj.push(math.sum(math.dotMultiply(this.Cb, row)));
    });

    this.zValue = math.sum(math.dotMultiply(this.Cb, this.b));

    this.Zj.forEach((el, ind) => {
      this.Zj_Cj.push(el - this.Cj[ind]);
    });

    this.Zj = math.map(this.Zj, (el) => this.magicRound(el));
    this.Zj_Cj = math.map(this.Zj_Cj, (el) => this.magicRound(el));
  }

  optimalityTest() {
    if (this.sense == 'Min') {
      if (this.phase == 2) {
        return {
          optimal: this.checkAllLessThanZeroNotIn(
            this.Zj_Cj,
            this.artifIndexes
          ),
          index: this.findMaxNotIn(this.Zj_Cj, this.artifIndexes),
        };
      } else {
        return {
          optimal: this.Zj_Cj.every((el) => el <= 0),
          index: this.Zj_Cj.findIndex((e) => e == math.max(this.Zj_Cj)),
        };
      }
    }
    if (this.phase == 2) {
      return {
        optimal: this.checkAllGreaterThanZeroNotIn(
          this.Zj_Cj,
          this.artifIndexes
        ),
        index: this.findMinNotIn(this.Zj_Cj, this.artifIndexes),
      };
    } else {
      return {
        optimal: this.Zj_Cj.every((el) => el >= 0),
        index: this.Zj_Cj.findIndex((e) => e == math.min(this.Zj_Cj)),
      };
    }
  }

  calculateRatio(pivot: number[], b: number[]) {
    let ratio: number[] = [];
    pivot.forEach((el, ind) => {
      if (el == 0) {
        ratio.push(0);
      } else {
        ratio.push(b[ind] / el);
      }
    });
    return ratio;
  }

  getOutgoingRow(row: number[]) {
    let outRow = row;
    outRow = math.map(outRow, (el) => this.magicRound(el));
    return this.findIndexMinGreaterThanZero(outRow);
  }

  checkAllLessThanZeroNotIn(row: number[], excludeList: number[]) {
    let comparator = true;
    for (let i = 0; i < row.length; i++) {
      if (!excludeList.includes(i)) comparator = comparator && row[i] <= 0;
    }
    return comparator;
  }

  checkAllGreaterThanZeroNotIn(row: number[], excludeList: number[]) {
    let comparator = true;
    for (let i = 0; i < row.length; i++) {
      if (!excludeList.includes(i)) comparator = comparator && row[i] >= 0;
    }
    return comparator;
  }

  findMaxNotIn(row: number[], excludeList: number[]) {
    let comparator = -999999999;
    let index = -1;
    row.forEach((e, ind) => {
      if (e > comparator && !excludeList.includes(ind)) {
        comparator = e;
        index = ind;
      }
    });
    return index;
  }

  findMinNotIn(row: number[], excludeList: number[]) {
    let comparator = 999999999;
    let index = -1;
    row.forEach((e, ind) => {
      if (e < comparator && !excludeList.includes(ind)) {
        comparator = e;
        index = ind;
      }
    });
    return index;
  }

  findIndexMinGreaterThanZero(row: number[]) {
    let comparator: number = 999999999;
    let index = -1;
    for (let i = 0; i < row.length; i++) {
      if (row[i] < comparator && row[i] > 0) {
        comparator = row[i];
        index = i;
      }
    }
    return index;
  }

  findIndexMaxGreaterThanZero(row: number[]) {
    let comparator: number = -999999999;
    let index = -1;
    for (let i = 0; i < row.length; i++) {
      if (row[i] > comparator && row[i] >= 0) {
        comparator = row[i];
        index = i;
      }
    }
    return index;
  }

  updateBoard(col: number) {
    this.prueba += 1;
    if (this.valid) {
      let ratioMatrix: number[] = [];
      if (!this.optimalityTest().optimal) {
        let index = this.optimalityTest().index;
        ratioMatrix = this.calculateRatio(
          math.transpose(this.R_matrix.toArray())[index],
          this.b.toArray()
        );
      }

      let row = this.getOutgoingRow(ratioMatrix);

      this.Xb[row] = this.columns[col];
      this.Cb[row] = this.Cj[col];

      this.checkXb();

      this.B = math.transpose(this.B);
      this.B_inv = math.inv(this.B);

      this.R_matrix = math.multiply(
        math.matrix(this.B_inv),
        this.R_matrix_original
      );
      this.R_matrix = math.map(this.R_matrix, (el) => this.magicRound(el));

      this.b = math.multiply(math.matrix(this.B_inv), this.b_original);
      this.b = math.map(this.b, (el) => this.magicRound(el));

      this.solveZ();

      if (this.p == 1) {
        this.print();
      }

      if (
        this.optimalityTest().optimal &&
        this.method == 'TwoPhases' &&
        this.phase == 1
      ) {
        this.TwoPhasesMethod();
      } else if (!this.optimalityTest().optimal)
        this.updateBoard(this.optimalityTest().index);
    }
  }

  TwoPhasesMethod() {
    console.log('Fase 2');
    this.outgoingCol.push('');
    this.outgoingRow.push('');
    this.phase = 2;
    this.sense = this.sense_cache.toString();
    this.artifIndexes.forEach((el) => {
      this.Cj_Two_Phases[el] = 0;
    });
    this.Cj = this.Cj_Two_Phases;
    this.getCb();
    this.solveZ();
    this.print();
    this.updateBoard(this.optimalityTest().index);
  }

  checkXb() {
    this.B = [];
    this.Xb.forEach((el) => {
      this.B.push(
        math.transpose(this.R_matrix_original.toArray())[
          this.columns.findIndex((e) => e == el)
        ]
      );
    });
  }

  getCb() {
    let indexes: number[] = [];
    this.Xb.forEach((el) => {
      indexes.push(this.columns.findIndex((col) => col == el));
    });
    this.Cb = [];
    indexes.forEach((el) => {
      this.Cb.push(this.Cj[el]);
    });
  }

  print() {
    console.log('\n\n');
    console.log(this.sense);
    console.log('Cj');
    console.log(this.Cj);
    this.Cj_cache.push(this.Cj);
    console.log('Cb');
    console.log(this.Cb);
    this.Cb_cache.push(math.matrix(math.clone(this.Cb)).toArray() as number[]);
    console.log('R');
    console.log(this.R_matrix.toArray());
    this.R_cache.push(this.R_matrix.toArray());
    console.log('b');
    console.log(this.b.toArray());
    this.b_cache.push(this.b.toArray());
    console.log('B');
    console.log(this.B);
    if (this.B.length > 0) {
      console.log('B_inv');
      console.log(math.inv(this.B));
    }
    console.log('columns');
    console.log(this.columns);
    console.log('Xb');
    console.log(this.Xb);
    this.Xb_cache.push(Array.from(this.Xb));
    console.log('Zj');
    console.log(this.Zj);
    this.Zj_cache.push(this.Zj);
    console.log('Zj_Cj');
    console.log(this.Zj_Cj);
    // this.validateAlternativeOptimals();
    this.Zj_Cj_cache.push(this.Zj_Cj);
    console.log('zValue');
    console.log(this.zValue);
    this.zValue_cache.push(this.zValue);
    console.log('Optimality Test');
    console.log(this.optimalityTest());

    if (this.optimalityTest().optimal || !this.valid) {
      this.showBoard = true;
    }

    if (!this.optimalityTest().optimal) {
      let outgoingCol = this.optimalityTest().index;
      console.log('Columna de salida');
      console.log(outgoingCol);
      this.outgoingCol.push(this.columns[outgoingCol]);
      console.log('Fila de salida');
      let rowMatrix = this.calculateRatio(
        math.transpose(this.R_matrix.toArray())[outgoingCol],
        this.b.toArray()
      );
      let outgoingRow = this.getOutgoingRow(rowMatrix);
      console.log(outgoingRow);
      this.outgoingRow.push(this.Xb[outgoingRow]);
      console.log('Ratio');
      this.ratios = math.map(rowMatrix, (el) => this.magicRound(el));
      // this.validateNotBoundedSolution();
      // this.validateDegeneration();
      console.log(this.ratios);
      this.ratio_cache.push(this.ratios);
    } else {
      this.ratio_cache.push([]);
    }
  }

  validateDegeneration() {
    let ratios: number[] = [];
    this.ratios.forEach((ratio) => {
      ratios.push(ratio);
    });
    ratios.sort((a, b) => a - b);

    for (let i = 0; i < ratios.length - 1; i++) {
      if (ratios[i] == ratios[i + 1]) {
        this.toastr.error('Degeneración hallada en el algoritmo');
        this.valid = false;
        break;
      }
    }
  }

  validateAlternativeOptimals() {
    let columns: string[] = [];
    this.columns.forEach((col) => columns.push(col));
    let Xnb = columns.filter((el) => !this.Xb.includes(el));
    let indexesXnb: number[] = [];
    Xnb.forEach((xnb) => {
      indexesXnb.push(columns.findIndex((el) => el == xnb));
    });

    for (const element of indexesXnb) {
      if (this.Zj_Cj[element] == 0) {
        this.toastr.error('Óptimos alternativos encontrados');
        this.valid = false;
        break;
      }
    }
  }

  validateNotBoundedSolution() {
    if (this.ratios.every((el) => el <= 0)) {
      this.toastr.error('Solución no acotada hallada');
      this.valid = false;
    }
  }

  validateShapes() {
    let restrictionRows = this.R.length;
    let cjCols = this.Cj.length;
  }
}
