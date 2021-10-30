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
    case FilterSettingType.ANGLE:
      return 'float';
    case FilterSettingType.INTEGER:
    case FilterSettingType.SELECT:
      return 'int';
    case FilterSettingType.COLOR:
      return 'vec4';
  }

  return 'unknown';
}

type FilePickerMode = 'image' | 'project';

function calculatePreviewSize(width: number, height: number, maxSize: number) {
  if (maxSize) {
    let scale = 1;

    scale = Math.min(Math.min(maxSize / width, maxSize / height), 1);

    width *= scale;
    height *= scale;
  }

  return [width, height] as const;
}

class ProjectStore {
  id = uuid();
  name = 'Untitled';
  description?: string;
  fragmentShader = defaultFragmentShader;
  vertexShader = defaultVertexShader;
  fragmentShaderErrors: Record<number, string[]> = {};
  vertexShaderErrors: Record<number, string[]> = {};
  tab = 'introduction';
  loading = false;
  fileInput = document.createElement('input');
  fileInputMode: FilePickerMode = 'project';

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

        if (this.fileInputMode === 'project') {
          this.loadProjectFromFile(file);
        } else {
          this.loadImageFromFile(file);
        }

        this.fileInput.value = '';
      }
    });

    this.fileInput.style.position = 'absolute';
    this.fileInput.style.opacity = '0.001';
    this.fileInput.style.pointerEvents = 'none';
    this.fileInput.style.zIndex = '-1';
    document.body.appendChild(this.fileInput);

    this.loadImage('/preview.jpg');

    if (localStorage.getItem('instaglitch_studio_backup')) {
      try {
        this.fromJson(
          JSON.parse(localStorage.getItem('instaglitch_studio_backup')!)
        );
      } catch {}
    }
  }

  buildJson(): Filter {
    const json: Filter = {
      id: this.id,
      name: this.name,
      description: this.description,
      settings: this.settings.filter(setting => !!setting.key),
      vertexShader: this.vertexShader.replaceAll('\t', '  '),
      fragmentShader: this.fragmentShader.replaceAll('\t', '  '),
    };

    if (!json.description) {
      delete json['description'];
    }

    if (json.vertexShader === defaultVertexShader) {
      delete json['vertexShader'];
    }

    if (json.fragmentShader === defaultFragmentShader) {
      delete json['fragmentShader'];
    }

    if (json.settings?.length === 0) {
      delete json['settings'];
    }

    return json;
  }

  save() {
    download(
      JSON.stringify(this.buildJson()),
      `${this.name}.instaglitch-filter.json`
    );
  }

  loadImageFromFile(file: File) {
    this.loading = true;
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      this.loading = false;
      this.loadImage(reader.result as string);
    });

    reader.addEventListener('error', () => {
      this.loading = false;
    });

    reader.readAsDataURL(file);
  }

  loadProjectFromFile(file: File) {
    this.loading = true;
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      this.loading = false;

      const filter: Filter = JSON.parse(reader.result as string);
      this.fromJson(filter);
      this.tab = 'fragment';
    });

    reader.addEventListener('error', () => {
      this.loading = false;
    });

    reader.readAsText(file);
  }

  loadImage(src: string) {
    const image = new Image();
    image.src = src;
    this.loading = true;

    const onload = () => {
      this.image = image;

      const [width, height] = calculatePreviewSize(
        image.naturalWidth,
        image.naturalHeight,
        800
      );
      this.previewCanvas.width = width;
      this.previewCanvas.height = height;

      this.glue.deregisterTexture('image');
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

  fromJson(filter: Filter) {
    if (!filter.vertexShader && !filter.fragmentShader) {
      // TODO: Display error.
      return;
    }

    this.id = filter.id;
    this.name = filter.name;
    this.description = filter.description;
    this.fragmentShader = filter.fragmentShader || defaultFragmentShader;
    this.vertexShader = filter.vertexShader || defaultVertexShader;
    this.settings = filter.settings || [];
    this.settingValues = {};
    for (const setting of this.settings) {
      this.settingValues[setting.key] = setting.defaultValue;
    }
    this.updateShader();
    this.requestPreviewRender();
  }

  reset() {
    this.id = uuid();
    this.name = 'Untitled';
    this.description = undefined;
    this.fragmentShader = defaultFragmentShader;
    this.vertexShader = defaultVertexShader;
    this.fragmentShaderErrors = {};
    this.vertexShaderErrors = {};
    this.tab = 'fragment';
    this.settings = [];
    this.settingValues = {};
    this.updateShader();
  }

  openFilePicker(mode: FilePickerMode) {
    if (mode === 'project') {
      this.fileInput.accept = 'application/json';
    } else {
      this.fileInput.accept = 'image/*';
    }
    this.fileInputMode = mode;
    this.fileInput.click();
  }

  requestDebouncedPreviewRender() {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => this.requestPreviewRender(), 1000);
  }

  updateShader() {
    localStorage.setItem(
      'instaglitch_studio_backup',
      JSON.stringify(this.buildJson())
    );

    const glue = this.glue;
    let shaderPrefix = '';

    for (const setting of this.settings) {
      if (!setting.key) {
        continue;
      }

      shaderPrefix += `uniform ${uniformType(setting.type)} ${setting.key};\n`;
    }

    glue.deregisterProgram('current');
    try {
      this.fragmentShaderErrors = {};
      this.vertexShaderErrors = {};
      glue.registerProgram(
        'current',
        shaderPrefix + this.fragmentShader,
        shaderPrefix + this.vertexShader
      );
    } catch (e) {
      this.fragmentShaderErrors = e.fragmentShaderErrors;
      this.vertexShaderErrors = e.vertexShaderErrors;
    }
  }

  requestPreviewRender() {
    localStorage.setItem(
      'instaglitch_studio_backup',
      JSON.stringify(this.buildJson())
    );
    requestAnimationFrame(() => this.renderCurrentProject());
  }

  renderCurrentProject() {
    if (!this.image) {
      return;
    }

    const glue = this.glue;
    glue.setSize(this.previewCanvas.width, this.previewCanvas.height);
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
      glue.program('current')?.apply(uniforms);
    } catch (e) {}
    glue.render();
  }
}

const projectStore = new ProjectStore();

const ProjectStoreContext = React.createContext(projectStore);

export const useProjectStore = () => useContext(ProjectStoreContext);
