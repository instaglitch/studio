export function glueCreateShader(
  gl: WebGLRenderingContext,
  code: string,
  type: number
) {
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

  return shader;
}
