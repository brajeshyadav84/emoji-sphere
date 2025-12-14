import React from 'react';

const OnlineGames: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <iframe 
                src="https://business.gamezop.com/html5-games" 
                title="Gamezop Games"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default OnlineGames;