import { Glue } from './Glue';
import { GluePreprocessor } from './GluePreprocessor';
import { GlueUniforms } from './GlueUniforms';

export class GlueProgram {
  readonly uniforms: GlueUniforms;

  private _vertexShader: WebGLShader;
  private _fragmentShader: WebGLShader;
  private _program: WebGLProgram;
  private _width = 0;
  private _height = 0;
  private _disposed = false;

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

    this._fragmentShader = this.attachShader(
      fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );
    this._vertexShader = this.attachShader(
      vertexShaderSource,
      gl.VERTEX_SHADER
    );

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error('Could not compile WebGL program. \n\n' + info);
    }

    this.uniforms = new GlueUniforms(gl, program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    this.glue.setRectangle(gl, -1, -1, 2, 2);

    const positionLocation = gl.getAttribLocation(this._program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  setSize(width: number, height: number) {
    this.checkDisposed();

    this._width = width;
    this._height = height;

    this.uniforms.set('iResolution', [width, height, 1]);
  }

  apply() {
    this.checkDisposed();

    this.glue.switchFramebuffer();

    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this._program);

    this.uniforms.set('iResolution', [this._width, this._height, 1]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  dispose() {
    this.gl.deleteProgram(this._program);
    this.gl.deleteShader(this._vertexShader);
    this.gl.deleteShader(this._fragmentShader);
    this._disposed = true;
  }

  private checkDisposed() {
    if (this._disposed) {
      throw new Error('This GlueProgram object has been disposed.');
    }
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
    return shader;
  }
}
