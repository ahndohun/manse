import React from 'react';
import {Card, Pop, SceneShell, Title} from '../components';
import {colors, fonts} from '../theme';

const PLAN = [
  'Movement plan: gentle reach + catch, seated mode included',
  'Accessibility: captions, high contrast, no flashing',
  'Original assets: generated art with provenance',
  'Versioned project: contract chosen before files are written',
];

export const CodexStudio: React.FC = () => (
  <SceneShell
    index={3}
    kicker="Creating in Codex"
    caption="For creators, Codex is the studio. I describe a game in plain language. The Manse Creator plugin uses GPT-5.6 to plan movement, accessibility, original assets, and a versioned project before it writes files."
  >
    <div style={{position: 'absolute', top: 140, left: 72, width: 660}}>
      <Title size={72}>
        Codex is
        <br />
        the studio.
      </Title>
      <Pop delay={14}>
        <div
          style={{
            marginTop: 36,
            fontSize: 36,
            lineHeight: 1.45,
            color: colors.inkSoft,
          }}
        >
          Describe a game in plain language.
          <br />
          <b style={{color: colors.ink}}>Manse Creator + GPT-5.6</b> plan it
          before writing a single file.
        </div>
      </Pop>
    </div>
    <div style={{position: 'absolute', top: 140, right: 72, width: 1010}}>
      <Pop delay={6}>
        <Card
          style={{
            padding: '30px 36px',
            backgroundColor: colors.yellow,
            borderColor: colors.yellow,
            marginLeft: 120,
          }}
        >
          <div style={{fontSize: 26, fontWeight: 700, color: colors.inkSoft}}>
            CREATOR
          </div>
          <div style={{fontSize: 34, color: colors.ink, marginTop: 8, lineHeight: 1.35}}>
            “Create a gentle 5-minute ocean rescue motion game for ages 6–9,
            in English and Korean.”
          </div>
        </Card>
      </Pop>
      <Pop delay={22}>
        <Card style={{padding: '30px 36px', marginTop: 28, marginRight: 120}}>
          <div style={{fontSize: 26, fontWeight: 700, color: colors.coral}}>
            MANSE CREATOR · GPT-5.6
          </div>
          <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14}}>
            {PLAN.map((line, i) => (
              <Pop key={line} delay={30 + i * 8}>
                <div
                  style={{
                    fontSize: 30,
                    color: colors.ink,
                    fontFamily: fonts.mono,
                    display: 'flex',
                    gap: 14,
                  }}
                >
                  <span style={{color: colors.ok}}>✓</span>
                  {line}
                </div>
              </Pop>
            ))}
          </div>
        </Card>
      </Pop>
    </div>
  </SceneShell>
);
