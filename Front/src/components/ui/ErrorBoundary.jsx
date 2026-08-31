import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#F5F2ED',
          fontFamily: "'DM Sans', sans-serif",
        }}
        >
          <div style={{
            maxWidth: 480,
            background: '#fff',
            border: '1px solid #DDD6CE',
            borderRadius: 14,
            padding: 24,
          }}
          >
            <h2 style={{ margin: '0 0 8px', color: '#1C1917' }}>Erreur d&apos;affichage</h2>
            <p style={{ margin: '0 0 12px', color: '#6B6560', fontSize: '0.9rem' }}>
              La page n&apos;a pas pu se charger. Rechargez ou reconnectez-vous.
            </p>
            <pre style={{
              margin: 0,
              padding: 12,
              background: '#F5F2ED',
              borderRadius: 8,
              fontSize: '0.75rem',
              overflow: 'auto',
              color: '#B91C1C',
            }}
            >
              {error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.assign('/login')}
              style={{
                marginTop: 16,
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: '#007A5E',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
