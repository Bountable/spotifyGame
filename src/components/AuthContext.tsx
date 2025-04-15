import { createContext, useContext, useEffect, useState } from "react";

const clientId = "7d9e1b0faa364461b6a37982038bf48f";
const redirectUri = "http://localhost:5173";

interface AuthContextType {
    accessToken: string | null;
    login: () => void;
    logout: () => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("access_token"));

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        async function authenticate() {
            if (accessToken) return;

            if (code) {
                try {
                    const token = await getAccessToken(clientId, code);
                    localStorage.setItem("access_token", token);
                    setAccessToken(token);
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    console.error("Authentication failed:", error);
                    redirectToAuthCodeFlow();
                }
            }
        }

        authenticate();
    }, [accessToken ]); // This will run only once when the component mounts

    const login = () => {
        redirectToAuthCodeFlow();
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setAccessToken(null);
        redirectToAuthCodeFlow();
    };

    return (
        <AuthContext.Provider value={{ accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthContext;


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

async function redirectToAuthCodeFlow() {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        code_challenge_method: "S256",
        code_challenge: challenge,
        scope: [
            "streaming",
            "user-read-email",
            "user-read-private",
            "user-modify-playback-state",
            "user-read-playback-state",
            "playlist-read-private"
        ].join(" ")
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function getAccessToken(clientId: string, code: string) {
    const verifier = localStorage.getItem("verifier");
    if (!verifier) throw new Error("No verifier found, authentication process needs to restart.");

    const params = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
    });

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });

    if (!result.ok) throw new Error("Failed to fetch access token");

    const { access_token } = await result.json();
    return access_token;
}

function generateCodeVerifier(length: number) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

