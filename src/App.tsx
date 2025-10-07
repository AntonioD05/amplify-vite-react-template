import TenQForm from './features/TenQForm';
import { useAuthenticator, Button } from '@aws-amplify/ui-react';

export default function App() {
  const { user, signOut } = useAuthenticator();

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgb(109,40,217) 0%, rgb(196,181,253) 100%)',
        padding: '24px 16px 80px',   
        overflowY: 'auto',           
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div style={{ color: 'white', fontWeight: 600 }}>
            Signed in as {user?.signInDetails?.loginId}
          </div>
          <Button onClick={signOut}>Sign out</Button>
        </header>

        <TenQForm />
      </div>
    </div>
  );
}
