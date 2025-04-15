import { Box, Typography, Button, TextField } from "@mui/material";
import { usePlayerDevice, WebPlaybackSDK } from "react-spotify-web-playback-sdk";
import { useAuth } from "./AuthContext";
import { useCallback, useState } from "react";

const Game = ({ playlistUrl }: { playlistUrl: string }) => {
  const { accessToken } = useAuth();

  const getOAuthToken = useCallback(callback => callback(accessToken), [accessToken]);

  return (
    <Box
      sx={{
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
      }}
    >
      <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
        Now Playing from: {playlistUrl}
      </Typography>

      <WebPlaybackSDK deviceName="My awesome Spotify app" getOAuthToken={getOAuthToken} volume={0.5}>
        <PlayerContent accessToken={accessToken} playlistUrl={playlistUrl} />
      </WebPlaybackSDK>
    </Box>
  );
};

const PlayerContent = ({ accessToken, playlistUrl }: { accessToken: string; playlistUrl: string }) => {

    const [song, setSong] = useState(null);
    const [songTitle, setSongTitle] = useState(null);
    const [inputValue, setInputValue] = useState("");


                
    const PlaySong = (uri: string) => {

        fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${device.device_id}`,
            {
            method: "PUT",
            body: JSON.stringify({ uris: [uri] }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            },
        );
        if (device === null) return null;
    }


    const device = usePlayerDevice();

    const getRandomSong = () => {
            
        if (!device) return;

        fetch(`https://api.spotify.com/v1/playlists/${playlistUrl}/tracks?limit=1&offset=${Math.floor(Math.random() * 1000)}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        })
        .then(response => response.json())
        .then(data => {
            const track = data.items[0]?.track;
            setSong(track?.uri);
            setSongTitle(track?.name);
            console.log("Selected Track:", track.name);
        
        
        PlaySong(track?.uri);
        console.log(data);
        
    })};



 


  
    const playerGuess = () => {

        console.log("Player Guess:", inputValue);

        if (inputValue.toLocaleLowerCase() === songTitle.toLocaleLowerCase()) {
            alert("Correct!");
            setInputValue("");
            getRandomSong();
        } else {
            alert("Try Again!");
        }

    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

  



  return (
    <>
      <Button variant="contained" onClick={getRandomSong}>
        Play Random Song
      </Button>
      {song && (
        <Typography variant="body1" sx={{ color: "white", mt: 2 }}>
          Current URI: {song}
        </Typography>



      )}
    
        <TextField id="guess" label="Outlined" variant="outlined" sx={{ input: { color: 'white' } }} onChange={handleChange} />
        <button onClick={playerGuess}>Submit Guess</button>

    
    </>
  );
};

export default Game;
