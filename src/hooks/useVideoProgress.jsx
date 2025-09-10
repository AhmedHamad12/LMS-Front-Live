// src/hooks/useVideoProgress.js

import { useEffect, useRef, useState } from 'react';
import axios from '../api/axios'; // تأكد من صحة هذا المسار
import { Cookies } from "react-cookie";

export default function useVideoProgress(activeLesson) {
    const [progressPercent, setProgressPercent] = useState(0);
    const playerRef = useRef(null); // للـ iframe
    const playerInstance = useRef(null);

    const progressRefs = useRef({ duration: 0, maxPos: 0, lastSentMs: 0, lastSentSec: 0, lastSentPct: 0 });
    const cookies = new Cookies();
    const token = cookies.get("token");

    const sendProgress = async (event, sec) => {
        if (!activeLesson) return;
        const { duration, maxPos } = progressRefs.current;
        const payload = {
            durationSeconds: Math.round(duration),
            positionSeconds: Math.round(sec),
            maxPositionSeconds: Math.round(Math.max(maxPos, sec)),
            percent: duration > 0 ? +((sec / duration) * 100).toFixed(2) : 0,
            event,
        };
        try {
            await axios.post(`/api/lesson/${activeLesson.id}/progress`, payload, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
        } catch (e) { console.error("Failed to send progress:", e); }
    };

    useEffect(() => {
        const scriptId = 'bunny-player-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
            script.async = true;
            document.body.appendChild(script);
        }
        
        const playerIframe = playerRef.current;
        if (!activeLesson || !playerIframe || typeof window.playerjs === 'undefined') return;

        progressRefs.current = { duration: 0, maxPos: 0, lastSentMs: 0, lastSentSec: 0, lastSentPct: 0 };
        setProgressPercent(0);

        let player;
        const timeoutId = setTimeout(() => {
            player = new window.playerjs.Player(playerIframe);
            playerInstance.current = player;
            player.on("ready", async () => {
                player.getDuration(d => progressRefs.current.duration = d || 0);
                try {
                    const { data: progress } = await axios.get(`/api/lesson/${activeLesson.id}/progress/me`, { headers: { Authorization: `Bearer ${token}` } });
                    const lastPos = progress?.lastPositionSeconds || 0;
                    if (lastPos > 5) player.setCurrentTime(lastPos);
                    setProgressPercent(progress?.percent || 0);
                    sendProgress("opened", lastPos);
                } catch { sendProgress("opened", 0); }
            });
            player.on("timeupdate", d => {
                const sec = d.seconds || 0;
                const duration = d.duration || 0;
                const pct = duration > 0 ? (sec / duration) * 100 : 0;
                progressRefs.current.maxPos = Math.max(progressRefs.current.maxPos || 0, sec);
                setProgressPercent(pct);
                
                const now = Date.now();
                const { lastSentMs, lastSentSec, lastSentPct } = progressRefs.current;
                if ((now - lastSentMs >= 15000) || (Math.abs(sec - lastSentSec) >= 10) || (Math.abs(pct - lastSentPct) >= 5)) {
                    sendProgress("timeupdate", sec);
                    progressRefs.current.lastSentMs = now;
                    progressRefs.current.lastSentSec = sec;
                    progressRefs.current.lastSentPct = pct;
                }
            });
            player.on("ended", () => { setProgressPercent(100); sendProgress("ended", progressRefs.current.duration); });
        }, 300);

        return () => { clearTimeout(timeoutId); if(player) player.destroy(); };
    }, [activeLesson]);

    useEffect(() => {
        const beaconHandler = () => {
            if (activeLesson && playerInstance.current) {
                playerInstance.current.getCurrentTime(sec => sendProgress('closing', sec || 0));
            }
        };
        window.addEventListener('beforeunload', beaconHandler);
        return () => window.removeEventListener('beforeunload', beaconHandler);
    }, [activeLesson]);

    return { playerRef, progressPercent };
}