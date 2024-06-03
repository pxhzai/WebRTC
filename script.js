function detectIP() {
    const ipList = document.getElementById('ip-list');
    ipList.innerHTML = '';

    const addIP = (ip) => {
        const li = document.createElement('li');
        li.textContent = ip;
        ipList.appendChild(li);
    };

    const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    if (!RTCPeerConnection) {
        addIP('WebRTC not supported by this browser.');
        return;
    }

    const rtc = new RTCPeerConnection({ iceServers: [] });

    rtc.onicecandidate = (event) => {
        if (event.candidate) {
            const candidate = event.candidate.candidate;
            console.log('ICE Candidate:', candidate);  // Log the ICE candidate for debugging
            const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
            const ipMatch = candidate.match(ipRegex);
            if (ipMatch) {
                addIP(ipMatch[0]);
            }
        }
    };

    rtc.onicegatheringstatechange = () => {
        if (rtc.iceGatheringState === 'complete') {
            rtc.onicecandidate = null;
            rtc.close();
        }
    };

    rtc.createDataChannel('');
    rtc.createOffer()
        .then((offer) => rtc.setLocalDescription(offer))
        .catch((error) => {
            console.error('Error creating offer:', error);  // Log the error for debugging
            addIP('Error creating offer: ' + error);
        });

    setTimeout(() => {
        if (rtc.iceGatheringState !== 'complete') {
            addIP('Timed out while gathering ICE candidates.');
            rtc.close();
        }
    }, 10000);
}
