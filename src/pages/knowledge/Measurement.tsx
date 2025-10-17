import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';

const examples = [
  { q: '4500 g → ? kg', a: '4.5 kg' },
  { q: '0.03 m → ? cm', a: '3 cm' },
  { q: '120 mm → ? cm', a: '12 cm' },
  { q: '2.5 L → ? mL', a: '2500 mL' },
  { q: '75 cm → ? m', a: '0.75 m' },
];

const Measurement: React.FC = () => {
  const [showAnswers, setShowAnswers] = useState(false);
  // Animated converter state
  const [value, setValue] = useState('1000');
  const [fromUnit, setFromUnit] = useState('g');
  const [toUnit, setToUnit] = useState('kg');

  const prefixes: Record<string, number> = useMemo(() => ({
    kg: 3, // kilo = 10^3 relative to base (g, m, L)
    g: 0,
    m: 0,
    cm: -2,
    mm: -3,
    L: 0,
    mL: -3,
  }), []);

  const compute = (v: string, f: string, t: string) => {
    const num = Number(v);
    if (Number.isNaN(num)) return '';
    const power = (prefixes[f] ?? 0) - (prefixes[t] ?? 0);
    const result = num * Math.pow(10, power);
    // trim trailing zeros nicely
    return String(result % 1 === 0 ? result : Number(result.toFixed(6)));
  };

  const converted = compute(value, fromUnit, toUnit);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden p-4">
      <Header />

      <h1 className="text-2xl font-bold mb-2">Metric Measurements — Quick Tricks</h1>
      <p className="text-gray-600 mb-4">Simple tricks to convert between grams, kilograms, metres, centimetres, millimetres, litres and millilitres.</p>

      <section className="mb-6">
        <p className="mt-2">Use the rhyme: <strong>King Henry Died By Drinking Chocolate Milk</strong> </p>
        <p><strong>Kilo, Hecto, Deca, (Base), Deci, Centi, Milli.</strong></p>
        <p className="mt-2">Count steps between prefixes. Move decimal left for bigger unit, right for smaller unit.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Cheat-sheet</h2>
        <ul className="list-disc pl-5 mt-2 text-gray-700">
          <li><strong>1 kg = 1000 g</strong> — move decimal 3 places</li>
          <li><strong>1 m = 100 cm</strong> — move decimal 2 places</li>
          <li><strong>1 cm = 10 mm</strong> — move decimal 1 place</li>
          <li><strong>1 L = 1000 mL</strong> — move decimal 3 places</li>
        </ul>
        <p className="mt-2">Tip: converting to a smaller unit makes the number bigger (move decimal right). Converting to a bigger unit makes the number smaller (move decimal left).</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Interactive converter (animated)</h2>
        <div className="p-4 bg-white rounded shadow-sm max-w-xl">
          <div className="flex gap-2 items-center mb-3">
            <input
              aria-label="value"
              className="px-3 py-2 border rounded w-32"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <select className="px-3 py-2 border rounded" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="m">m</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
              <option value="L">L</option>
              <option value="mL">mL</option>
            </select>

            <span className="mx-2">→</span>

            <select className="px-3 py-2 border rounded" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="m">m</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
              <option value="L">L</option>
              <option value="mL">mL</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-500">Input</div>
              <div className="text-2xl font-bold">{value} <span className="text-lg">{fromUnit}</span></div>
            </div>

            <div className="w-px h-12 bg-gray-200" />

            <div className="flex-1 text-center">
              <div className="text-sm text-gray-500">Result</div>
              <AnimatedResult value={converted} unit={toUnit} />
            </div>
          </div>

          <div className="mt-4">
            <DecimalMover input={value} from={fromUnit} to={toUnit} prefixes={prefixes} />
          </div>

          <p className="mt-3 text-sm text-gray-600">Tip: change units to see the decimal move — converting to a smaller unit makes the number bigger.</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Quick examples</h2>
        <ol className="list-decimal pl-5 mt-2 text-gray-700">
          {examples.map((ex, i) => (
            <li key={i} className="mb-2">
              <span className="font-medium">{ex.q}</span>
              {showAnswers ? (
                <span className="ml-2 text-green-600">→ {ex.a}</span>
              ) : (
                <button
                  className="ml-2 text-sm text-blue-600 underline"
                  onClick={() => setShowAnswers(true)}
                >
                  Show answers
                </button>
              )}
            </li>
          ))}
        </ol>
        {!showAnswers && (
          <button
            className="mt-3 px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => setShowAnswers(true)}
          >
            Reveal all answers
          </button>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Practice (30s each)</h2>
        <ol className="list-decimal pl-5 mt-2 text-gray-700">
          <li>Convert 3200 g to kg. <span className="text-gray-600">(Answer: 3.2 kg)</span></li>
          <li>Convert 0.45 m to cm. <span className="text-gray-600">(Answer: 45 cm)</span></li>
          <li>Convert 87 mm to cm. <span className="text-gray-600">(Answer: 8.7 cm)</span></li>
          <li>Convert 1.2 L to mL. <span className="text-gray-600">(Answer: 1200 mL)</span></li>
          <li>Convert 250 cm to m. <span className="text-gray-600">(Answer: 2.5 m)</span></li>
        </ol>
      </section>

    </div>
  );
};

export default Measurement;

// AnimatedResult: simple animated number that fades/translate when changed
function AnimatedResult({ value, unit }: { value: string; unit: string }) {
  const [display, setDisplay] = React.useState(value);
  const [animKey, setAnimKey] = React.useState(0);

  React.useEffect(() => {
    // trigger small animation by changing key
    setAnimKey((k) => k + 1);
    const t = setTimeout(() => setDisplay(value), 120);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="relative h-10 flex items-center justify-center">
      <div
        key={animKey}
        className="transform transition-all duration-300"
        style={{ opacity: display === value ? 1 : 0.6, transform: `translateY(${display === value ? 0 : -6}px)` }}
      >
        <span className="text-2xl font-bold">{display}</span>
        <span className="ml-2 text-lg">{unit}</span>
      </div>
    </div>
  );
}

// DecimalMover: visualizes decimal point movement across digit boxes
function DecimalMover({
  input,
  from,
  to,
  prefixes,
}: {
  input: string;
  from: string;
  to: string;
  prefixes: Record<string, number>;
}) {
  const [digits, decimalIndex] = React.useMemo(() => {
    const cleaned = String(input).trim();
    const parts = cleaned.split('.');
    const intPart = parts[0] || '0';
    const fracPart = parts[1] || '';
    const arr = (intPart + fracPart).split('');
    const decIdx = intPart.length; // position where decimal sits (index before which digits are integer)
    return [arr, decIdx];
  }, [input]);

  const steps = (prefixes[from] ?? 0) - (prefixes[to] ?? 0);

  // target decimal index after moving steps (positive steps => move left, negative => right)
  const targetIndex = decimalIndex - steps;

  // clamp
  const maxIndex = Math.max(digits.length, targetIndex + 1);

  // prepare boxes for visual
  const boxes = [];
  for (let i = 0; i < maxIndex; i++) {
    const ch = digits[i] ?? '0';
    boxes.push(ch);
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-500">Decimal mover</div>
        <div className="ml-auto text-xs text-gray-500">steps: {Math.abs(steps)}</div>
      </div>

      <div className="mt-2 flex items-center gap-1 overflow-x-auto">
        {boxes.map((ch, i) => (
          <div key={i} className="relative">
            <div className="w-10 h-12 flex items-center justify-center border rounded bg-gray-50">
              <span className="text-lg font-mono">{ch}</span>
            </div>
            {/* decimal marker */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-xs text-gray-600 mt-1">
              {i === targetIndex ? <span className="font-bold">.</span> : <span className="opacity-0">.</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-sm text-gray-600">From <strong>{from}</strong> to <strong>{to}</strong> — moved {steps > 0 ? `${steps} place(s) left` : `${-steps} place(s) right`}.</div>
    </div>
  );
}
