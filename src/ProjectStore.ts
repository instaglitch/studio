import { makeAutoObservable } from 'mobx';
import { WebGLRenderer, Texture, RGBFormat } from 'three';
import { buildShaderFilter } from './filters/buildShaderFilter';
import { renderTexture } from './renderTexture';
import React, { useContext } from 'react';
import { FilterSetting } from './types';

interface FilterSettingWithId extends FilterSetting {
  id: string;
}

class ProjectStore {
  fragmentShader = `void main() {
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  gl_FragColor = texture2D(iTexture, p);
}`;
  vertexShader = `void main() {
  gl_Position = vec4(position, 1.0);
}`;
  tab = 'fragment';
  loading = false;

  previewRenderer = new WebGLRenderer({ antialias: true });
  previewCanvas = this.previewRenderer.domElement;
  width = 0;
  height = 0;
  imageTexture?: Texture;
  settings: FilterSettingWithId[] = [];
  settingValues: Record<string, any> = {};

  constructor() {
    makeAutoObservable(this);

    this.loadImage();
  }

  loadImage() {
    const image = new Image();
    image.src = '/preview.jpg';
    this.loading = true;

    const onload = () => {
      this.width = image.naturalWidth;
      this.height = image.naturalHeight;

      this.imageTexture = new Texture(image);
      this.imageTexture.format = RGBFormat;
      this.imageTexture.needsUpdate = true;

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
    this.fragmentShader = '';
    this.vertexShader = '';
    this.tab = 'fragment';
    this.settings = [];
    this.settingValues = {};
  }

  openFilePicker() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.length) {
        const file = fileInput.files[0];

        this.loading = true;
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          this.loading = false;
          //this.addProjectFromURL(reader.result as string, file.name);
        });

        reader.addEventListener('error', () => {
          this.loading = false;
        });

        reader.readAsDataURL(file);
      }
    });
    fileInput.click();
  }

  requestPreviewRender() {
    requestAnimationFrame(() => this.renderCurrentProject());
  }

  renderCurrentProject(maxSize = 800) {
    if (!this.imageTexture) {
      return;
    }

    const renderer = this.previewRenderer;

    const { width, height } = this;

    renderer.setSize(width, height);

    let texture = this.imageTexture;
    if (this.vertexShader || this.fragmentShader) {
      const filter = buildShaderFilter({
        id: 'vignette',
        name: 'Vignette',
        fragmentShader: this.fragmentShader ? this.fragmentShader : undefined,
        vertexShader: this.vertexShader ? this.vertexShader : undefined,
        settings: [],
      });
      filter.pass(renderer, texture!, width, height, true);
    } else {
      renderTexture(renderer, texture!, width, height, true);
    }
  }
}

const projectStore = new ProjectStore();

const ProjectStoreContext = React.createContext(projectStore);

export const useProjectStore = () => useContext(ProjectStoreContext);
