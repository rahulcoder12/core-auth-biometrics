// telemetry_sdk/biometrics.js

class BiometricTracker {
    constructor(clientId, apiUrl) {
        this.clientId = clientId;
        this.apiUrl = apiUrl;
        
        // Generate a random session ID for this specific visit
        this.sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        
        // Buffers to hold data before sending
        this.keystrokes = [];
        this.mouseMovements = [];
        
        // Settings
        this.mouseThrottleMs = 100;
        this.lastMouseCapture = 0;
        this.flushIntervalMs = 5000; // Send data every 5 seconds

        this.initListeners();
        this.startDataFlush();
        
        console.log(`[Biometrics SDK] Initialized for client: ${this.clientId}`);
    }

    initListeners() {
        // 1. Keystroke Tracking
        document.addEventListener('keydown', (e) => {
            // Ignore modifiers like Shift/Ctrl by themselves if you want, but for biometrics, all keys matter!
            this.keystrokes.push({
                key: e.key,
                event_type: 'keydown',
                timestamp: Date.now()
            });
        });

        document.addEventListener('keyup', (e) => {
            this.keystrokes.push({
                key: e.key,
                event_type: 'keyup',
                timestamp: Date.now()
            });
        });

        // 2. Mouse Tracking (Throttled)
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - this.lastMouseCapture >= this.mouseThrottleMs) {
                this.mouseMovements.push({
                    x: e.clientX,
                    y: e.clientY,
                    event_type: 'mousemove',
                    timestamp: now
                });
                this.lastMouseCapture = now;
            }
        });

        // 3. Click Tracking
        document.addEventListener('mousedown', (e) => {
            this.mouseMovements.push({
                x: e.clientX,
                y: e.clientY,
                event_type: 'click',
                timestamp: Date.now()
            });
        });
    }

    // Send the buffered data to the backend
    async flushData() {
        if (this.keystrokes.length === 0 && this.mouseMovements.length === 0) {
            return; // Nothing to send
        }

        const payload = {
            client_id: this.clientId,
            session_id: this.sessionId,
            user_id: null, // Can be set later when the user logs into the client site
            keystrokes: [...this.keystrokes],
            mouse_movements: [...this.mouseMovements]
        };

        // Clear buffers immediately so we don't duplicate data while waiting for the network
        this.keystrokes = [];
        this.mouseMovements = [];

        try {
            await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            // Silently succeed
        } catch (error) {
            console.error("[Biometrics SDK] Failed to send telemetry", error);
            // In a production app, you might push the data back into the buffer to retry later
        }
    }

    startDataFlush() {
        setInterval(() => this.flushData(), this.flushIntervalMs);
    }
}