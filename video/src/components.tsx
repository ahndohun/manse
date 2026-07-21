import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {colors, fonts} from './theme';

export const SceneShell: React.FC<{
  index: number;
  kicker: string;
  caption: string;
  children: React.ReactNode;
  bg?: string;
}> = ({index, kicker, caption, children, bg = colors.bg}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{backgroundColor: bg, fontFamily: fonts.display}}>
      <Audio src={staticFile(`audio/scene-${index}.wav`)} />
      <AbsoluteFill style={{opacity: fadeIn}}>
        <div
          style={{
            position: 'absolute',
            top: 44,
            left: 72,
            right: 72,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: colors.coral,
              fontWeight: 600,
            }}
          >
            {kicker}
          </div>
          <div style={{fontSize: 24, color: colors.inkFaint, fontWeight: 500}}>
            Manse · {String(index).padStart(2, '0')}/09
          </div>
        </div>
        {children}
        <Caption text={caption} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Caption: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 72,
        right: 72,
        opacity,
      }}
    >
      <div
        style={{
          borderTop: `3px solid ${colors.line}`,
          paddingTop: 20,
          fontSize: 30,
          lineHeight: 1.4,
          color: colors.inkSoft,
          maxWidth: 1500,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
}> = ({children, size = 84, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 700,
        color: colors.ink,
        lineHeight: 1.08,
        letterSpacing: -1,
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const Pop: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({children, delay = 0, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 16, mass: 0.7}});
  return (
    <div
      style={{
        opacity: Math.min(1, s * 1.4),
        transform: `scale(${0.9 + s * 0.1}) translateY(${(1 - s) * 24}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const KenBurns: React.FC<{
  src: string;
  from?: number;
  to?: number;
  style?: React.CSSProperties;
}> = ({src, from = 1, to = 1.08, style}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [from, to]);
  return (
    <div style={{overflow: 'hidden', ...style}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
};

export const Chip: React.FC<{
  label: string;
  delay?: number;
  color?: string;
}> = ({label, delay = 0, color = colors.yellow}) => (
  <Pop delay={delay}>
    <div
      style={{
        backgroundColor: color,
        color: colors.ink,
        borderRadius: 999,
        padding: '14px 34px',
        fontSize: 32,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  </Pop>
);

export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({children, style}) => (
  <div
    style={{
      backgroundColor: colors.panel,
      border: `2px solid ${colors.line}`,
      borderRadius: 24,
      boxShadow: '0 12px 40px rgba(31,23,20,0.10)',
      ...style,
    }}
  >
    {children}
  </div>
);
