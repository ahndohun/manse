import React from 'react';
import {Card, KenBurns, Pop, SceneShell, Title} from '../components';
import {colors, fonts} from '../theme';

const BUNDLED = ['runtime code', 'pose models', 'WebAssembly', 'packs', 'media'];

export const Publish: React.FC = () => (
  <SceneShell
    index={7}
    kicker="Publish an independent site"
    caption="With my approval, Codex packages the self-contained game and publishes an independent public Site. Runtime code, models, WebAssembly, packs, and media are bundled — play needs no API key or external runtime CDN."
  >
    <div style={{position: 'absolute', top: 140, left: 72, width: 620}}>
      <Title size={72}>
        Self-contained.
        <br />
        <span style={{color: colors.coral}}>Truly published.</span>
      </Title>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginTop: 40,
          maxWidth: 600,
        }}
      >
        {BUNDLED.map((b, i) => (
          <Pop key={b} delay={22 + i * 6}>
            <div
              style={{
                border: `3px solid ${colors.ink}`,
                borderRadius: 999,
                padding: '10px 26px',
                fontSize: 28,
                fontWeight: 600,
                color: colors.ink,
              }}
            >
              {b} ✓ bundled
            </div>
          </Pop>
        ))}
      </div>
      <Pop delay={60}>
        <div style={{marginTop: 32, fontSize: 31, color: colors.inkSoft}}>
          Play needs{' '}
          <b style={{color: colors.ink}}>no API key or external runtime CDN</b>.
        </div>
      </Pop>
    </div>
    <Pop delay={8}>
      <Card
        style={{
          position: 'absolute',
          top: 145,
          right: 72,
          width: 1060,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '20px 28px',
            borderBottom: `2px solid ${colors.line}`,
            backgroundColor: colors.bg,
          }}
        >
          <div style={{display: 'flex', gap: 10}}>
            {[colors.coral, colors.yellow, colors.sage].map((c) => (
              <div
                key={c}
                style={{width: 20, height: 20, borderRadius: 10, backgroundColor: c}}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: colors.bgAlt,
              borderRadius: 999,
              padding: '12px 26px',
              fontFamily: fonts.mono,
              fontSize: 27,
              color: colors.ink,
            }}
          >
            https://morning-star-catch.ran584000.chatgpt.site
          </div>
        </div>
        <KenBurns
          src="screens/morning-star-catch.png"
          objectPosition="center top"
          style={{width: '100%', height: 470}}
        />
        <div
          style={{
            padding: '18px 28px',
            fontFamily: fonts.mono,
            fontSize: 26,
            color: colors.inkSoft,
            backgroundColor: colors.bg,
            borderTop: `2px solid ${colors.line}`,
          }}
        >
          /.well-known/manse-game.json{' '}
          <span style={{color: colors.ok, fontWeight: 700}}>
            ✓ public manifest, works signed out
          </span>
        </div>
      </Card>
    </Pop>
  </SceneShell>
);
