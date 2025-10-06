
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import RoomChat from '@/components/RoomChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  // Generate a secure room name if the roomId is too simple
  function isSimpleRoom(id?: string) {
    return !id || id.length < 6 || /^\d+$/.test(id);
  }
  function generateSecureRoomName() {
    // e.g., room-<random 8 chars>
    return 'room-' + Math.random().toString(36).slice(2, 10);
  }
  const [secureRoom, setSecureRoom] = useState(isSimpleRoom(roomId) ? generateSecureRoomName() : roomId);
  const [showLobby, setShowLobby] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [copied, setCopied] = useState(false);


  const handleRaiseHand = () => {
    alert('You raised your hand!');
  };
  const handleAskQuestion = () => {
    alert('You want to ask a question!');
  };

  const inviteLink = `${window.location.origin}/room/${secureRoom}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Room: <span className="text-primary">{secureRoom}</span></h1>
      {isSimpleRoom(roomId) && (
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 rounded text-yellow-800 max-w-2xl">
          <b>For safety, a secure room name has been generated.</b> Share the invite link below with your students. Simple room names can be easily guessed and are not recommended.
        </div>
      )}
      <div className="mb-4 flex gap-2 items-center">
        <Input readOnly value={inviteLink} className="w-72" />
        <Button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Invite Link'}</Button>
      </div>
      {showLobby ? (
        <div className="w-full max-w-md bg-white rounded shadow p-6 flex flex-col items-center">
          <label className="mb-2 font-semibold">Enter your display name to join:</label>
          <input
            className="border rounded px-3 py-2 mb-4 w-full"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="e.g. Student Name"
            maxLength={32}
          />
          <Button
            className="w-full"
            disabled={!displayName.trim()}
            onClick={() => setShowLobby(false)}
          >
            Join Meeting
          </Button>
        </div>
      ) : (
        <>
          <div className="w-full max-w-5xl bg-white rounded shadow p-6 mb-4">
            <JitsiMeeting
              roomName={secureRoom}
              domain="meet.jit.si"
              configOverwrite={{
                startWithAudioMuted: true,
                disableModeratorIndicator: false,
                enableEmailInStats: false,
              }}
              interfaceConfigOverwrite={{
                filmStripOnly: false,
                SHOW_JITSI_WATERMARK: false,
              }}
              userInfo={{
                displayName: displayName || 'Student',
                email: 'student@example.com',
              }}
              getIFrameRef={node => {
                node.style.height = '600px';
                node.style.width = '100%';
              }}
            />
          </div>
          <div className="w-full max-w-5xl h-72">
            <RoomChat onRaiseHand={handleRaiseHand} onAskQuestion={handleAskQuestion} />
          </div>
        </>
      )}
    </div>
  );
};

export default Room;
