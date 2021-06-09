import React from 'react';
import { observer } from 'mobx-react-lite';

import { uniformType, useProjectStore } from '../../ProjectStore';

export const Introduction: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <div className="editor panel flex intro">
      <h2>Welcome to Instaglitch Studio!</h2>
      <p>
        Instaglitch Studio is an online WebGL GUI designed to make creation of
        new filter shaders for{' '}
        <a
          href="https://instaglitch.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          Instaglitch
        </a>{' '}
        and{' '}
        <a
          href="https://github.com/mat-sz/fxglue"
          rel="noopener noreferrer"
          target="_blank"
        >
          fxGlue
        </a>{' '}
        easier.
      </p>
      <p>
        As you add options in the Settings tab, more uniforms will be available
        to your shader.
      </p>
      <p>Here is a list of currently available uniforms:</p>
      <dl className="uniforms">
        <dt>
          <em>sampler2D</em> iTexture
        </dt>
        <dd>
          Texture input of your filter, X and Y coordinates range from 0.0 to
          1.0.
        </dd>
        <dt>
          <em>vec3</em> iResolution
        </dt>
        <dd>
          Resolution of the screen, used to normalize <em>gl_FragCoord</em>.
        </dd>
        {projectStore.settings.map(setting => (
          <React.Fragment key={setting.id}>
            <dt>
              <em>{uniformType(setting.type)}</em> {setting.key}
            </dt>
            <dd>Setting ({setting.name || setting.key})</dd>
          </React.Fragment>
        ))}
      </dl>
      <p>
        Vertex shaders have access to an attribute:{' '}
        <strong>
          <em>vec3</em> position.
        </strong>
      </p>
      <p>
        Information about imports (<em>@use math</em> for example), can be found
        in the documentation for{' '}
        <a
          href="https://github.com/mat-sz/fxglue"
          rel="noopener noreferrer"
          target="_blank"
        >
          fxGlue
        </a>
        .
      </p>
    </div>
  );
});
