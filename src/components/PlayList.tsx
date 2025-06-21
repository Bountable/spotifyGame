import { Box, Typography, Avatar, Button, TextField,  } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface Playlist {
    name: string;
    images?: { url: string }[];
}
 


const PlayList = ({ setPlaylistUrl }: { setPlaylistUrl: (url: string) => void }) => {

    const { accessToken } = useAuth();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState(""); 

    useEffect(() => {
        if (!accessToken || !url) return;

        async function fetchPlaylist() {
            try {
                const result = await fetch(`https://api.spotify.com/v1/playlists/${url}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!result.ok) {
                    console.error("Failed to fetch playlist");
                    return;
                }

                const data = await result.json();
                setPlaylist({ name: data.name, images: data.images }); 
            } catch (error) {
                console.error("Error fetching playlist:", error);
            }
        }

        fetchPlaylist();
    }, [accessToken, url]);

    // const handleEnterClick = () => {
    //     if (inputValue.trim()) {
    //         setUrl(inputValue);
    //     }
    // };

    const handleUseThisClick = () => {
        setPlaylistUrl(inputValue)
    }

    return (
        

        <Box
         onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
         sx={{ textAlign: "center", bgcolor: "#121212", p: 3, borderRadius: "16px", border: "3px solid #1DB954", width: "300px",   } }>
            {playlist ? (
                <>
                    <Avatar
                        src={playlist.images?.[0]?.url || "/static/images/default-playlist.jpg"}
                        alt={playlist.name}
                        sx={{ width: 150, height: 150, margin: "auto", border: "3px solid #1DB954" }}
                    />
                    <Typography variant="h5" sx={{ color: "white", mt: 2, fontWeight: "bold" }}>
                        {playlist.name}
                    </Typography>
                    <Button variant="contained" sx={{ bgcolor: "#1DB954", mt: 2, width: "100%" }} onClick={handleUseThisClick}>
                        Use This
                    </Button>
                    <br/>
                    <br/>
                    <br/>
                    <TextField 
                        label="Enter Playlist URL"
                        
                        variant="outlined"
                        id="playlist-url"
                        onChange={(e) => setInputValue(e.target.value)} 
                        value={inputValue}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            color: "white", // Text color white
                            "& fieldset": {
                                borderColor: "#1DB954", // Green border
                            },
                            "&:hover fieldset": {
                                borderColor: "#1DB954", // Green border on hover
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#1DB954", // Green border on focus
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: "white", // Label color white
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                            color: "#1DB954", // Green label on focus
                        },
                    }}
                    focused
                 />
                    
                    
                    
                </> 
            ) : (
                <TextField 
                    label="Enter Playlist URL"
                    
                    variant="outlined"
                    id="playlist-url"
                    onChange={(e) => setInputValue(e.target.value)} 
                    value={inputValue}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        color: "white", // Text color white
                        "& fieldset": {
                            borderColor: "#1DB954", // Green border
                        },
                        "&:hover fieldset": {
                            borderColor: "#1DB954", // Green border on hover
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#1DB954", // Green border on focus
                        },
                    },
                    "& .MuiInputLabel-root": {
                        color: "white", // Label color white
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#1DB954", // Green label on focus
                    },
                }}
                focused
            />

            )}
      
        </Box>

    );
};

export default PlayList;
