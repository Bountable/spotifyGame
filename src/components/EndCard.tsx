//end card for when the player wins
import React from 'react';
import { Box, Button, Typography } from "@mui/material";



interface EndCardProps {
    score: string;
    onPlayAgain: () => void;
}

const EndCard: React.FC<EndCardProps> = ({ score, onPlayAgain }) => {

    return (
        <Box sx={{ textAlign: "center", bgcolor: "#121212", p: 3, borderRadius: "16px", border: "3px solid #1DB954", width: "300px", }}>
            <Typography variant="h4" sx={{ color: "#1DB954", mb: 2 }}>
                Game Over!
            </Typography>
            <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                Your Score: {score}
            </Typography>
            <Button
                variant="contained"
                sx={{
                    bgcolor: "#1DB954",
                    color: "white",
                    fontSize: "1rem",
                    "&:hover": { bgcolor: "#1ED760" },
                }}
                onClick={onPlayAgain}
            >
                Play Again
            </Button>
        </Box>
    );
}
export default EndCard;