import { Box, Card, CardContent, CardHeader, Typography, Avatar, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // Import the authentication context

const Profile = () => {
    const { accessToken, login, logout } = useAuth(); // Use the token from context
    interface Profile {
        display_name?: string;
        email?: string;
        images?: { url: string }[];
        followers?: { total: number };
        product?: string;
    }

    const [profile, setProfile] = useState<Profile | null>(null);


    
    // const commonStyles = {
    //     m: 1,
    //     border: 50,
    //     width: '5rem',
    //     height: '5rem',
    // };



    useEffect(() => {
        if (!accessToken) return;
        
        async function fetchProfile() {
            try {
                const result = await fetch("https://api.spotify.com/v1/me", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!result.ok) throw new Error("Failed to fetch profile");

                const data = await result.json();
                setProfile(data);
            } catch (error) {
                console.error(error);
                logout();
            } 
        }

        fetchProfile();
    }, [accessToken]);

    return (
        <Box sx={{ border: 3, borderRadius: '16px', borderColor: "#1DB954", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#121212", mb: 1, p: 2 }}>
            {!accessToken ? (
                
                <Button variant="contained" sx={{ bgcolor: "black", fontSize: "1.2rem", padding: "10px 20px", borderRadius: "16px"  }} onClick={login}>
                    Login With Spotify
                </Button>
            ) : (
                <Card sx={{ width: 315, bgcolor: "#121212", color: "white", borderRadius: 3, boxShadow: 5, textAlign: "center",  }}>
                    <CardHeader
                        avatar={
                            <Avatar
                                src={profile?.images?.[0]?.url || "/static/images/default-profile.jpg"}
                                alt="Profile"
                                sx={{ width: 70, height: 80, margin: "auto", border: "3px solid #1DB954" }}
                            />
                        }
                        title={
                            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                {profile?.display_name || "Unknown User"}
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body1" color="gray">Email:</Typography>
                            <Typography variant="body1">{profile?.email || "N/A"}</Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body1" color="gray">Followers:</Typography>
                            <Typography variant="body1">{profile?.followers?.total || 0}</Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body1" color="gray">Subscription:</Typography>
                            <Typography variant="body1">{profile?.product?.toUpperCase() || "N/A"}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default Profile;
