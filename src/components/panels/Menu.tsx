import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { Logo } from '../common/Logo';

export const Menu: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <ul className="panel menu">
      <Logo />
      <li>
        <button onClick={() => projectStore.open()}>Open</button>
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
