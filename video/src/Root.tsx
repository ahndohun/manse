import React from 'react';
import {Composition, Series} from 'remotion';
import {FPS, SCENE_FRAMES, TOTAL_FRAMES} from './theme';
import {Hook} from './scenes/Hook';
import {OpenPlatform} from './scenes/OpenPlatform';
import {CodexStudio} from './scenes/CodexStudio';
import {OwnedOutput} from './scenes/OwnedOutput';
import {Catalog} from './scenes/Catalog';
import {Validation} from './scenes/Validation';
import {Publish} from './scenes/Publish';
import {ShowcaseFlow} from './scenes/ShowcaseFlow';
import {Closing} from './scenes/Closing';

const SCENES = [
  Hook,
  OpenPlatform,
  CodexStudio,
  OwnedOutput,
  Catalog,
  Validation,
  Publish,
  ShowcaseFlow,
  Closing,
];

const Main: React.FC = () => (
  <Series>
    {SCENES.map((Scene, i) => (
      <Series.Sequence key={i} durationInFrames={SCENE_FRAMES[i]}>
        <Scene />
      </Series.Sequence>
    ))}
  </Series>
);

export const Root: React.FC = () => (
  <Composition
    id="ManseDemo"
    component={Main}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
