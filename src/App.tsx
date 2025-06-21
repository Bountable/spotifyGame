import { useState } from "react";
import PlayList from "./components/PlayList";
import Game from "./components/Game";
import Profile from "./components/Profile";
import { Box, Button, Modal, Typography } from "@mui/material";



const App = () => {


    
    const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
    const [openSettingsModal ,setOpenSettingsModal] = useState(false); 

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
                        onClick={() => setOpenSettingsModal(true)} // Function to open settings modal
                        >                        
                    
                        Help
                    </Button>
                    <Modal
                        open={openSettingsModal}
                        onClose={() => setOpenSettingsModal(false)}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: "#121212",
                                p: 4,
                                borderRadius: "16px",
                                maxWidth: "500px",
                                margin: "auto",
                                textAlign: "center",
                                boxShadow: 24,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                border: "2px solid #1DB954",
                            }}
                        >
                            <Typography
                                id="modal-title"
                                variant="h5"
                                sx={{
                                    color: "#1DB954",
                                    fontWeight: "bold",
                                    mb: 2,
                                }}
                            >
                                How to Play
                            </Typography>
                            <Box
                                sx={{
                                    bgcolor: "#1E1E1E",
                                    p: 2,
                                    borderRadius: "8px",
                                    width: "100%",
                                    textAlign: "left",
                                }}
                            >
                                <Typography
                                    id="modal-description"
                                    sx={{
                                        color: "white",
                                        fontSize: "0.9rem",
                                        mb: 1,
                                    }}
                                >
                                    1. Go to Spotify.com, click on a playlist, and copy everything after the last "/" in the URL.
                                </Typography>
                                <Typography
                                    id="modal-description"
                                    sx={{
                                        color: "white",
                                        fontSize: "0.9rem",
                                        mb: 1,
                                    }}
                                >
                                    2. You have to guess the song name (ignore features, capitalization not required) or album cover (5 points).
                                </Typography>
                                <Typography
                                    id="modal-description"
                                    sx={{
                                        color: "white",
                                        fontSize: "0.9rem",
                                        mb: 1,
                                    }}
                                >
                                    3. There are 5 rounds.
                                </Typography>
                                <Typography
                                    id="modal-description"
                                    sx={{
                                        color: "white",
                                        fontSize: "0.9rem",
                                        mb: 1,
                                    }}
                                >
                                    4. The song will be played for 30 seconds.
                                </Typography>
                                <Typography
                                    id="modal-description"
                                    sx={{
                                        color: "white",
                                        fontSize: "0.9rem",
                                        mb: 1,
                                    }}
                                >
                                    5. If you guess the song name, you get a point.
                                </Typography>
                                <Typography
                                    id="modal-description"
                                    sx={{
                                        color: "white",
                                        fontSize: "0.9rem",
                                        mb: 1,
                                    }}
                                >
                                    6. If you don't guess the song name, you lose a point.
                                </Typography>
                                <Typography
                                    id="modal-description"
                                    sx={{
                                        color: "white",
                                        fontSize: "0.9rem",
                                        mb: 1,
                                    }}
                                >
                                    7. -5 point deductions for hints.
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                sx={{
                                    mt: 2,
                                    bgcolor: "#1DB954",
                                    color: "white",
                                    fontSize: "0.8rem",
                                    "&:hover": { bgcolor: "#1AA34A" },
                                    px: 3,
                                    py: 1,
                                    borderRadius: "8px",
                                }}
                                onClick={() => setOpenSettingsModal(false)}
                            >
                                Close
                            </Button>
                        </Box>
                    </Modal>
                    
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

