import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Simplex';

  public X!: Array<number>;
  public R!: Array<Array<number>>
  public sign!: Array<string>
  public b!: Array<number>;

  public addX(x: Array<number>) {
    this.X = x
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

  public prueba() {
    console.log(this.X)
  }
}
