import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '60vh', padding: '2rem',
                    textAlign: 'center', gap: '1rem'
                }}>
                    <div style={{ fontSize: '4rem' }}>😕</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>
                        Xatolik yuz berdi
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        Sahifa yuklanishida xatolik. Iltimos, qayta urinib ko'ring yoki bosh sahifaga qayting.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                        >
                            🔄 Qayta yuklash
                        </button>
                        <Link to="/" className="btn btn-secondary" onClick={() => this.setState({ hasError: false, error: null })}>
                            🏠 Bosh sahifa
                        </Link>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
