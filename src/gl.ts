export function setRectangle(
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

const shaderPrefix = 'precision mediump float;\n';

export function createShader(
  gl: WebGLRenderingContext,
  code: string,
  type: number
) {
  let processedShader = shaderPrefix;
  if (type === gl.VERTEX_SHADER) {
    processedShader += 'attribute vec3 position;\n';
  }

  // Uniforms
  processedShader += 'uniform sampler2D iTexture;\n';
  processedShader += 'uniform vec3 iResolution;\n';

  processedShader += code;

  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, processedShader);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw new Error('Could not compile WebGL program. \n\n' + info);
  }

  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  fragmentShader: string,
  vertexShader?: string
) {
  if (!vertexShader) {
    vertexShader = `void main() {
  gl_Position = vec4(position, 1.0);
}`;
  }

  const program = gl.createProgram()!;

  const vShader = createShader(gl, vertexShader, gl.VERTEX_SHADER)!;
  const fShader = createShader(gl, fragmentShader, gl.FRAGMENT_SHADER)!;

  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error('Could not compile WebGL program. \n\n' + info);
  }

  return program;
}

export function createTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

export function createTextureFromImage(
  gl: WebGLRenderingContext,
  image: HTMLImageElement
) {
  const texture = createTexture(gl);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  return texture;
}

export function renderWithProgram(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
  framebuffer: WebGLFramebuffer | null,
  inputTexture: WebGLTexture,
  fragmentShader: string,
  vertexShader?: string
) {
  gl.bindTexture(gl.TEXTURE_2D, inputTexture);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const program = createProgram(gl, fragmentShader, vertexShader);

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, -1, -1, 2, 2);

  const positionLocation = gl.getAttribLocation(program, 'position');

  gl.enableVertexAttribArray(positionLocation);

  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
  gl.uniform3f(resolutionLocation, width, height, 1);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return program;
}

export function createFramebuffer(
  gl: WebGLRenderingContext,
  width: number,
  height: number
) {
  const texture = createTexture(gl);

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
