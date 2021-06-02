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
  private _renderTextures: WebGLTexture[] = [];
  private _renderFramebuffers: WebGLFramebuffer[] = [];
  private _currentFramebuffer = -1;
  private _final = false;

  constructor(private gl: WebGLRenderingContext) {
    this.registerGlueProgram('_default');

    this.addFramebuffer();
    this.addFramebuffer();
  }

  private addFramebuffer() {
    const [texture, framebuffer] = this.createFramebuffer(1, 1);
    this._renderTextures.push(texture);
    this._renderFramebuffers.push(framebuffer);
  }

  setScale(scale: number) {
    this.setSize(this._width * scale, this._height * scale);
  }

  setSize(width: number, height: number) {
    for (const program of Object.values(this._programs)) {
      program.setSize(width, height);
    }

    const gl = this.gl;
    for (const texture of this._renderTextures) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
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
    }

    if (this._imageTexture) {
      gl.bindTexture(gl.TEXTURE_2D, this._imageTexture);
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
    if (this._programs[name]) {
      throw new Error('A program with this name already exists: ' + name);
    }

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

  finalize() {
    this._final = true;
    this.program('_default')?.apply();
  }

  switchFramebuffer() {
    const gl = this.gl;

    if (this._currentFramebuffer === -1) {
      this._currentFramebuffer = 0;
    } else {
      gl.bindTexture(
        gl.TEXTURE_2D,
        this._renderTextures[this._currentFramebuffer]
      );
      this._currentFramebuffer = this._currentFramebuffer === 0 ? 1 : 0;
    }

    gl.bindFramebuffer(
      gl.FRAMEBUFFER,
      this._final ? null : this._renderFramebuffers[this._currentFramebuffer]
    );
    this._final = false;
  }

  resetFramebuffer() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

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

    if (!framebuffer) {
      throw new Error('Unable to create a framebuffer.');
    }

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
