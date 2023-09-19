import React, { useState } from "react";
import DataReader from "./DataReader";

function App() {
    const [fileLoaded, setFileLoaded] = useState(false);

    const handleFileLoaded = () => {
        setFileLoaded(true);
    };

    return (
        <div className="App">
            <h2>World airport's</h2>
            <DataReader onFileLoaded={handleFileLoaded} />
        </div>
    );
}

export default App;