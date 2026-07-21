import React from 'react';
import {interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {Card, Pop, SceneShell, Title} from '../components';
import {colors} from '../theme';

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 20], [60, 0], {
    extrapolateRight: 'clamp',
  });
  return (
    <SceneShell
      index={1}
      kicker="Flagship active-game mission"
      caption="This is Manse: an open-source engine and publishing ecosystem for camera-based active games. A normal link turns a phone, computer, tablet, or compatible display into the play surface."
    >
      <div
        style={{
          position: 'absolute',
          top: 130,
          left: 72,
          width: 640,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        <Title size={150}>Manse</Title>
        <Title size={46} delay={8}>
          <span style={{color: colors.inkSoft, fontWeight: 500}}>
            Aim the hose. Hold pressure.
            <br />
            Save Firehouse 07.
          </span>
        </Title>
        <Pop delay={20}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: colors.ink,
              color: colors.bg,
              borderRadius: 14,
              padding: '18px 28px',
              fontSize: 34,
              fontWeight: 600,
              alignSelf: 'flex-start',
            }}
          >
            3 alarms · 12 fires · one living-room mission
          </div>
        </Pop>
        <Pop delay={28}>
          <div
            style={{
              alignSelf: 'flex-start',
              border: `2px solid ${colors.line}`,
              borderRadius: 999,
              padding: '9px 16px',
              color: colors.inkSoft,
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
          >
            LIVE · PUBLIC · REAL GAMEPLAY
          </div>
        </Pop>
      </div>
      <Card
        style={{
          position: 'absolute',
          top: 130,
          right: 72,
          width: 1050,
          height: 660,
          overflow: 'hidden',
          transform: `translateX(${slide}px)`,
          padding: 0,
        }}
      >
        <OffthreadVideo
          src={staticFile('clips/fire-hose-hero.webm')}
          startFrom={210}
          muted
          playbackRate={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 22,
          }}
        />
      </Card>
    </SceneShell>
  );
};
