import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class TchatService {
  private readonly URL: string = 'https://192.168.10.113:3000';
  private socket: Socket | null = null;
  public socketId: string = '';
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private offerOn = false;
  private userName: string = '';

  peerConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302'
        ]
      }
    ]
  };

  connection() {
    if (this.socket) throw "Already connected";

    this.socket = io(this.URL);
    this.socket.on('your id', (id: string) => {
      this.socketId = id;
      console.log('My socket ID:', this.socketId);
    });
    this.socket.on('disconnect', (reason: string) => {
      this.socket = null;
      console.log('Disconnected:', reason);
    });

    // Register new socket event listeners
    this.socket.on('availableOffers', (offers) => {
      console.log(offers);
      this.createOfferEls(offers);
    });

    this.socket.on('newOfferAwaiting', (offers) => {
      this.createOfferEls(offers);
    });

    this.socket.on('answerResponse', (offerObj) => {
      console.log(offerObj);
      this.addAnswer(offerObj);
    });

    this.socket.on('receivedIceCandidateFromServer', (iceCandidate) => {
      this.addNewIceCandidate(iceCandidate);
      console.log(iceCandidate);
    });
  }

  private getSocketId(): string | null {
    return this.socketId;
  }

  setName(name: string, callback: (response: { status: string, message: string }) => void): void {
    this.socket?.emit('getName', name, callback);
  }

  joinRoom(room: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('join room', room, (response: { status: string, message: string }) => {
        if (response.status === "1") {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  }

  leaveRoom(room: string, callback: (response: { status: string, message: string }) => void): void {
    this.socket?.emit('leave room', room, callback);
  }

  sendMessage(room: string, msg: string, idSender: string, IDs: string[]): void {
    this.socket?.emit('chat message', { room, msg, idSender, IDs });
  }

  onMessage(callback: (data: { room: string, name: string, msg: string, idSender: string, IDs: string[] }) => void): void {
    this.socket?.on('chat message', callback);
  }

  onConnectedSockets(callback: (names: { id: string, name: string }[]) => void): void {
    this.socket?.on('connectedUsers', callback);
  }

  onUserDisconnected(callback: (userId: string) => void): void {
    this.socket?.on('userDisconnected', callback);
  }

  disconnect(): void {
    this.socket?.disconnect();
  }

  onWebcam(callback: (data: Blob) => void): void {
    this.socket?.on('videoStream', callback);
  }

  sendVideoStream(data: Blob): void {
    this.socket?.emit('videoStream', data);
  }

  emitWithAck(offerObj: any): Promise<RTCIceCandidateInit[]> {
    return new Promise<RTCIceCandidateInit[]>((resolve, reject) => {
      this.socket?.emit('newAnswer', offerObj, (response: RTCIceCandidateInit[]) => {
        resolve(response);
      });
    });
  }

  sendIceCandidate(candidateObj: { iceCandidate: any, iceUserName: any, didIOffer: any }): void {
    this.socket?.emit('sendIceCandidateToSignalingServer', candidateObj);
  }

  // Methods to handle the new socket events
  private createOfferEls(offers: any[]): void {
    const answerEl = document.querySelector('#answer');
    if (answerEl) {
      offers.forEach(o => {
        const newOfferEl = document.createElement('div');
        newOfferEl.innerHTML = `<button class="btn btn-success col-1">Answer ${o.offererUserName}</button>`;
        newOfferEl.addEventListener('click', () => this.answerOffer(o));
        answerEl.appendChild(newOfferEl);
      });
    }
  }

  private addAnswer(offerObj: any): void {
    // Handle adding an answer (you need to implement this)
  }

  private addNewIceCandidate(iceCandidate: any): void {
    this.peerConnection?.addIceCandidate(iceCandidate);
    console.log("======Added Ice Candidate======");
  }

  async answerOffer(offerObj: any): Promise<void> {
    await this.startWebcam();
    const peerConnection = await this.createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    offerObj.answer = answer;
    const offerIceCandidates:RTCIceCandidateInit[] = await this.emitWithAck(offerObj);
    offerIceCandidates.forEach((candidate) => {
      peerConnection.addIceCandidate(candidate);
      console.log("======Added Ice Candidate======");
    });
  }

  public createPeerConnection(offerObj?: any): Promise<RTCPeerConnection> {
    return new Promise(async (resolve, reject) => {
      this.peerConnection = new RTCPeerConnection(this.peerConfiguration);
      this.remoteStream = new MediaStream();

      this.localStream!.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      this.peerConnection.addEventListener("signalingstatechange", (event: Event) => {
        console.log(event);
        console.log(this.peerConnection!.signalingState);
      });

      this.peerConnection.addEventListener('icecandidate', (e: RTCPeerConnectionIceEvent) => {
        if (e.candidate) {
          this.sendIceCandidate({
            iceCandidate: e.candidate,
            iceUserName: this.userName,
            didIOffer: this.offerOn,
          });
        }
      });

      this.peerConnection.addEventListener('track', (e: RTCTrackEvent) => {
        e.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
          this.remoteStream!.addTrack(track);
        });
      });

      if (offerObj) {
        await this.peerConnection.setRemoteDescription(offerObj.offer);
      }
      resolve(this.peerConnection);
    });
  }

  public async startWebcam(): Promise<MediaStream> {
    // You should implement this to start the webcam and return the stream
    // This is just a placeholder for the webcam start logic
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localStream = stream;
    return stream;
  }
}
