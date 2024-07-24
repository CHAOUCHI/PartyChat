import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { WebcamService } from '../services/webcam.service';
import { TchatService } from '../services/tchatService.service';
import { AuthService } from '../services/authService.service';
import { WebRTCService } from '../web-rtc.service';
import { Offer } from '../interfaces/Offer';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.css']
})
export class WebcamComponent implements OnInit{
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>; // Référence à l'élément vidéo local
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>; // Référence à l'élément vidéo distant
  public inCall: boolean = false;

  constructor(public webRTCService: WebRTCService) {}

  async ngOnInit() {
    const localStream = await this.webRTCService.startLocalStream();
    this.localVideo.nativeElement.srcObject = localStream; // Affecte le flux local à l'élément vidéo local

    // Gestion des flux distants
    this.webRTCService.getPeerConnection().ontrack = (event: RTCTrackEvent) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0]; // Affecte le flux distant à l'élément vidéo distant
    };
  }

  async call() {
    await this.webRTCService.createOffer(); // Initie l'appel en créant et envoyant une offre
  }

  answerOffer(offer: RTCSessionDescriptionInit) {
    this.inCall = true
    this.webRTCService.answerOffer(offer)
  }

  async leave(){
    this.inCall = false
    await this.webRTCService.closeConnection()
    await this.webRTCService.createPeerConnection()
  }
}
