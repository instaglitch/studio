const imports: Record<string, string> = {
  math: `#define PI 3.1415926538
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6

float pow2(const in float x) { return x*x; }
float pow3(const in float x) { return x*x*x; }
float pow4(const in float x) { float x2 = x*x; return x2*x2; }

float atan2(const in float a, const in float b) { return asin(a) > 0.0 ? acos(b) : -acos(b); }`,
};

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
    let included: string[] = [];

    for (const line of lines) {
      let trimmed = line.trim();
      if (trimmed.startsWith('@use ')) {
        trimmed = trimmed.replace('@use ', '');
        if (imports[trimmed] && !included.includes(trimmed)) {
          processedShader += imports[trimmed] + '\n';
          currentOutputLine = processedShader.split('\n').length;
          included.push(trimmed);
        }

        currentInputLine++;
        continue;
      }

      processedShader += line + '\n';
      lineMap[currentOutputLine] = currentInputLine;
      currentInputLine++;
      currentOutputLine++;
    }

    console.log(processedShader);

    return {
      lineMap,
      source: processedShader,
    };
  }
}
