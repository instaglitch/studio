const shaderPrefix = 'precision mediump float;\n';

export interface GluePreprocessorResult {
  lineMap: Record<number, number>;
  source: string;
}

export class GluePreprocessor {
  static processShader(source: string, vertex = false): GluePreprocessorResult {
    let processedShader = shaderPrefix;
    if (vertex) {
      processedShader += 'attribute vec3 position;\n';
    }

    // Uniforms
    processedShader += 'uniform sampler2D iTexture;\n';
    processedShader += 'uniform vec3 iResolution;\n';

    const lines = source.split('\n');
    const lineMap: Record<number, number> = {};

    let currentInputLine = 0;
    let currentOutputLine = processedShader.split('\n').length;

    for (const line of lines) {
      processedShader += line + '\n';
      lineMap[currentOutputLine] = currentInputLine;
      currentInputLine++;
      currentOutputLine++;
    }

    return {
      lineMap,
      source: processedShader,
    };
  }
}
