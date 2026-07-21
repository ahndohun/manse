import React from 'react';
import {Chip, Pop, SceneShell, Title} from '../components';
import {colors, fonts} from '../theme';

const BADGES = ['MIT licensed', 'Self-hostable', 'Privacy-first', 'Open format'];

export const Closing: React.FC = () => (
  <SceneShell
    index={9}
    kicker="Built with Codex + GPT-5.6"
    caption="Codex and GPT-5.6 built the platform and power the creator workflow: GPT-5.6 is the factory; the browser is the product. Manse is MIT licensed, self-hostable, privacy-first, and ready for creators to extend."
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 36,
        textAlign: 'center',
      }}
    >
      <Title size={160}>Manse</Title>
      <Pop delay={10}>
        <div style={{fontSize: 46, color: colors.inkSoft, fontWeight: 500}}>
          GPT-5.6 is the factory. <b style={{color: colors.ink}}>The browser is the product.</b>
        </div>
      </Pop>
      <div style={{display: 'flex', gap: 22, marginTop: 8}}>
        {BADGES.map((b, i) => (
          <Chip
            key={b}
            label={b}
            delay={24 + i * 7}
            color={i % 2 ? colors.yellow : colors.bgAlt}
          />
        ))}
      </div>
      <Pop delay={56}>
        <div
          style={{
            marginTop: 16,
            fontFamily: fonts.mono,
            fontSize: 34,
            color: colors.ink,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <span>github.com/ahndohun/manse</span>
          <span style={{color: colors.coral}}>
            manse-showcase.ran584000.chatgpt.site
          </span>
        </div>
      </Pop>
    </div>
  </SceneShell>
);
