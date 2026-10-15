import React, { useState } from 'react';
import { X, Video, VideoOff, Mic, MicOff, Users, Share2, ExternalLink, Calendar } from 'lucide-react';
import { Meeting } from '../../types';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, meeting }) => {
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'room' | 'attendees'>('room');

  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                {meeting.title}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-normal">
                  Live Session
                </span>
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(meeting.scheduledAt).toLocaleString()} ({meeting.durationMinutes} mins)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={meeting.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
            >
              Open External Meet
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="p-6 bg-slate-950 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Feed */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 flex items-center justify-center group">
            {videoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-300 font-bold text-2xl shadow-lg">
                  {meeting.organizerName.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="mt-3 font-semibold text-white">{meeting.organizerName} (Organizer)</h4>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected via HD Stream
                </p>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <VideoOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Camera is turned off</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium text-white">
              {meeting.organizerName}
            </div>
          </div>

          {/* Peer Feed */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 font-semibold text-lg">
                👥
              </div>
              <h4 className="mt-3 font-medium text-slate-200">Team Participants ({meeting.attendees?.length || 0})</h4>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2 max-w-xs">
                {meeting.attendees?.slice(0, 4).map((a, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Room Attendees
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Encrypted WebRTC Session • Google Meet Adapter
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-full border transition ${
                micOn
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
              }`}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-full border transition ${
                videoOn
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
              }`}
            >
              {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition"
            >
              Leave Meeting
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            ID: {meeting.id.slice(0, 10)}
          </div>
        </div>
      </div>
    </div>
  );
};
