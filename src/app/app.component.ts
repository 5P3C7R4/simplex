import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Simplex';

  public Cj!: Array<number>;
  public R!: Array<Array<number>>
  public sign!: Array<string>
  public b!: Array<number>;
  public sense: string = "";

  public showBoard = false

  public addX(cj: Array<number>) {
    this.Cj = cj
  }

  public addR(r: Array<Array<number>>) {
    this.R = r
  }

  public addSign(sign: Array<string>) {
    this.sign = sign
  }

  public addB(b: Array<number>) {
    this.b = b
  }

  public addSense(sense: string) {
    this.sense = sense;
  }

  public showTable() {
    this.showBoard = true;
  }
}
