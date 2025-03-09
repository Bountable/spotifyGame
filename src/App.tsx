import { useState } from "react";
import PlayList from "./components/PlayList";
import Game from "./components/Game";
import Profile from "./components/Profile";
import { Box, Typography } from "@mui/material";

const App = () => {
    const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Box sx={{ 
                width: "34ppx", 
                bgcolor: "#1DB954", 
                borderRadius: "16px", 

                p: 3, 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
            }}>
                <Typography sx={{ color: "black", fontWeight: "bold", mb: 2}}>
                    🎵 Guess the Song 🎵 
                </Typography>

                <Profile />
            
                <PlayList  setPlaylistUrl={setPlaylistUrl}  />

            </Box>
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
                {playlistUrl ? (
                    <Game playlistUrl={playlistUrl} />
                ) : (
                   
                    <Typography sx={{ color: "white", fontSize: "1.5rem" }}>
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default App;
