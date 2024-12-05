import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { TchatService } from './services/tchatService.service';
import { BehaviorSubject } from 'rxjs'; 
import { Offer } from './interfaces/Offer';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  // private socket: Socket; // Socket pour la communication en temps réel
  private peerConnection: RTCPeerConnection | null = null; // Connexion WebRTC
  private localStream: MediaStream | undefined; // Flux vidéo/audio local
  private remoteStream: MediaStream | undefined; // Flux vidéo/audio distant
  public offers: RTCSessionDescriptionInit[] = [];
  private audioContext: AudioContext | undefined;
  private analyser: AnalyserNode | undefined;
  private dataArray: Uint8Array | undefined;
  public audioStrength: number = 0;
  private animationFrameId: number | undefined;
  private dataChannel: RTCDataChannel | undefined;

  private audioStrengthSubject = new BehaviorSubject<number>(0); 

  public audioStrength$ = this.audioStrengthSubject.asObservable();

  constructor(private socketService: TchatService) {
    // Initialisation de la connexion Socket.IO
    this.socketService.disconnect();
    this.socketService.connection();
    this.createPeerConnection();
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    this.peerConnection.ondatachannel = (event) => {
      const receivedDataChannel = event.channel;
      this.setupDataChannel(receivedDataChannel);
    };

    this.createDataChannel();

    // Gestion des candidats ICE
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketService.emitCandidate(event.candidate);
        // this.socket.emit('candidate', event.candidate); // Envoi des candidats ICE au serveur
      }
    };

    // Gestion des flux entrants (pistes média)
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };

    // Réception d'une offre WebRTC
    this.socketService.onOffer((offer)=> {
      this.offers.push(offer);
    }) 

    
    // this.socket.on('offer', async (offer) => {
    //   this.offers.push(offer);
    //   // await this.answerOffer(offer); // Uncomment this line if you want to handle the offer immediately
    // });

    // Réception d'une réponse WebRTC

    this.socketService.onAnswer(async (answer)=>{
      await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer))
    })
    // this.socket.on('answer', async (answer) => {
    //   await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
    // });

    // Réception d'un candidat ICE
    this.socketService.onCandidate(async (candidate) => {
      await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
    })

    // this.socket.on('candidate', async (candidate) => {
    //   await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
    // });
  }

  private createDataChannel() {
    if (this.peerConnection) {
      this.dataChannel = this.peerConnection.createDataChannel('audioDataChannel');
      this.setupDataChannel(this.dataChannel);
    }
  }

  private setupDataChannel(dataChannel: RTCDataChannel | undefined) {
    if (dataChannel) {
      dataChannel.onopen = () => {
        console.log('Data channel is open');
      };

      dataChannel.onmessage = (event) => {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);
        console.log('Received audio strength data:', data.audioStrength);
        this.audioStrengthSubject.next(data.audioStrength);
      };
    }
  }

  // Démarre le flux vidéo/audio local
  async startLocalStream(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, this.localStream!); // Ajout des pistes à la connexion WebRTC
    });

    if (this.localStream) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      const audioSource = this.audioContext.createMediaStreamSource(this.localStream);
      audioSource.connect(this.analyser);
      
      this.analyser.fftSize = 2048;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.updateAudioStrength();
    }

    return this.localStream;
  }

  private updateAudioStrength(): void {
    if (!this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    const sum = this.dataArray.reduce((a, b) => a + b, 0);
    this.audioStrength = sum / this.dataArray.length;

    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({ audioStrength: this.audioStrength }));
    }

    this.animationFrameId = requestAnimationFrame(() => this.updateAudioStrength());
  }

  async createOffer(): Promise<void> {
    const offer = await this.peerConnection?.createOffer();
    await this.peerConnection?.setLocalDescription(offer);
    this.socketService.emitOffer(offer!)
    // this.socket.emit('offer', offer); // Envoi de l'offre au serveur
  }

  getPeerConnection(): RTCPeerConnection {
    return this.peerConnection!;
  }

  async answerOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection?.createAnswer();
      await this.peerConnection?.setLocalDescription(answer);
      this.socketService.emitAnswer(answer);
      // this.socket.emit('answer', answer); // Envoi de la réponse au serveur
    } catch (error) {
      console.error('Error answering offer:', error);
    }
  }

  closeConnection() {
    this.peerConnection?.close();
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
