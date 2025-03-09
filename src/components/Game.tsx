import { Box, Typography, Button } from "@mui/material";

const Game = ({ playlistUrl }: { playlistUrl: string }) => {
    return (
        <Box sx={{ 
            textAlign: "center", 
            p: 5, 
            borderRadius: "16px", 
            width: "1350px", 
            height: "90%", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "center", 
            boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
            marginLeft: 1,
        }}>
            <Typography variant="h5" sx={{ color: "black", fontWeight: "bold" }}>
                Now Playing from:
            </Typography>
            <Typography variant="h6" sx={{ color: "black", fontStyle: "italic" }}>
                {playlistUrl}
            </Typography>
            <Button 
                variant="contained" 
                sx={{ bgcolor: "black", color: "white", mt: 2, width: "80%", fontWeight: "bold" }}
            >
                Start Guessing!
            </Button>
        </Box>
    );
};

export default Game;
