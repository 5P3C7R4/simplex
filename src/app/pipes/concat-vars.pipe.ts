import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'concatVars'
})
export class ConcatVarsPipe implements PipeTransform {

  transform(vars: string[]): unknown {
    let transformed = ""
    for (let i = 0; i < vars.length; i++) {
      let signCheck = vars[i] == "<=" || vars[i] == ">=" || vars[i] == "="
      let signForwardCheck = vars[i + 1] == "<=" || vars[i + 1] == ">=" || vars[i + 1] == "="
      if (vars[i] == "") {
        transformed += "\t";
        continue;
      }
      if (signCheck) {
        transformed += vars[i] + " "
        continue;
      }
      if (vars[i].includes("-")) {
        transformed = transformed.substring(0, transformed.lastIndexOf("+")) + "" + transformed.substring(transformed.lastIndexOf("+") + 1)
        if (i == vars.length - 1 || signForwardCheck)
          transformed += `- ${vars[i].replace("-", "")}`
        else
          transformed += `- ${vars[i].replace("-", "")} + `
      } else if (vars[i + 1] == "" || signCheck || i >= vars.length) {
        transformed += `${vars[i]}`
      } else {
        if (i == vars.length - 1 || signForwardCheck)
          transformed += `${vars[i]} `
        else
          transformed += `${vars[i]} + `
      }
    }
    return transformed;
  }

}
