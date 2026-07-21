import React from 'react';
import {Card, Pop, SceneShell, Title} from '../components';
import {colors} from '../theme';

const PILLARS = [
  {name: 'Manse Engine', desc: 'On-device pose input, rendering, adaptation'},
  {name: 'Pack Format', desc: 'Strict, versioned, data-only game contract'},
  {name: 'Creator Tools', desc: 'Codex plugin, CLI, starter, validator'},
  {name: 'Showcase', desc: 'Curated catalog linking to creator Sites'},
];

const NOS = [
  'No Manse account',
  'No controller',
  'No subscription',
  'No runtime AI service',
];

export const OpenPlatform: React.FC = () => (
  <SceneShell
    index={2}
    kicker="An open platform"
    caption="Closed motion-game platforms own the format and storefront. Manse opens the engine, declarative game format, creator tools, and catalog. Players need no Manse account, controller, subscription, or runtime AI service."
    bg={colors.bgAlt}
  >
    <div style={{position: 'absolute', top: 140, left: 72, right: 72}}>
      <Title size={76}>
        Closed platforms own the format.
        <br />
        <span style={{color: colors.coral}}>Manse opens all of it.</span>
      </Title>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 28,
          marginTop: 56,
        }}
      >
        {PILLARS.map((p, i) => (
          <Pop key={p.name} delay={12 + i * 7}>
            <Card style={{padding: '36px 32px', height: 260}}>
              <div
                style={{
                  width: 56,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: i % 2 ? colors.yellow : colors.coral,
                  marginBottom: 24,
                }}
              />
              <div style={{fontSize: 40, fontWeight: 700, color: colors.ink}}>
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: colors.inkSoft,
                  marginTop: 14,
                  lineHeight: 1.35,
                }}
              >
                {p.desc}
              </div>
            </Card>
          </Pop>
        ))}
      </div>
      <div style={{display: 'flex', gap: 24, marginTop: 48}}>
        {NOS.map((n, i) => (
          <Pop key={n} delay={44 + i * 6}>
            <div
              style={{
                border: `3px solid ${colors.ink}`,
                borderRadius: 999,
                padding: '13px 28px',
                fontSize: 28,
                fontWeight: 600,
                color: colors.ink,
              }}
            >
              {n} ✕
            </div>
          </Pop>
        ))}
      </div>
    </div>
  </SceneShell>
);
