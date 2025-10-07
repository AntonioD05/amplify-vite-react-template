import { useState } from 'react';
import { SelectField, TextField, Button, View, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from 'aws-amplify/auth';

const PARTNER_TO_TICKER: Record<string, string> = {
  Amazon: 'AMZN',
  Apple: 'AAPL',
  Microsoft: 'MSFT',
  Google: 'GOOGL',
  NVIDIA: 'NVDA',
  Netflix: 'NFLX'
};

const PERIODS = ['Annual', 'Q1', 'Q2', 'Q3'] as const;

//  dynamic year list: current year down to 7 years back
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i);

function periodToQuarter(p: string) {
  return p === 'Q1' ? 1 : p === 'Q2' ? 2 : p === 'Q3' ? 3 : null;
}

export default function TenQForm() {
  const [partner, setPartner] = useState('Amazon');
  const [year, setYear] = useState(String(YEARS[0]));
  const [period, setPeriod] = useState<typeof PERIODS[number]>('Annual');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resp, setResp] = useState<any>(null);

  const apiBase = import.meta.env.VITE_API_URL as string | undefined;

  
  // FRONTEND GUARD 
  // =======================
  const now = new Date();
  const cy = now.getFullYear();
  const curQ = Math.floor(now.getMonth() / 3) + 1; // 1..4 (Q1..Q4)
  const periodToQ = { Annual: 0, Q1: 1, Q2: 2, Q3: 3 } as const;

  function isFutureSelection(y: number, p: typeof PERIODS[number]) {
    if (p === 'Annual') return y >= cy;               // only allow <= (current year - 1)
    const q = periodToQ[p];
    if (y > cy) return true;                          // any quarter in a future year
    if (y === cy && q > curQ) return true;            // quarter after the current quarter
    return false;
  }

  const future = isFutureSelection(Number(year), period);
  // =======================

  async function handleSubmit() {
    setError('');
    setResp(null);

    const ticker = PARTNER_TO_TICKER[partner];
    const quarter = periodToQuarter(period);

    if (!ticker) return setError('Unknown partner → ticker mapping.');
    if (!question.trim()) return setError('Please enter a question.');
    if (!apiBase) return setError('Missing VITE_API_URL (check your .env).');

    setLoading(true);
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      if (!idToken) throw new Error('You must be signed in.');

      const payload: Record<string, any> = { question, ticker, year };
      if (quarter) payload.quarter = quarter;

      const res = await fetch(`${apiBase}/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: idToken,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      setResp(await res.json());
    } catch (e: any) {
      setError(e.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View padding="1.5rem" maxWidth="720px" margin="0 auto">
      <Heading level={3} marginBottom="1rem">10-Q Inference</Heading>

      <SelectField label="Partner" value={partner} onChange={e => setPartner(e.target.value)} marginBottom="0.75rem">
        {Object.keys(PARTNER_TO_TICKER).map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </SelectField>

      <SelectField label="Year" value={year} onChange={e => setYear(e.target.value)} marginBottom="0.75rem">
        {YEARS.map(y => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </SelectField>

      <SelectField label="Period" value={period} onChange={e => setPeriod(e.target.value as any)} marginBottom="0.75rem">
        {PERIODS.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </SelectField>

      <TextField
        label="Question"
        placeholder="Ask about the company’s filing…"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        marginBottom="1rem"
        descriptiveText='Example: "How much did Amazon invest in Anthropic in Q3 2023"'
      />

      {/* Disable Query if selection is in the future */}
      <Button
        variation="primary"
        isLoading={loading}
        onClick={handleSubmit}
        isDisabled={future}
      >
        Query
      </Button>

      {/* Gentle hint when the selection is future-dated */}
      {future && (
        <div
          style={{
            marginTop: 8,
            color: '#7c2d12',
            background: '#ffedd5',
            padding: '8px 10px',
            borderRadius: 8,
          }}
        >
          That period hasn’t completed yet. Select a previous period.
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 14px',
            borderRadius: 10,
            marginTop: 16,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Answer card */}
      {resp?.answer && (
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            maxHeight: '60vh',
            overflow: 'auto',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Answer
          </div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, fontSize: 16 }}>
            {resp.answer}
          </div>
        </div>
      )}
    </View>
  );
}
