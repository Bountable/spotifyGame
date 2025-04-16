import { useState } from "react";
import PlayList from "./components/PlayList";
import Game from "./components/Game";
import Profile from "./components/Profile";
import { Box, Button, Typography } from "@mui/material";



const App = () => {


    
    const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Box
                sx={{
                    width: "340px",
                    bgcolor: "#1DB954",
                    borderRadius: "16px",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between", // Push buttons to the bottom
                }}
            >
                {/* Top Section: Logo, Profile, and Playlist */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <img
                        src="./src/assets/logo.png"
                        alt="Logo"
                        style={{
                            width: "200px",
                            height: "200px",
                            marginBottom: "20px",
                            borderRadius: "10%",
                        }}
                    />
                    <Profile />
                    <PlayList setPlaylistUrl={setPlaylistUrl} />
                </Box>

                {/* Bottom Section: Help and Settings Buttons */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: "#333",
                            color: "white",
                            fontSize: "0.8rem",
                            "&:hover": { bgcolor: "#555" },
                        }}
                        onClick={() => alert("Go to Spotify.com click on a playlist and copy everything after the last / in the URL \n GAME RULES \n 1. You have to guess the song name (ignore features, capitlisation not required) \n 2.There are 5 rounds \n 3. The song will be played for 30 seconds \n 4. If you guess the song name you get a point \n 5. If you don't guess the song name you lose a point \n 6. -5 point deductiosn for hints" )}>
                        
                    
                        Help
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: "#333",
                            color: "white",
                            fontSize: "0.8rem",
                            "&:hover": { bgcolor: "#555" },
                        }}
                        onClick={() => alert("Settings clicked!")}
                    >
                        Settings
                    </Button>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
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

function componentDidMount() {
    throw new Error("Function not implemented.");
}
