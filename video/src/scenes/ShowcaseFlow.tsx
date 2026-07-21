import React from 'react';
import {Card, Pop, SceneShell, Title} from '../components';
import {colors, fonts} from '../theme';

const STEPS = [
  {title: 'Manifest URL', desc: 'Creator submits one public URL — the game never uploads', mono: true},
  {title: 'CI validates', desc: 'Deterministic checks run against the live manifest'},
  {title: 'Maintainer approves', desc: 'Human review before any official listing'},
  {title: 'Catalog links out', desc: 'The card opens the creator-owned Site'},
];

export const ShowcaseFlow: React.FC = () => (
  <SceneShell
    index={8}
    kicker="A catalog, not a walled garden"
    caption="The Showcase receives only a public manifest URL. CI validates it, a maintainer approves it, and the catalog links to the creator's Site. Manse never uploads, proxies, iframes, or executes that third-party game."
    bg={colors.bgAlt}
  >
    <div style={{position: 'absolute', top: 140, left: 72, right: 72}}>
      <Title size={72}>
        The Showcase holds one thing:{' '}
        <span style={{color: colors.coral}}>a link.</span>
      </Title>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          marginTop: 64,
        }}
      >
        {STEPS.map((s, i) => (
          <React.Fragment key={s.title}>
            <Pop delay={14 + i * 12} style={{flex: 1}}>
              <Card style={{padding: '32px 30px', height: 340}}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: i === 3 ? colors.coral : colors.yellow,
                    color: colors.ink,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 800,
                    marginBottom: 20,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{fontSize: 36, fontWeight: 700, color: colors.ink}}>
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: colors.inkSoft,
                    marginTop: 12,
                    lineHeight: 1.28,
                    fontFamily: s.mono ? fonts.mono : undefined,
                  }}
                >
                  {s.desc}
                </div>
              </Card>
            </Pop>
            {i < STEPS.length - 1 ? (
              <Pop delay={20 + i * 12}>
                <div
                  style={{
                    fontSize: 52,
                    color: colors.coral,
                    padding: '0 18px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  →
                </div>
              </Pop>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <Pop delay={70}>
        <div
          style={{
            marginTop: 38,
            display: 'inline-block',
            backgroundColor: colors.ink,
            color: colors.bg,
            borderRadius: 14,
            padding: '18px 30px',
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          Never uploads · never proxies · never iframes · never executes
        </div>
      </Pop>
    </div>
  </SceneShell>
);
