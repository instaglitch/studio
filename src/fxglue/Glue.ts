import { GlueProgram } from './GlueProgram';

const defaultFragmentShader = `void main()
{
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  gl_FragColor = texture2D(iTexture, p);
}`;

const defaultVertexShader = `void main() {
  gl_Position = vec4(position, 1.0);
}`;

export class Glue {
  private _programs: Record<string, GlueProgram> = {};
  private _imageTexture?: WebGLTexture;
  private _width = 0;
  private _height = 0;

  constructor(private gl: WebGLRenderingContext) {}

  setSize(width: number, height: number) {
    for (const program of Object.values(this._programs)) {
      program.setSize(width, height);
    }

    this._width = width;
    this._height = height;
  }

  setImage(image: HTMLImageElement) {
    if (!image.complete || image.naturalHeight === 0) {
      throw new Error('Image is not loaded.');
    }

    const gl = this.gl;
    const texture = this.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    this._imageTexture = texture;

    this.setSize(image.naturalWidth, image.naturalHeight);
  }

  registerGlueProgram(
    name: string,
    fragmentShader?: string,
    vertexShader?: string
  ) {
    if (!fragmentShader) {
      fragmentShader = defaultFragmentShader;
    }

    if (!vertexShader) {
      vertexShader = defaultVertexShader;
    }

    const program = new GlueProgram(
      this.gl,
      this,
      fragmentShader,
      vertexShader,
      true
    );

    program.setSize(this._width, this._height);

    this._programs[name] = program;

    return program;
  }

  program(name: string): GlueProgram | undefined {
    return this._programs[name];
  }

  finalize() {}

  setRectangle(
    gl: WebGLRenderingContext,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
      gl.STATIC_DRAW
    );
  }

  private createTexture() {
    const gl = this.gl;
    const texture = gl.createTexture();

    if (!texture) {
      throw new Error('Unable to create texture.');
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
  }

  private createFramebuffer(width: number, height: number) {
    const gl = this.gl;
    const texture = this.createTexture();

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );

    return [texture, framebuffer] as const;
  }
}
