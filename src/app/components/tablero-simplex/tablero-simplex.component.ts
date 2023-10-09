import { Component, Input, OnInit } from '@angular/core';
import * as math from 'node_modules/mathjs'

@Component({
  selector: 'app-tablero-simplex',
  templateUrl: './tablero-simplex.component.html',
  styleUrls: ['./tablero-simplex.component.scss']
})
export class TableroSimplexComponent implements OnInit {

  @Input() public Cj: number[] = [];
  @Input() public R: number[][] = [];
  @Input() public sign: string[] = [];
  @Input() public b_matrix: number[] = [];
  @Input() public sense: string = "";

  public b: any;
  public R_matrix: any
  public R_matrix_original: any
  public b_original!: number[];
  public Zj: number[] = []
  public Cb: number[] = [];
  public Zj_Cj: number[] = []
  public Xb: string[] = []
  public columns: string[] = [];
  public B: number[][] = []
  public B_inv: any;

  public boardSize!: number[];
  public zValue!: number;
  public ratios!: number[];

  public Cb_cache: Array<Array<number>> = []
  public R_cache: Array<Array<Array<number>>> = []
  public b_cache: Array<Array<number>> = []
  public Xb_cache: Array<Array<string>> = []
  public Zj_cache: Array<Array<number>> = []
  public Zj_Cj_cache: Array<Array<number>> = []
  public zValue_cache: Array<number> = []
  public ratio_cache: Array<Array<number>> = []
  public showBoard = false;

  // Cj = [2, 4]
  // R = [[2, 3], [1, 3], [1, 1]]
  // R_matrix: any
  // R_matrix_original: any
  // sign = ["<=", "<=", "<="]
  // b_matrix: number[] = [48, 42, 21]
  // b: any
  // b_original: number[] = [48, 42, 21]
  // Zj: number[] = [];
  // Cb: number[] = [];
  // Zj_Cj: number[] = []
  // Xb: string[] = []
  // columns: string[] = [];
  // B: number[][] = []
  // B_inv: any;
  // sense: string = "Max"

  // Cj = [4, 1]
  // R = [[3, 1], [4, 3], [1, 2]]
  // R_matrix: any
  // R_matrix_original: any
  // sign = ["=", ">=", "<="]
  // b: any = math.matrix([3, 6, 4])
  // b_original: number[] = [3, 6, 4]
  // Zj: number[] = [];
  // Cb: number[] = [];
  // Zj_Cj: number[] = []
  // Xb: string[] = []
  // columns: string[] = [];
  // B: number[][] = []
  // B_inv: any;

  // Cj = [2, 1, 3]
  // R = [[1, 1, 2], [2, 3, 4], [4, 6, 8]]
  // R_matrix: any
  // R_matrix_original: any
  // sign = ["<=", "=", "="]
  // b: any = math.matrix([15, 12, 24])
  // b_original: number[] = [15, 12, 24]
  // Zj: number[] = [];
  // Cb: number[] = [];
  // Zj_Cj: number[] = []
  // Xb: string[] = []
  // columns: string[] = [];
  // B: number[][] = []
  // B_inv: any;

  p = 1
  counter = 0

  s_index = 1;
  a_index = 1;

  ngOnInit(): void {

    this.b = math.matrix(this.b_matrix)
    this.b_original = this.b_matrix

    this.Cj.forEach((c, ind) => {
      this.columns.push(`X${ind + 1}`)
    })

    this.normalize();
    this.boardSize = new Array(this.Xb.length)
    this.solveZ();

    if (this.p != 0)
      this.print();

    let index = this.optimalityTest().index
    this.calculateRatio(math.transpose(this.R_matrix).toArray()[index], this.b)

    this.updateBoard(this.optimalityTest().index)
  }

  getM(): number {
    let maxMatrix = math.max(this.Cj)
    let maxRestrictions = math.max(this.R_matrix)

    let maxBetween = Math.max(maxMatrix, maxRestrictions)
    let lengthMax = maxBetween.toString().length
    let number = new Array(lengthMax + 2).fill(0)
    number[0] = this.sense == "Min" ? 1 : -1

    return parseInt(number.join(""))
  }

  magicRoundSeries(a: number[]) {
    let result: number[] = []
    for (let num of a) {

      let proxToFloor = new RegExp(/\.(000+)/g)
      let proxToZero = new RegExp(/\de-[1-9]{2}$/g)
      let proxToCeil = new RegExp(/\.(999+)/g)
      let proxToFirstDecimal = new RegExp(/\.[1-8](999+)/g)

      if (proxToFirstDecimal.test(num.toString())) {
        result.push(math.round(num, 1))
      }
      if (proxToCeil.test(num.toString()) ||
        proxToZero.test(num.toString()) ||
        proxToFloor.test(num.toString())
      ) {
        result.push(math.round(num))
      } else {
        result.push(num)
      }
    }

    return result;
  }

  magicRound(num: number) {
    let proxToFloor = new RegExp(/\.(000+)/g)
    let proxToZero = new RegExp(/\de-[1-9]{2}$/g)
    let proxToCeil = new RegExp(/\.(999+)/g)
    let proxCeilToFirstDecimal = new RegExp(/\.[1-8](999+)/g)
    let proxFloorToFirstDecimal = new RegExp(/\.[1-8](000+)/g)

    if (proxCeilToFirstDecimal.test(num.toString()) || proxFloorToFirstDecimal.test(num.toString())) {
      return (math.round(num, 1))
    }
    if (proxToCeil.test(num.toString()) ||
      proxToZero.test(num.toString()) ||
      proxToFloor.test(num.toString())
    ) {
      return math.round(num)
    } else {
      return num
    }
  }


  normalize() {

    let identityMatrix = math.identity(this.R.length)
    this.R_matrix = math.concat(this.R, identityMatrix);

    let b = math.transpose(this.R_matrix).toArray()

    this.sign.forEach((el, ind) => {
      if (el == ">=") {
        let array = new Array(this.R.length)

        array.fill(0).forEach((e, i) => {
          if (i == ind)
            array[i] = -1
        })

        b.unshift(array)

        for (let i = 0; i < this.R.length - 1 + ind; i++) {
          let tmp = b[i]
          b[i] = b[i + 1]
          b[i + 1] = tmp
        }
        this.R_matrix = math.matrix(math.transpose(b))
      }
    })

    this.setNormalizedVariables()
    this.R_matrix_original = math.clone(this.R_matrix);
  }

  setNormalizedVariables() {
    let M = this.getM()

    for (let sign of this.sign) {
      switch (sign) {
        case "<=":
          this.columns.push(`S${this.s_index}`)
          this.Xb.push(`S${this.s_index}`)
          this.Cj.push(0)
          this.s_index += 1;
          this.Cb.push(0)
          break;
        case ">=":
          this.columns.push(`S${this.s_index}`)
          this.columns.push(`A${this.a_index}`)
          this.Cj.push(0)
          this.Cj.push(M)
          this.Cb.push(M)
          this.Xb.push(`A${this.a_index}`)
          this.s_index += 1;
          this.a_index += 1;
          break;
        case "=":
          this.columns.push(`A${this.a_index}`)
          this.Xb.push(`A${this.a_index}`)
          // TODO: M grande
          this.Cj.push(M)
          this.Cb.push(M)
          this.a_index += 1;
          break;
      }
    }
  }

  solveZ() {
    this.Zj = []
    this.Zj_Cj = []
    math.transpose(this.R_matrix.toArray()).forEach((row: []) => {
      this.Zj.push(math.sum(math.dotMultiply(this.Cb, row)))
    })

    this.zValue = math.sum(math.dotMultiply(this.Cb, this.b))

    this.Zj.forEach((el, ind) => {
      this.Zj_Cj.push(el - this.Cj[ind])
    })

    this.Zj = math.map(this.Zj, (el) => this.magicRound(el))
    this.Zj_Cj = math.map(this.Zj_Cj, (el) => this.magicRound(el))
  }

  optimalityTest() {
    //Minimization
    if (this.sense == "Min") {
      return { "state": this.Zj_Cj.every(el => el <= 0), "index": this.Zj_Cj.findIndex(e => e == math.max(this.Zj_Cj)) }
    }
    //Maximization
    return { "state": this.Zj_Cj.every(el => el >= 0), "index": this.Zj_Cj.findIndex(e => e == math.min(this.Zj_Cj)) }
  }

  calculateRatio(pivot: number[], b: number[]) {
    let ratio: number[] = [];
    pivot.forEach((el, ind) => {
      ratio.push(b[ind] / el)
    })
    return ratio
  }

  outgoingRow(row: number[]) {
    let outRow = row
    outRow = math.map(outRow, (el) => this.magicRound(el))
    return this.findIndexMinGreaterThanZero(outRow)
  }

  findIndexMinGreaterThanZero(row: number[]) {
    let comparator: number = 999999999
    let index = -1
    for (let i = 0; i < row.length; i++) {
      if (row[i] < comparator && row[i] >= 0) {
        comparator = row[i];
        index = i
      }
    }
    return index
  }

  findIndexMaxGreaterThanZero(row: number[]) {
    let comparator: number = -999999999
    let index = -1
    for (let i = 0; i < row.length; i++) {
      if (row[i] > comparator && row[i] >= 0) {
        comparator = row[i];
        index = i
      }
    }
    return index
  }

  updateBoard(col: number) {

    let ratioMatrix: number[] = []
    if (!this.optimalityTest().state) {
      let index = this.optimalityTest().index
      ratioMatrix = this.calculateRatio(math.transpose(this.R_matrix.toArray())[index], this.b.toArray())
    }

    let row = this.outgoingRow(ratioMatrix)


    this.Xb[row] = this.columns[col]
    this.Cb[row] = this.Cj[col]

    this.checkXb()

    this.B = math.transpose(this.B)
    this.B_inv = math.inv(this.B)

    this.R_matrix = math.multiply(math.matrix(this.B_inv), this.R_matrix_original)
    this.R_matrix = math.map(this.R_matrix, (el) => this.magicRound(el))

    this.b = math.multiply(math.matrix(this.B_inv), this.b_original)
    this.b = math.map(this.b, (el) => this.magicRound(el))

    this.solveZ()

    if (this.p == 1) {
      this.print()
    }

    if (!this.optimalityTest().state)
      this.updateBoard(this.optimalityTest().index)
  }

  checkXb() {
    this.B = []
    this.Xb.forEach(el => {
      this.B.push(math.transpose(this.R_matrix_original.toArray())[this.columns.findIndex(e => e == el)]);
    })
  }

  print() {

    console.log("\n\n");

    console.log("Cj");
    console.log(this.Cj)
    console.log("Cb");
    console.log(this.Cb)
    this.Cb_cache.push(math.matrix(math.clone(this.Cb)).toArray() as number[])
    console.log("R");
    console.log(this.R_matrix.toArray())
    this.R_cache.push(this.R_matrix.toArray())
    console.log("b");
    console.log(this.b.toArray())
    this.b_cache.push(this.b.toArray())
    console.log("B");
    console.log(this.B);
    if (this.B.length > 0) {
      console.log("B_inv");
      console.log(math.inv(this.B));
    }
    console.log("columns");
    console.log(this.columns)
    console.log("Xb");
    console.log(this.Xb)
    this.Xb_cache.push(Array.from(this.Xb))
    console.log("Zj");
    console.log(this.Zj)
    this.Zj_cache.push(this.Zj)
    console.log("Zj_Cj");
    console.log(this.Zj_Cj)
    this.Zj_Cj_cache.push(this.Zj_Cj)
    console.log("zValue")
    console.log(this.zValue)
    this.zValue_cache.push(this.zValue)
    console.log("Optimality Test");
    console.log(this.optimalityTest())

    if (!this.optimalityTest().state) {
      let outgoingCol = this.optimalityTest().index
      console.log("Columna de salida")
      console.log(outgoingCol);
      console.log("Fila de salida");
      let rowMatrix = this.calculateRatio(math.transpose(this.R_matrix.toArray())[outgoingCol], this.b.toArray())
      console.log(this.outgoingRow(rowMatrix));
      console.log("Ratio")
      this.ratios = math.map(rowMatrix, (el) => this.magicRound(el))
      console.log(this.ratios)
      this.ratio_cache.push(this.ratios)
    } else {
      this.ratio_cache.push([])
      this.showBoard = true;
    }
  }

}
