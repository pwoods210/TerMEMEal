import { useState } from "react";

import './App.css'
import Header from './Components/Header.tsx'
import TradePanel from './Components/TradePanel.tsx'
import DiscoveryFeed from './Components/DiscoveryFeed.tsx'
import FaceGate from './Components/FaceGate.tsx'

function App() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <>
      <div aria-hidden={!hasEntered}>
        <Header />
        <main className="container py-4">
          <div id="discovery_feed">
            <DiscoveryFeed />
          </div>
          <div id="trade_panel">
            <TradePanel />
          </div>
        </main>
      </div>
      <FaceGate onEnter={() => setHasEntered(true)} />
    </>
  );
}

export default App
