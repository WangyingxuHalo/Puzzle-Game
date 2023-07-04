import PuzzleGame from "./pages/PuzzleGame";
import sound from "pixi-sound";
import backgroundSound from "./sound/background-sound.mp3";
import { useEffect } from "react";

function App() {
  
  useEffect(() => {
    sound.add("backgroundSound", backgroundSound);
    sound.play('backgroundSound');
  }, [])

  return (
    <div>
      <PuzzleGame />
    </div>
  );
}

export default App;
