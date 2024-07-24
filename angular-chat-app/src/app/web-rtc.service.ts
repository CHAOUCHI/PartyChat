import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { TchatService } from './services/tchatService.service';
import { Offer } from './interfaces/Offer';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  private socket: Socket; // Socket pour la communication en temps réel
  private peerConnection: RTCPeerConnection | null = null; // Connexion WebRTC
  private localStream: MediaStream | undefined; // Flux vidéo/audio local
  private remoteStream: MediaStream | undefined; // Flux vidéo/audio distant
  public offers: RTCSessionDescriptionInit[] = [];

  constructor(private socketService: TchatService) {
    // Initialisation de la connexion Socket.IO
    this.socket = io('https://192.168.10.113:3000');

    // Configuration des serveurs STUN pour WebRTC
    this.createPeerConnection()
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Gestion des candidats ICE
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('candidate', event.candidate); // Envoi des candidats ICE au serveur
      }
    };

    // Gestion des flux entrants (pistes média)
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };

    // Réception d'une offre WebRTC
    this.socket.on('offer', async (offer) => {
      this.offers.push(offer)
      // await this.answerOffer(offer); // Uncomment this line if you want to handle the offer immediately
    });

    // Réception d'une réponse WebRTC
    this.socket.on('answer', async (answer) => {

      await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Réception d'un candidat ICE
    this.socket.on('candidate', async (candidate) => {
      await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }

  // Démarre le flux vidéo/audio local
  async startLocalStream(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    this.localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, this.localStream!); // Ajout des pistes à la connexion WebRTC
    });
    return this.localStream;
  }

  // Crée et envoie une offre WebRTC
  async createOffer(): Promise<void> {
    const offer = await this.peerConnection?.createOffer();
    await this.peerConnection?.setLocalDescription(offer);
    this.socket.emit('offer', offer); // Envoi de l'offre au serveur
  }

  // Retourne la connexion WebRTC
  getPeerConnection(): RTCPeerConnection {
    return this.peerConnection!;
  }

  // Répond à une offre WebRTC
  async answerOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection?.createAnswer();
      await this.peerConnection?.setLocalDescription(answer);
      this.socket.emit('answer', answer); // Envoi de la réponse au serveur
    } catch (error) {
      console.error('Error answering offer:', error);
    }
  }

  closeConnection() {
    this.peerConnection?.close()
  }
}
