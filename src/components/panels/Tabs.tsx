import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import { projectStore } from '../../ProjectStore';

const Tab: React.FC<{ id: string; name: string }> = observer(({ id, name }) => {
  return (
    <div
      className={clsx('tab', {
        selected: projectStore.tab === id,
      })}
      onClick={() => {
        projectStore.tab = id;
        projectStore.renderCurrentProject();
      }}
    >
      {name}
    </div>
  );
});

export const Tabs: React.FC = () => {
  return (
    <div className="panel tabs">
      <Tab id="introduction" name="Introduction" />
      <Tab id="fragment" name="Fragment shader" />
      <Tab id="vertex" name="Vertex shader" />
      <Tab id="settings" name="Settings" />
    </div>
  );
};
