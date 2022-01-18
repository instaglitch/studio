import React from 'react';

import './glsl';
import './App.scss';
import 'rc-slider/assets/index.css';

import { Tabs } from './components/panels/Tabs';
import { Menu } from './components/panels/Menu';

import { Preview } from './components/preview/Preview';

import { Loading } from './components/overlays/Loading';
import { Editor } from './components/panels/Editor';
import { Drop } from './components/overlays/Drop';
import { PreviewSettings } from './components/preview/PreviewSettings';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

const webglAvailable = isWebGLAvailable();

export const App: React.FC = () => {
  if (!webglAvailable) {
    return (
      <div className="ui v-stack">
        <ul className="panel menu">
          <li className="logo">Instaglitch</li>
        </ul>
        <div className="webgl-error">
          Instaglitch requires WebGL to work.{' '}
          <a
            href="https://get.webgl.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Please click this link for more info.
          </a>
        </div>
      </div>
    );
  }
  return (
    <>
      <Loading />
      <Drop />
      <div className="ui v-stack">
        <Menu />
        <div className="workspace">
          <div className="h-stack">
            <div className="v-stack flex">
              <Tabs />
              <Editor />
            </div>
            <PreviewSettings />
          </div>
          <div className="canvas-area flex">
            <Preview />
          </div>
        </div>
      </div>
    </>
  );
};
