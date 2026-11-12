import {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(
                    'http://localhost:5000/api/auth/me',
                    {
                        credentials: 'include',
                        cache: 'no-store'
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }

            } catch (error) {
                console.error('Authentication check failed:', error);
                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const logout = async () => {
        const response = await fetch(
        'http://localhost:5000/api/auth/logout',
        {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store'
        }
        );

        if (!response.ok) {
        throw new Error('Logout failed');
        }

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            loading,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}