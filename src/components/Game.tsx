import { Box, Typography, Button, TextField, Slider, Stack } from "@mui/material";
import { usePlayerDevice, WebPlaybackSDK } from "react-spotify-web-playback-sdk";
import { useAuth } from "./AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";
import Confetti from 'react-confetti'
import { motion } from "framer-motion";

const Game = ({ playlistUrl }: { playlistUrl: string }) => {
  const { accessToken } = useAuth();
  const getOAuthToken = useCallback((callback: (token: string) => void) => {
    if (accessToken) {
      callback(accessToken);
    } else {
      console.error("Access token is null");
    }
  }, [accessToken]);
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
      <WebPlaybackSDK getOAuthToken={getOAuthToken} initialDeviceName={""}>
        {accessToken && <PlayerContent accessToken={accessToken} playlistUrl={playlistUrl} />}
      </WebPlaybackSDK>
    </Box>
  );
};

const supportWords = ['nice', 'good', 'great', 'awesome', 'fantastic', 'amazing', 'incredible', 'wonderful', 'excellent', 'superb'];

function sanitizeTitle(title: string): string {
  return (title || "")
    .toLowerCase()
    .replace(/[-([].*?[)\]]/g, "")
    .replace(/[\W_]+/g, " ")
    .replace(/\b(ft|feat|featuring)\b.*$/, "")
    .replace(/remaster(ed)?/g, "")
    .replace(/[\d]/g, "")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const PlayerContent = ({ accessToken, playlistUrl }: { accessToken: string; playlistUrl: string }) => {
  const device = usePlayerDevice();

  const [song, setSong] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState<string | null>(null);
  const [coverArt, setCoverArt] = useState<string>("./src/assets/question-sign.png");

  const [inputValue, setInputValue] = useState("");
  const [paused, setPaused] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const [previousSongUri, setPreviousSongUri] = useState<string | null>(null);

  // For button animation
  const [shufflePulse, setShufflePulse] = useState(false);
  const [submitShake, setSubmitShake] = useState(false);

  // Ref for skipping debounce
  const skipTimeout = useRef<NodeJS.Timeout | null>(null);

  // Pause playback on game over
  useEffect(() => {
    if (round > 5 && device) {
      fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${device.device_id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPaused(true);
    }
  }, [round, device, accessToken]);

  // Play a song by URI
  const playSong = useCallback((uri: string | null) => {
    if (!device || !uri) return;
    fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${device.device_id}`,
      {
        method: "PUT",
        body: JSON.stringify({ uris: [uri] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }, [device, accessToken]);

  // Fetch and play a random song
  const getRandomSong = useCallback(() => {
    if (!device) return;
    setCorrect(false);
    setHintUsed(false);
    setCoverArt("./src/assets/question-sign.png");
    setInputValue("");
    fetch(`https://api.spotify.com/v1/playlists/${playlistUrl}/tracks?limit=1`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(response => response.json())
      .then(data => {
        const playlistSize = data.total;
        let randomOffset;
        do {
          randomOffset = Math.floor(Math.random() * playlistSize);
        } while (data.items[randomOffset]?.track?.uri === previousSongUri && playlistSize > 1);

        return fetch(`https://api.spotify.com/v1/playlists/${playlistUrl}/tracks?limit=1&offset=${randomOffset}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      })
      .then(response => response.json())
      .then(data => {
        if (round > 5) return;
        const track = data.items[0]?.track;
        setSong(track?.uri);
        setSongTitle(track?.name);
        setAlbumName(track?.album?.name);
        setPreviousSongUri(track?.uri);
        playSong(track?.uri);
      })
      .catch(error => {
        console.error("Error fetching random song:", error);
      });
  }, [accessToken, device, playlistUrl, previousSongUri, round, playSong]);

  // Show cover art for current song
  const showCoverArt = useCallback(() => {
    if (!device) return;
    fetch(
      `https://api.spotify.com/v1/me/player/currently-playing`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
      .then(response => response.json())
      .then(data => {
        const coverArtUrl = data?.item?.album?.images?.[0]?.url;
        if (coverArtUrl) setCoverArt(coverArtUrl);
      })
      .catch(error => {
        console.error("Error fetching cover art:", error);
      });
  }, [device, accessToken]);

  // Guess logic
  const playerGuess = useCallback(() => {
    if (!songTitle && !albumName) return;
    const sanitizedInput = sanitizeTitle(inputValue);
    const sanitizedSongTitle = sanitizeTitle(songTitle || "");
    const sanitizedAlbum = sanitizeTitle(albumName || "");

    if (sanitizedInput === sanitizedSongTitle || sanitizedInput === sanitizedAlbum) {
      showCoverArt();
      setInputValue("");
      setShowConfetti(true);
      setCorrect(true);
      setShufflePulse(true);
      setRound(prev => prev + 1);
      setTimeout(() => setShowConfetti(false), 2000);
      setScore(prev => prev + (hintUsed || sanitizedInput === sanitizedAlbum ? 5 : 10));
    } else {
      setSubmitShake(true);
      setTimeout(() => setSubmitShake(false), 1000);
      setInputValue("");
    }
  }, [inputValue, songTitle, albumName, showCoverArt, hintUsed]);

  // Next/Skip logic
  const onSkip = useCallback(() => {
    setCorrect(true);
    showCoverArt();
    if (skipTimeout.current) clearTimeout(skipTimeout.current);
    skipTimeout.current = setTimeout(() => {
      setCorrect(false);
      setInputValue("");
      setCoverArt("./src/assets/question-sign.png");
      setRound(prev => prev + 1);
      getRandomSong();
    }, 1800);
  }, [showCoverArt, getRandomSong]);

  // Play/pause logic
  const togglePlayPause = useCallback(() => {
    if (!device) return;
    fetch(
      `https://api.spotify.com/v1/me/player/${paused ? "play" : "pause"}?device_id=${device.device_id}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    setPaused(!paused);
  }, [device, accessToken, paused]);

  // Volume change
  const changeVolume = useCallback((_event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => {
    if (!device) return;
    fetch(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${value}&device_id=${device.device_id}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  }, [device, accessToken]);

  // On replay
  const onPlayAgain = useCallback(() => {
    setRound(0);
    setScore(0);
    setSong(null);
    setSongTitle(null);
    setAlbumName(null);
    setInputValue("");
    setPaused(false);
    setHintUsed(false);
    setShowConfetti(false);
    setCorrect(false);
    setPreviousSongUri(null);
    setCoverArt("./src/assets/question-sign.png");
    setTimeout(() => getRandomSong(), 300);
  }, [getRandomSong]);

  // Start game on first render or replay
  useEffect(() => {
    if (round === 0) {
      getRandomSong();
    }
    // eslint-disable-next-line
  }, [round]);

  // Remove shuffle pulse after animation
  useEffect(() => {
    if (shufflePulse) {
      const timeout = setTimeout(() => setShufflePulse(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [shufflePulse]);

  // Game over UI
  const renderGameOver = () => (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          bgcolor: "#121212",
          p: 4,
          borderRadius: "16px",
          border: "3px solid #1DB954",
          width: "320px",
          boxShadow: "0 0 30px rgba(0,0,0,0.5)",
        }}
      >
        <Typography variant="h4" sx={{ color: "#1DB954", mb: 2 }}>
          Game Over!
        </Typography>
        <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
          Your Score: {score}
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#1DB954",
            color: "black",
            fontSize: "1rem",
            "&:hover": { bgcolor: "#1ED760" },
          }}
          onClick={onPlayAgain}
        >
          Play Again
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
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
        key={song}
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
        src={coverArt}
      />
      <Stack spacing={4} sx={{ width: '100%', maxWidth: '800px', mt: 4, color: 'white' }}>
        {song && (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "gray" }}>
            Now Playing: {song}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 2, width: "80%", paddingLeft: 12 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Guess the Song Title"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
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
              animation: submitShake ? "shake 0.5s" : undefined,
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
                transform: "translate(-3000px, -50px)",
                background: "#1DB954",
                color: "black",
                padding: "1rem 2rem",
                borderRadius: "16px",
                fontWeight: "bold",
                fontSize: "1.5rem",
                zIndex: 2,
                boxShadow: "0 0 30px #1DB954",
                textAlign: "center",
              }}
            >
              ✅ {supportWords[Math.floor(Math.random() * supportWords.length)]}
            </motion.div>
          </>
        )}
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
              onClick={round === 0 ? getRandomSong : onSkip}
              id="shuffleButton"
              sx={{
                bgcolor: "gray",
                '&:hover': { bgcolor: "grey" },
                color: "black",
                fontWeight: "bold",
                width: "160px",
                animation: shufflePulse ? "pulse 1s" : undefined,
              }}
            >
              {round === 0 ? "Start Game" : correct === true?  "next" : "Skip" }
            </Button>
          </Box>
          <Box sx={{ width: 200 }}>
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
      {round > 5 && renderGameOver()}
    </>
  );
};

export default Game;


