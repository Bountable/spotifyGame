import React, { Profiler } from "react";
import Profile from  "./components/Profile" 

const App: React.FC = () => {
    return (
        <div>
            <h1>Spotify Authentication</h1>
            <Profile />
        </div>
    );
};

export default App;
