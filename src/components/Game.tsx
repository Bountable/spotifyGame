import { Box, Typography, Button, TextField, Slider, Stack } from "@mui/material";
import { usePlayerDevice, WebPlaybackSDK } from "react-spotify-web-playback-sdk";
import { useAuth } from "./AuthContext";
import { use, useCallback, useEffect, useState } from "react";
import Confetti from 'react-confetti'
import { motion } from "framer-motion";
import { style } from "framer-motion/client";

const Game = ({ playlistUrl }: { playlistUrl: string }) => {


  const { accessToken } = useAuth();
  const getOAuthToken = useCallback(callback => callback(accessToken), [accessToken]);
  return (
    <Box
      sx={{
        textAlign: "center",
        p: 5,
        borderRadius: "16px",
        width: "1000px",
        height: "90%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 1,
      }}
    >
    

      <WebPlaybackSDK deviceName="My awesome Spotify app" getOAuthToken={getOAuthToken} volume={0.5}>
        <PlayerContent accessToken={accessToken} playlistUrl={playlistUrl} />
      </WebPlaybackSDK>
    </Box>
  );
};

const PlayerContent = ({ accessToken, playlistUrl }: { accessToken: string; playlistUrl: string }) => {
  

    
    const supportWords = ['nice', 'good', 'great', 'awesome', 'fantastic', 'amazing', 'incredible', 'wonderful', 'excellent', 'superb'];

    const [song, setSong] = useState(null);
    const [songTitle, setSongTitle] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [paused, setPaused] = useState(false);
    const [correct, setCorrect] = useState(false);
    
    const [hintUsed , setHintUsed] = useState(false);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

       //game is finished score = 10
       useEffect(() => {
        if (round > 5) {
         
          //TOOD: Add a modal to show the score
          alert(`Game Over! Your score is ${score}`);
          setRound(0);
          setScore(0);
          setSong(null);
          setSongTitle(null);
          setInputValue("");
          setPaused(false);
          setHintUsed(false);
          setShowConfetti(false);
        }
      }
      , [ round]);
     

                
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
      document.getElementById("coverArt").setAttribute("src", "./src/assets/question-sign.png");
      if (!device) return;
      setRound(round + 1);
      setCorrect(false);
      // Fetch the playlist size first
      fetch(`https://api.spotify.com/v1/playlists/${playlistUrl}/tracks?limit=1`, {
          method: "GET",
          headers: {
              Authorization: `Bearer ${accessToken}`,
          },
      })
      .then(response => response.json())
      .then(data => {
          const playlistSize = data.total; // Get the total number of tracks
          const randomOffset = Math.floor(Math.random() * playlistSize);
  
          // Fetch a random song using the calculated offset
          return fetch(`https://api.spotify.com/v1/playlists/${playlistUrl}/tracks?limit=1&offset=${randomOffset}`, {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${accessToken}`,
              },
          });
      })
      .then(response => response.json())
      .then(data => {
          const track = data.items[0]?.track;
          setSong(track?.uri);
          setSongTitle(track?.name);
          console.log("Playlist Size:", data.total);
          console.log("Selected Track:", track.name);
  
          PlaySong(track?.uri);
          console.log(data);
      })
      
      .catch(error => {
          console.error("Error fetching random song:", error);
      });
  };

  function sanitizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[\W_]+/g, " ")                 // Remove special characters like *, ', ", etc.
      .replace(/\b(ft|feat|featuring)\b.*$/, "") // Remove "ft", "feat", or "featuring" and everything after
      .trim();                                 // Trim whitespace
  }

 


  
  const playerGuess = () => {
    const supportWords = ['nice', 'good', 'great', 'awesome', 'fantastic', 'amazing', 'incredible', 'wonderful', 'excellent', 'superb'];

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;


 
  
    console.log("Player Guess:", inputValue);
  
    //remove caps * - / ' " apostrphoes symbols anything after feature or ft
  
    
    const sanitizedInput = sanitizeTitle(inputValue);
    const sanitizedSongTitle = sanitizeTitle(songTitle);


    console.log("Sanitized Input:", sanitizedInput);
    console.log("Sanitized Song Title:", sanitizedSongTitle);
    
    if (sanitizedInput === sanitizedSongTitle) {
      showCoverArt(new MouseEvent("click"));
      setInputValue("");
      setShowConfetti(true);
      setCorrect(true);
      document.getElementById("shuffleButton")?.classList.add("pulse");

      setTimeout(() => {
        setShowConfetti(false); // clean up after 2s
      }, 2000);
  
      setScore(hintUsed ? score + 5 : score + 10);
  
      const shuffleButton = document.getElementById("shuffleButton");
      if (shuffleButton) {
        shuffleButton.textContent = "Next Song";
      }
    } else {

      document.getElementById("submitButton")?.classList.add("shake");
      setTimeout(() => {
        document.getElementById("submitButton")?.classList.remove("shake");
      }, 1000);
      setInputValue("");

    }
  };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

  



  function togglePlayPause(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {


    if (!device) return;


    if(paused)
    {
      fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${device.device_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setPaused(false);
    }
    if(!paused){
      fetch(
        `https://api.spotify.com/v1/me/player/pause?device_id=${device.device_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setPaused(true);
    }
   
   

  }


  function changeVolume(event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]): void {
   
    if (!device) return;
    fetch(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${value}&device_id=${device.device_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("Volume changed to:", value);


  }
  function showCoverArt(event?: MouseEvent<HTMLButtonElement, MouseEvent>): void {

    
    if (!device) return;
    fetch(
      `https://api.spotify.com/v1/me/player/currently-playing`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then(response => response.json())

    .then(data => {
      const coverArtUrl = data.item.album.images[0].url;
      document.getElementById("coverArt").setAttribute("src", coverArtUrl);
    })
    .catch(error => {
      console.error("Error fetching cover art:", error);
    });

  }

// https://creativecommons.org/licenses/by/3.0/
  return (
     <>
       {/* Score & Round pinned to corners */}
       <Box sx={{ position: 'absolute', top: 24, left: 420 }}>
        <Typography variant="h5" sx={{ color: '#1DB954', fontWeight: 'bold' }}>Score: {score}</Typography>
      </Box>
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <Typography variant="h5" sx={{ color: '#1DB954', fontWeight: 'bold' }}>Round: {round}/5</Typography>
      </Box>


      <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
        {correct ? songTitle : "Guess the Song Title!"}
      </Typography>

  
      <motion.img
        key={song} // ensures re-animation on new song
        id="coverArt"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "16px",
          border: "3px solid #1DB954",
          marginTop: "50px",
        }}
        src={"./src/assets/question-sign.png"}
      />




    <Stack spacing={4} sx={{ width: '100%', maxWidth: '800px', mt: 4, color: 'white' }}>
      
      
      {song && (
        <Typography variant="body2" sx={{ fontStyle: "italic", color: "gray" }}>
          Now Playing: {song}
        </Typography>
      )}
  <Box
  
      sx={{
        display: "flex",
        gap: 2, 
        width: "80%",
        paddingLeft:12
      }}
  > 
  <TextField
    fullWidth
    variant="outlined"
    label="Guess the Song Title"
    value={inputValue}
    onChange={handleChange}
    sx={{
      input: { color: "white" },
      label: { color: " #1DB954" },
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#1DB954" },
        "&:hover fieldset": { borderColor: "#1DB954" },
        "&.Mui-focused fieldset": { borderColor: "#1DB954" },
      },
    }}
  />

  <Button
    id="submitButton"
    onClick={playerGuess}
    sx={{
      bgcolor: "#1DB954",
      color: "black",
      fontWeight: "bold",
      width: "160px",
    
      height: "56px",
      px: 3, 
      
    }}
  >
    Submit
  </Button>
</Box>
  
      {showConfetti && (
  <>
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={500}
      gravity={0.3}
      recycle={false}
      wind={0.01}
      run={true}
      colors={["#1DB954", "#ffffff", "#191414"]}
    />
    <motion.div
         initial={{ scale: 0, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.4 }}
         style={{
           position: "absolute",
           top: "5%",
           left: "53.5%",
           transform: "translate(-3000px, -50px)", // Center the message
           background: "#1DB954",
           color: "black",
           padding: "1rem 2rem",
           borderRadius: "16px",
           fontWeight: "bold",
           fontSize: "1.5rem",
           zIndex: 2, // Ensure it appears above the cover art
           boxShadow: "0 0 30px #1DB954",
           textAlign: "center",
      }}
    >
      ✅ {supportWords[Math.floor(Math.random() * supportWords.length)]}
    </motion.div>
  </>
        
      )}

      {/* Media Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#121212',
          borderRadius: '999px',
          px: 4,
          py: 2,
          boxShadow: '0px 2px 10px rgba(0,0,0,0.5)',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Button
      onClick={togglePlayPause}
      sx={{
        bgcolor: '#1DB954',
        color: 'black',
        borderRadius: '999px',
        minWidth: '50px',
        height: '50px',
        fontWeight: 'bold',
        '&:hover': { bgcolor: '#1ed760' },
      }}
    >
      {paused ? '▶' : '⏸'}
    </Button>
   
    <Button
      onClick={() => { showCoverArt(); setHintUsed(true); }}
      variant="outlined"
      sx={{
        color: '#ccc',
        borderColor: '#555',
        borderRadius: '999px',
        '&:hover': {
          bgcolor: '#1DB954',
          color: 'black',
          borderColor: '#1DB954',
        },
      }}
    >
      Hint
    </Button>
  </Box>

  <Box sx={{ textAlign: 'center', flex: 1 }}>
    <Button
      variant="contained"
      onClick={getRandomSong}
      id="shuffleButton"
      sx={{
        bgcolor: "gray",
        '&:hover': { bgcolor: "grey" },
        color: "black",
        fontWeight: "bold",
        width: "160px",
      }}
    >
      {round === 0 ? "Start Game" : "Next Song"}
    </Button>
  </Box>
    
  
  <Box sx={{ width: 200,  }}>
          <Slider
            defaultValue={30}
            step={1}
            min={0}
            max={100}
            onChangeCommitted={changeVolume}
            sx={{
              color: '#1DB954',
              mr: -1
            }}
            />
        </Box>
      </Box>
    </Stack>
    </>
  );
 
  
};

export default Game;


