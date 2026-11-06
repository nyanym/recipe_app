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
                        credentials: 'include'
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

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}