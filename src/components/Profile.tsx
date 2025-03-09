import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const clientId = "7d9e1b0faa364461b6a37982038bf48f";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const storedAccessToken = localStorage.getItem("access_token");

        async function fetchData() {
            if (storedAccessToken) {
                try {
                    const profileData = await fetchProfile(storedAccessToken);
                    setProfile(profileData);
                    setLoading(false);
                } catch (error) {
                    console.error("Access token might be expired. Re-authenticating...");
                    localStorage.removeItem("access_token"); // Remove old token and re-auth
                    redirectToAuthCodeFlow(clientId);
                }
                return;
            }

            if (code) {
                try {
                    const accessToken = await getAccessToken(clientId, code);
                    localStorage.setItem("access_token", accessToken);
                    window.history.replaceState({}, document.title, window.location.pathname); // Remove code from URL
                    const profileData = await fetchProfile(accessToken);
                    setProfile(profileData);
                } catch (error) {
                    console.error("Error getting access token:", error);
                    redirectToAuthCodeFlow(clientId);
                }
            } else {
                redirectToAuthCodeFlow(clientId);
            }
            setLoading(false);
        }

        fetchData();
    }, []);

    return (
        
            <Card sx={{ display: 'flex' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" variant="h5">
                  {profile.display_name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{ color: 'text.secondary' }}
                  >
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                  
                </Box>
              </Box>
              <CardMedia
                component="img"
                sx={{ width: 151 }}
                image="/static/images/cards/live-from-space.jpg"
                alt="Live from space album cover"
              />
            </Card>
        

        // <Card sx={{ maxWidth: 345 }}>
        //     {loading ? (
        //         <Typography sx={{ padding: 2 }}>Loading...</Typography>
        //     ) : (
        //         <>
        //             <CardMedia
        //                 sx={{ height: 140 }}
        //                 image={profile?.images?.[0]?.url || "https://via.placeholder.com/140"}
        //                 title="Spotify Profile Picture"
        //             />
        //             <CardContent>
        //                 <Typography gutterBottom variant="h5">
        //                     {profile?.display_name || "Unknown User"}
        //                 </Typography>
        //                 <Typography variant="body2" sx={{ color: "text.secondary" }}>
        //                     {profile?.email ? `Email: ${profile.email}` : "No email found"}
        //                 </Typography>
        //             </CardContent>
        //             <CardActions>
        //                 <Button size="small">Share</Button>
        //                 <Button size="small">Learn More</Button>
        //             </CardActions>
        //         </>
        //     )}
        // </Card>
    );
};

export default Profile;

async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: "http://localhost:5173",
        scope: "user-read-private user-read-email",
        code_challenge_method: "S256",
        code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
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

async function getAccessToken(clientId: string, code: string) {
    const verifier = localStorage.getItem("verifier");
    if (!verifier) throw new Error("No verifier found, authentication process needs to restart.");

    const params = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:5173",
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

async function fetchProfile(token: string) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!result.ok) {
        throw new Error("Failed to fetch profile");
    }

    return await result.json();
}
