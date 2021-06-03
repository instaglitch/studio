import { makeAutoObservable } from 'mobx';
import React, { useContext } from 'react';
import { FilterSetting } from './types';
import { Glue } from './fxglue/Glue';

const defaultFragmentShader = `void main()
{
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  gl_FragColor = texture2D(iTexture, p);
}`;

const defaultVertexShader = `void main() {
  gl_Position = vec4(position, 1.0);
}`;

interface FilterSettingWithId extends FilterSetting {
  id: string;
}

class ProjectStore {
  fragmentShader = defaultFragmentShader;
  vertexShader = defaultVertexShader;
  tab = 'fragment';
  loading = false;

  image?: HTMLImageElement;
  previewCanvas = document.createElement('canvas'); //this.previewRenderer.domElement;
  settings: FilterSettingWithId[] = [];
  settingValues: Record<string, any> = {};

  constructor() {
    makeAutoObservable(this);

    this.loadImage('/preview.jpg');
  }

  loadImage(src: string) {
    const image = new Image();
    image.src = src;
    this.loading = true;

    const onload = () => {
      this.image = image;

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
    this.fragmentShader = defaultFragmentShader;
    this.vertexShader = defaultVertexShader;
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
    if (!this.image) {
      return;
    }

    this.previewCanvas.width = 800;
    this.previewCanvas.height = 800;

    const gl = this.previewCanvas.getContext('webgl', {
      premultipliedAlpha: false,
    })!;

    const glue = new Glue(gl);
    glue.setSize(this.image.naturalWidth, this.image.naturalHeight);
    glue.image(this.image);
    glue.registerProgram('filter', this.fragmentShader, this.vertexShader);
    glue.program('filter')?.apply();
    glue.render();
    glue.dispose();
  }
}

const projectStore = new ProjectStore();

const ProjectStoreContext = React.createContext(projectStore);

export const useProjectStore = () => useContext(ProjectStoreContext);
