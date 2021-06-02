const shaderPrefix = 'precision mediump float;\n';

export class GluePreprocessor {
  static processShader(source: string, vertex = false) {
    let processedShader = shaderPrefix;
    if (vertex) {
      processedShader += 'attribute vec3 position;\n';
    }

    // Uniforms
    processedShader += 'uniform sampler2D iTexture;\n';
    processedShader += 'uniform vec3 iResolution;\n';

    processedShader += source;

    return processedShader;
  }
}
