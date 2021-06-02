export class Glue {
  constructor(private gl: WebGLRenderingContext) {}

  setSize(width: number, height: number) {}

  setImage(image: HTMLImageElement) {}

  setTexture(texture: WebGLTexture) {}

  registerGlueProgram() {}

  registerProgram() {}

  applyProgram() {}
}
