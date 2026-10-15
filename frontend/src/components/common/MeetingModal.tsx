import React, { useState } from 'react';
import { X, Video, VideoOff, Mic, MicOff, Users, ExternalLink, Calendar } from 'lucide-react';
import { Meeting } from '../../types';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, meeting }) => {
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black text-white rounded-xl">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                {meeting.title}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 font-semibold">
                  Live Session
                </span>
              </h3>
              <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {new Date(meeting.scheduledAt).toLocaleString()} ({meeting.durationMinutes} mins)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={meeting.meetUrl || 'https://sparkmeet-web.onrender.com/'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold transition"
            >
              Join on SparkMeet
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="p-6 bg-zinc-100/70 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Feed */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
            {videoOn ? (
              <div className="w-full h-full bg-gradient-to-b from-zinc-50 to-zinc-100 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center font-bold text-2xl shadow-md">
                  {meeting.organizerName.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="mt-3 font-bold text-zinc-900 text-sm">{meeting.organizerName} (Organizer)</h4>
                <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  Connected via HD Stream
                </p>
              </div>
            ) : (
              <div className="text-center text-zinc-400">
                <VideoOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">Camera is turned off</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-white">
              {meeting.organizerName}
            </div>
          </div>

          {/* Peer Feed */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
            <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-base">
                <Users className="w-7 h-7 text-zinc-700" />
              </div>
              <h4 className="mt-3 font-semibold text-zinc-900 text-xs">Team Participants ({meeting.attendees?.length || 0})</h4>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2 max-w-xs">
                {meeting.attendees?.slice(0, 4).map((a, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-medium">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-white" />
              Room Attendees
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-zinc-200 bg-white flex items-center justify-between">
          <div className="text-xs text-zinc-500 font-medium">
            Encrypted WebRTC Session • SparkMeet Adapter
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-full border transition ${
                micOn
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-900 hover:bg-zinc-200'
                  : 'bg-black text-white border-black'
              }`}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-full border transition ${
                videoOn
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-900 hover:bg-zinc-200'
                  : 'bg-black text-white border-black'
              }`}
            >
              {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <a
              href={meeting.meetUrl || 'https://sparkmeet-web.onrender.com/'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-white" />
              Join on SparkMeet
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs transition"
            >
              Leave Meeting
            </button>
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            ID: {meeting.id.slice(0, 10)}
          </div>
        </div>
      </div>
    </div>
  );
};
