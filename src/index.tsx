import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import { editor } from 'monaco-editor';

import { App } from './App';
import reportWebVitals from './reportWebVitals';
import theme from './theme.json';

editor.defineTheme('instaglitch', theme as any);

configure({
  enforceActions: 'never',
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
