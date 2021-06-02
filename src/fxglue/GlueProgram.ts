import { Glue } from './Glue';
import { GluePreprocessor } from './GluePreprocessor';
import { GlueUniforms } from './GlueUniforms';

export class GlueProgram {
  readonly uniforms: GlueUniforms;

  private _program: WebGLProgram;
  private _width = 0;
  private _height = 0;

  constructor(
    private gl: WebGLRenderingContext,
    private glue: Glue,
    fragmentShaderSource: string,
    vertexShaderSource: string,
    preprocess = true
  ) {
    if (preprocess) {
      fragmentShaderSource =
        GluePreprocessor.processShader(fragmentShaderSource);
      vertexShaderSource = GluePreprocessor.processShader(
        vertexShaderSource,
        true
      );
    }

    const program = gl.createProgram();

    if (!program) {
      throw new Error('Unable to create program.');
    }

    this._program = program;

    this.attachShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    this.attachShader(vertexShaderSource, gl.VERTEX_SHADER);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error('Could not compile WebGL program. \n\n' + info);
    }

    this.uniforms = new GlueUniforms(gl, program);
  }

  setSize(width: number, height: number) {
    this._width = width;
    this._height = height;

    this.uniforms.set('iResolution', [width, height, 1]);
  }

  apply() {
    const gl = this.gl;
    // gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this._program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    this.glue.setRectangle(gl, -1, -1, 2, 2);

    const positionLocation = gl.getAttribLocation(this._program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    this.uniforms.set('iResolution', [this._width, this._height, 1]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private attachShader(code: string, type: number) {
    const gl = this.gl;

    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error('Unable to create shader.');
    }

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      throw new Error('Could not compile WebGL program. \n\n' + info);
    }

    gl.attachShader(this._program, shader);
  }
}
