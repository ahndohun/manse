import React from 'react';
import {Card, Chip, Pop, SceneShell, Title} from '../components';
import {colors, fonts} from '../theme';

const TREE = [
  {text: 'my-game-site/', dim: false},
  {text: '  .well-known/manse-game.json', dim: false, tag: 'public manifest'},
  {text: '  packs/ocean-rescue/manse.pack.json', dim: false, tag: 'data-only'},
  {text: '  packs/ocean-rescue/assets/…', dim: true, tag: 'provenance + license'},
  {text: '  engine/ (pinned runtime bundle)', dim: true},
];

const SKILLS = [
  'Create',
  'Assets',
  'Preview',
  'Validate',
  'Remix',
  'Publish',
  'Submit',
];

export const OwnedOutput: React.FC = () => (
  <SceneShell
    index={4}
    kicker="Creator-owned output"
    caption="The output is not opaque code from a central service. It is a creator-owned Site, a strict data-only pack, and auditable provenance. Seven workflows cover creation, assets, preview, validation, remixing, publishing, and Showcase submission."
    bg={colors.bgAlt}
  >
    <div style={{position: 'absolute', top: 140, left: 72, width: 720}}>
      <Title size={72}>
        Not opaque output.
        <br />
        <span style={{color: colors.coral}}>A project you own.</span>
      </Title>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 18,
          marginTop: 44,
          maxWidth: 700,
        }}
      >
        {SKILLS.map((s, i) => (
          <Chip
            key={s}
            label={s}
            delay={30 + i * 6}
            color={i % 2 ? colors.yellow : colors.panel}
          />
        ))}
      </div>
      <Pop delay={80}>
        <div style={{marginTop: 28, fontSize: 30, color: colors.inkSoft}}>
          Seven plugin workflows, idea → published game
        </div>
      </Pop>
    </div>
    <Pop delay={10}>
      <Card
        style={{
          position: 'absolute',
          top: 150,
          right: 72,
          width: 980,
          padding: '40px 48px',
          backgroundColor: colors.terminalBg,
          borderColor: colors.terminalBg,
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: colors.sage,
            fontFamily: fonts.mono,
            marginBottom: 24,
          }}
        >
          generated project — every file readable, versioned, auditable
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
          {TREE.map((line, i) => (
            <Pop key={line.text} delay={16 + i * 8}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 32,
                    color: line.dim ? colors.sage : colors.terminalText,
                    whiteSpace: 'pre',
                  }}
                >
                  {line.text}
                </span>
                {line.tag ? (
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: colors.ink,
                      backgroundColor: line.dim ? colors.sage : colors.yellow,
                      borderRadius: 999,
                      padding: '6px 18px',
                    }}
                  >
                    {line.tag}
                  </span>
                ) : null}
              </div>
            </Pop>
          ))}
        </div>
      </Card>
    </Pop>
  </SceneShell>
);
