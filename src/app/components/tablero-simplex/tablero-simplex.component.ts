import { Component, Input, OnInit } from '@angular/core';
import * as math from 'node_modules/mathjs'

// load math.js (using node.js)

// configure the default type of numbers as Fractions
const config: math.ConfigOptions = {
  // Default type of number
  // Available options: 'number' (default), 'BigNumber', or 'Fraction'
  number: 'Fraction'
}

// create a mathjs instance with everything included
const mathF = math.create(math.all, config)

@Component({
  selector: 'app-tablero-simplex',
  templateUrl: './tablero-simplex.component.html',
  styleUrls: ['./tablero-simplex.component.scss']
})
export class TableroSimplexComponent implements OnInit {

  @Input() public Cj!: number[];
  @Input() public R!: number[][];
  @Input() public sign!: string[];
  @Input() public b!: number[];
  // public Cb!: number[];
  // public columns: string[] = [];
  // public Zj: number[] = []
  // public Zj_Cj: number[] = []


  // Cj2 = [2, 4]
  // R2 = [[2, 3], [1, 3], [1, 1]]
  // R2_matrix: any
  // R2_matrix_original: any
  // sign2 = ["<=", "<=", "<="]
  // b2: any = math.matrix([48, 42, 21])
  // b2_original: number[] = [48, 42, 21]
  // Zj2: number[] = [];
  // Cb2: number[] = [];
  // Zj_Cj2: number[] = []
  // Xb: string[] = []
  // columns2: string[] = [];
  // B: number[][] = []
  // B_inv: any;

  // Cj2 = [4, 1]
  // R2 = [[3, 1], [4, 3], [1, 2]]
  // R2_matrix: any
  // R2_matrix_original: any
  // sign2 = ["=", ">=", "<="]
  // b2: any = math.matrix([3, 6, 4])
  // b2_original: number[] = [3, 6, 4]
  // Zj2: number[] = [];
  // Cb2: number[] = [];
  // Zj_Cj2: number[] = []
  // Xb: string[] = []
  // columns2: string[] = [];
  // B: number[][] = []
  // B_inv: any;

  Cj2 = [2, 1, 3]
  R2 = [[1, 1, 2], [2, 3, 4], [4, 6, 8]]
  R2_matrix: any
  R2_matrix_original: any
  sign2 = ["<=", "=", "="]
  b2: any = math.matrix([15, 12, 24])
  b2_original: number[] = [15, 12, 24]
  Zj2: number[] = [];
  Cb2: number[] = [];
  Zj_Cj2: number[] = []
  Xb: string[] = []
  columns2: string[] = [];
  B: number[][] = []
  B_inv: any;

  sense = "Min";

  p = 1
  counter = 0

  s_index = 1;
  a_index = 1;

  ngOnInit(): void {

    this.Cj2.forEach((c, ind) => {
      this.columns2.push(`X${ind + 1}`)
    })

    this.normalize();
    this.solveZ();

    if (this.p != 0)
      this.print();

    let index = this.optimalityTest().index
    this.calculateRatio(math.transpose(this.R2_matrix).toArray()[index], this.b2)

    this.updateBoard(this.optimalityTest().index)
  }

  getM(): number {
    let maxMatrix = math.max(this.Cj2)
    let maxRestrictions = math.max(this.R2_matrix)

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
    
    let identityMatrix = math.identity(this.R2.length)
    this.R2_matrix = math.concat(this.R2, identityMatrix);

    let b = math.transpose(this.R2_matrix).toArray()
    
    this.sign2.forEach((el, ind) => {
      if (el == ">=") {
        let array = new Array(this.R2.length)
        
        array.fill(0).forEach((e, i) => {
          if (i == ind)
          array[i] = -1
      })
      
      b.unshift(array)
      
      for (let i = 0; i < this.R2.length - 1 + ind; i++) {
        let tmp = b[i]
        b[i] = b[i + 1]
        b[i + 1] = tmp
      }
      this.R2_matrix = math.matrix(math.transpose(b))
    }
  })
  
  this.setNormalizedVariables()
  this.R2_matrix_original = math.clone(this.R2_matrix);
  }

  setNormalizedVariables() {
    let M = this.getM()
    
    for (let sign of this.sign2) {
      switch (sign) {
        case "<=":
          this.columns2.push(`S${this.s_index}`)
          this.Xb.push(`S${this.s_index}`)
          this.Cj2.push(0)
          this.s_index += 1;
          this.Cb2.push(0)
          break;
        case ">=":
          this.columns2.push(`S${this.s_index}`)
          this.columns2.push(`A${this.a_index}`)
          this.Cj2.push(0)
          this.Cj2.push(M)
          this.Cb2.push(M)
          this.Xb.push(`A${this.a_index}`)
          this.s_index += 1;
          this.a_index += 1;
          break;
        case "=":
          this.columns2.push(`A${this.a_index}`)
          this.Xb.push(`A${this.a_index}`)
          // TODO: M grande
          this.Cj2.push(M)
          this.Cb2.push(M)
          this.a_index += 1;
          break;
      }
    }
  }

  solveZ() {
    this.Zj2 = []
    this.Zj_Cj2 = []
    math.transpose(this.R2_matrix.toArray()).forEach((row: []) => {
      this.Zj2.push(math.sum(math.dotMultiply(this.Cb2, row)))
    })

    this.Zj2.forEach((el, ind) => {
      this.Zj_Cj2.push(el - this.Cj2[ind])
    })

    this.Zj2 = math.map(this.Zj2, (el) => this.magicRound(el))
    this.Zj_Cj2 = math.map(this.Zj_Cj2, (el) => this.magicRound(el))
  }

  optimalityTest() {
    //Minimization
    if (this.sense == "Min") {
      return { "state": this.Zj_Cj2.every(el => el <= 0), "index": this.Zj_Cj2.findIndex(e => e == math.max(this.Zj_Cj2)) }
    } 
    //Maximization
    return { "state": this.Zj_Cj2.every(el => el >= 0), "index": this.Zj_Cj2.findIndex(e => e == math.min(this.Zj_Cj2)) }
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
      ratioMatrix = this.calculateRatio(math.transpose(this.R2_matrix.toArray())[index], this.b2.toArray())
    }

    let row = this.outgoingRow(ratioMatrix)


    this.Xb[row] = this.columns2[col]
    this.Cb2[row] = this.Cj2[col]

    this.checkXb()

    this.B = math.transpose(this.B)
    this.B_inv = math.inv(this.B)

    this.R2_matrix = math.multiply(math.matrix(this.B_inv), this.R2_matrix_original)
    this.R2_matrix = math.map(this.R2_matrix, (el) => this.magicRound(el))

    this.b2 = math.multiply(math.matrix(this.B_inv), this.b2_original)
    this.b2 = math.map(this.b2, (el) => this.magicRound(el))

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
      this.B.push(math.transpose(this.R2_matrix_original.toArray())[this.columns2.findIndex(e => e == el)]);
    })
  }

  print() {
    console.log("\n\n");

    console.log("Cj");
    console.log(this.Cj2)
    console.log("Cb");
    console.log(this.Cb2)
    console.log("R");
    console.log(this.R2_matrix.toArray())
    console.log("b");
    console.log(this.b2.toArray())
    console.log("B");
    console.log(this.B);
    if (this.B.length > 0) {
      console.log("B_inv");
      console.log(math.inv(this.B));
    }
    console.log("columns");
    console.log(this.columns2)
    console.log("Xb");
    console.log(this.Xb)
    console.log("Zj");
    console.log(this.Zj2)
    console.log("Zj_Cj");
    console.log(this.Zj_Cj2)

    if (!this.optimalityTest().state) {
      let outgoingCol = this.optimalityTest().index
      console.log("Columna de salida")
      console.log(outgoingCol);
      console.log("Fila de salida");

      let rowMatrix = this.calculateRatio(math.transpose(this.R2_matrix.toArray())[outgoingCol], this.b2.toArray())
      console.log(this.outgoingRow(rowMatrix));
    }
  }

}
