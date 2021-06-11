import { makeAutoObservable } from 'mobx';
import React, { useContext } from 'react';
import { Glue } from 'fxglue';
import { v4 as uuid } from 'uuid';
import { download } from 'fitool';

import { Filter, FilterSetting, FilterSettingType } from './types';
import { GlueUniformValue } from 'fxglue/lib/GlueUniforms';
import {
  defaultFragmentShader,
  defaultVertexShader,
} from 'fxglue/lib/GlueShaderSources';

let timeout: any = undefined;

export function uniformType(type: FilterSettingType) {
  switch (type) {
    case FilterSettingType.BOOLEAN:
      return 'bool';
    case FilterSettingType.OFFSET:
      return 'vec2';
    case FilterSettingType.FLOAT:
      return 'float';
    case FilterSettingType.INTEGER:
    case FilterSettingType.SELECT:
      return 'int';
    case FilterSettingType.COLOR:
      return 'vec4';
  }

  return 'unknown';
}

class ProjectStore {
  name = 'Untitled';
  description?: string;
  fragmentShader = defaultFragmentShader;
  vertexShader = defaultVertexShader;
  fragmentShaderErrors: Record<number, string[]> = {};
  vertexShaderErrors: Record<number, string[]> = {};
  tab = 'introduction';
  loading = false;
  fileInput = document.createElement('input');
  fileInputMode: 'project' | 'image' = 'project';

  image?: HTMLImageElement;
  previewCanvas = document.createElement('canvas');
  glue = new Glue(
    this.previewCanvas.getContext('webgl', {
      premultipliedAlpha: false,
    })!
  );
  settings: FilterSetting[] = [];
  settingValues: Record<string, any> = {};
  settingsLineOffset = 0;

  constructor() {
    makeAutoObservable(this);

    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files?.length) {
        const file = this.fileInput.files[0];

        this.loading = true;
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          this.loading = false;

          if (this.fileInputMode === 'project') {
            const filter: Filter = JSON.parse(reader.result as string);
            if (!filter.vertexShader || !filter.fragmentShader) {
              // TODO: Display error.
              return;
            }

            this.name = filter.name;
            this.description = filter.description;
            this.fragmentShader = filter.fragmentShader;
            this.vertexShader = filter.vertexShader;
            this.settings = filter.settings || [];
            this.tab = 'fragment';
            this.requestPreviewRender();
          }
        });

        reader.addEventListener('error', () => {
          this.loading = false;
        });

        reader.readAsText(file);

        this.fileInput.value = '';
      }
    });

    this.fileInput.style.position = 'absolute';
    this.fileInput.style.opacity = '0.001';
    this.fileInput.style.pointerEvents = 'none';
    this.fileInput.style.zIndex = '-1';
    document.body.appendChild(this.fileInput);

    this.loadImage('/preview.jpg');
  }

  buildJson(): Filter {
    return {
      id: uuid(),
      name: this.name,
      description: this.description,
      settings: this.settings,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    };
  }

  open() {
    this.fileInput.accept = '.instaglitch-filter.json';
    this.fileInputMode = 'project';
    this.fileInput.click();
  }

  save() {
    download(
      JSON.stringify(this.buildJson()),
      `${this.name}.instaglitch-filter.json`
    );
  }

  loadImage(src: string) {
    const image = new Image();
    image.src = src;
    this.loading = true;

    const onload = () => {
      this.image = image;
      this.glue.registerTexture('image', image);

      this.loading = false;
      this.requestPreviewRender();
    };

    if (image.complete && image.naturalHeight !== 0) {
      onload();
    } else {
      image.onload = onload;
    }
  }

  reset() {
    this.name = 'Untitled';
    this.description = undefined;
    this.fragmentShader = defaultFragmentShader;
    this.vertexShader = defaultVertexShader;
    this.fragmentShaderErrors = {};
    this.vertexShaderErrors = {};
    this.tab = 'fragment';
    this.settings = [];
    this.settingValues = {};
  }

  openFilePicker() {
    this.fileInputMode = 'project';
    this.fileInput.click();
  }

  requestDebouncedPreviewRender() {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => this.requestPreviewRender(), 1000);
  }

  requestPreviewRender() {
    requestAnimationFrame(() => this.renderCurrentProject());
  }

  renderCurrentProject() {
    if (!this.image) {
      return;
    }

    this.previewCanvas.width = 800;
    this.previewCanvas.height = 800;

    const glue = this.glue;
    glue.setSize(this.image.naturalWidth, this.image.naturalHeight);
    glue.texture('image')?.draw();

    let shaderPrefix = '';

    for (const setting of this.settings) {
      if (!setting.key) {
        continue;
      }

      shaderPrefix += `uniform ${uniformType(setting.type)} ${setting.key};\n`;
    }

    this.settingsLineOffset = shaderPrefix.split('\n').length - 1;

    const uniforms: Record<string, GlueUniformValue> = {};
    for (const setting of this.settings) {
      if (!setting.key) {
        continue;
      }

      uniforms[setting.key] =
        this.settingValues[setting.key] ?? setting.defaultValue;
    }

    try {
      this.fragmentShaderErrors = {};
      this.vertexShaderErrors = {};
      glue.apply(
        shaderPrefix + this.fragmentShader,
        shaderPrefix + this.vertexShader,
        uniforms
      );
    } catch (e) {
      this.fragmentShaderErrors = e.fragmentShaderErrors;
      this.vertexShaderErrors = e.vertexShaderErrors;
    }
    glue.render();
  }
}

const projectStore = new ProjectStore();

const ProjectStoreContext = React.createContext(projectStore);

export const useProjectStore = () => useContext(ProjectStoreContext);
