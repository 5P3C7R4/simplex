import { ConcatVarsPipe } from './concat-vars.pipe';

describe('ConcatVarsPipe', () => {
  it('create an instance', () => {
    const pipe = new ConcatVarsPipe();
    expect(pipe).toBeTruthy();
  });
});
