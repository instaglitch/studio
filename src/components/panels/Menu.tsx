import React from 'react';
import { observer } from 'mobx-react-lite';

import { projectStore } from '../../ProjectStore';
import { Logo } from '../common/Logo';

export const Menu: React.FC = observer(() => {
  return (
    <ul className="panel menu">
      <Logo />
      <li>
        <button onClick={() => projectStore.reset()}>New</button>
      </li>
      <li>
        <button onClick={() => projectStore.openFilePicker('project')}>
          Open
        </button>
      </li>
      <li>
        <button onClick={() => projectStore.save()}>Save</button>
      </li>
      <li>
        <button onClick={() => projectStore.renderCurrentProject()}>Run</button>
      </li>
    </ul>
  );
});
