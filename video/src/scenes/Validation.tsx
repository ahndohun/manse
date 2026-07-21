import React from 'react';
import {Card, Pop, SceneShell, Title} from '../components';
import {colors, fonts} from '../theme';

const CHECKS = [
  {label: 'schema + pack contract', ok: true},
  {label: 'relative paths stay inside the pack root', ok: true},
  {label: 'accessibility: captions, contrast, no flashing', ok: true},
  {label: 'asset licenses + provenance recorded', ok: true},
  {label: 'tests · typecheck · production build', ok: true},
  {label: 'invalid fixture rejected as expected', ok: true},
];

export const Validation: React.FC = () => (
  <SceneShell
    index={6}
    kicker="One contract, deterministic checks"
    caption="One contract drives the schema, validator, runtime loader, starter, publisher, and catalog. Validation checks paths, accessibility, licenses, provenance, tests, types, and the production build — and intentionally invalid packs must fail."
    bg={colors.bgAlt}
  >
    <div style={{position: 'absolute', top: 140, left: 72, width: 660}}>
      <Title size={72}>
        One contract.
        <br />
        <span style={{color: colors.coral}}>Zero hand-waving.</span>
      </Title>
      <Pop delay={16}>
        <div
          style={{
            marginTop: 36,
            fontSize: 33,
            lineHeight: 1.5,
            color: colors.inkSoft,
          }}
        >
          The same versioned contract drives the{' '}
          <b style={{color: colors.ink}}>
            schema, validator, runtime loader, starter, publisher, and catalog
          </b>
          .
        </div>
      </Pop>
    </div>
    <Pop delay={8}>
      <Card
        style={{
          position: 'absolute',
          top: 150,
          right: 72,
          width: 1030,
          padding: '38px 46px',
          backgroundColor: colors.terminalBg,
          borderColor: colors.terminalBg,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 34,
            color: colors.yellow,
            marginBottom: 26,
          }}
        >
          $ npm run validate
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
          {CHECKS.map((c, i) => (
            <Pop key={c.label} delay={18 + i * 11}>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 30,
                  color: colors.terminalText,
                  display: 'flex',
                  gap: 18,
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    color: c.ok ? '#7BC98A' : '#FF8A76',
                    fontWeight: 700,
                  }}
                >
                  {c.ok ? 'PASS' : 'FAIL'}
                </span>
                <span>{c.label}</span>
              </div>
            </Pop>
          ))}
        </div>
      </Card>
    </Pop>
  </SceneShell>
);
