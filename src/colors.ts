export class Color {
  constructor(rgb: [number, number, number], opacity: number = 1) {
    this.RGB = rgb;
    this.opacity = opacity;
  }
  RGB: [number, number, number];
  opacity?: number;

  public toString(): string {
    return `rgba(${this.RGB.join(',')}, ${this.opacity})`;
  }
}

export const Colors: { NotGuessed: Color; Correct: Color; Incorrect: Color } = {
  NotGuessed: new Color([120, 120, 170], 0.5),
  Correct: new Color([50, 200, 50]),
  Incorrect: new Color([255, 50, 50]),
};
