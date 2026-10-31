const INK = '#1B1B3A', LIME = '#D7FF3C';
const PATHS = {
  dress: 'M72 14 L88 14 Q100 40 112 14 L128 14 L136 92 L172 238 Q100 252 28 238 L64 92 Z',
  top: 'M60 28 L88 20 Q100 44 112 20 L140 28 L184 72 L160 94 L140 74 L140 206 L60 206 L60 74 L40 94 L16 72 Z',
  mini: 'M72 14 L88 14 Q100 40 112 14 L128 14 L136 84 L160 176 Q100 188 40 176 L64 84 Z',
};
const Y = { dress: [60, 92, 238], top: [76, 130, 206], mini: [52, 84, 176] };
export default function Sketch({ kind = 'dress', fill = '#FF2E63', labels = false }) {
  const y = Y[kind] || Y.dress;
  return (
    <svg viewBox="0 0 210 258" role="img" aria-label={`${kind} sketch with measurement lines`}>
      <path d={PATHS[kind] || PATHS.dress} fill={fill} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <g stroke={INK} strokeWidth="2" strokeDasharray="5 4"><line x1="10" y1={y[0]} x2="190" y2={y[0]} /><line x1="10" y1={y[1]} x2="190" y2={y[1]} /></g>
      <g stroke={INK} strokeWidth="2"><line x1="196" y1="16" x2="196" y2={y[2]} /><line x1="190" y1="16" x2="202" y2="16" /><line x1="190" y1={y[2]} x2="202" y2={y[2]} /></g>
      {labels && <g fontFamily="Figtree" fontWeight="800" fontSize="11">
        <rect x="2" y={y[0] - 17} width="40" height="16" rx="8" fill={LIME} stroke={INK} /><text x="22" y={y[0] - 5} textAnchor="middle" fill={INK}>bust</text>
        <rect x="2" y={y[1] + 4} width="42" height="16" rx="8" fill={LIME} stroke={INK} /><text x="23" y={y[1] + 16} textAnchor="middle" fill={INK}>waist</text></g>}
    </svg>
  );
}
