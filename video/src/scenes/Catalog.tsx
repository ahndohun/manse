import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {Card, Pop, SceneShell, Title} from '../components';
import {colors} from '../theme';

export const Catalog: React.FC = () => (
  <SceneShell
    index={5}
    kicker="Six live games · simulator first"
    caption="The simulator is the fastest judge path and uses the same engine session as camera play. The public catalog includes touch, dodge, freeze, squat, and jump games. Camera permission starts only after an explicit action — Manse never transmits camera frames or pose data."
  >
    <div
      style={{
        position: 'absolute',
        top: 130,
        left: 72,
        right: 72,
        display: 'flex',
        gap: 40,
      }}
    >
      <div style={{width: 520, paddingTop: 20}}>
        <Title size={68}>
          One engine.
          <br />
          Six public games.
        </Title>
        <Pop delay={16}>
          <div
            style={{
              marginTop: 32,
              fontSize: 32,
              lineHeight: 1.45,
              color: colors.inkSoft,
            }}
          >
            The <b style={{color: colors.ink}}>simulator</b> is the fastest
            judge path — the same engine session as camera play.
          </div>
        </Pop>
        <Pop delay={34}>
          <div
            style={{
              marginTop: 30,
              display: 'inline-block',
              backgroundColor: colors.ink,
              color: colors.bg,
              borderRadius: 14,
              padding: '16px 26px',
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            Camera frames never leave the device
          </div>
        </Pop>
        <Pop delay={42}>
          <div
            style={{
              marginTop: 18,
              color: colors.inkSoft,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 0.35,
            }}
          >
            LIVE · SIX INDEPENDENT SITES
          </div>
        </Pop>
      </div>
      <Pop delay={8} style={{flex: 1}}>
        <Card
          style={{
            position: 'relative',
            height: 648,
            overflow: 'hidden',
            padding: 0,
            backgroundColor: colors.bg,
          }}
        >
          <OffthreadVideo
            src={staticFile('clips/showcase.webm')}
            muted
            playbackRate={0.45}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </Card>
      </Pop>
    </div>
  </SceneShell>
);
