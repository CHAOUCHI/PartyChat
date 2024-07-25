import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { WebRTCService } from '../web-rtc.service';
import { Subscription } from 'rxjs';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-webcam',
  standalone: true,
  imports: [NgClass, NgStyle],
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.css']
})
export class WebcamComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>; // Référence à l'élément vidéo local
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>; // Référence à l'élément vidéo distant
  public inCall: boolean = false;
  public audioStrength: number = 0; 
  public remoteAudioStrength: number = 0;
  private audioStrengthSubscription!: Subscription;

  constructor(public webRTCService: WebRTCService) {}

  async ngOnInit() {
    const localStream = await this.webRTCService.startLocalStream();
    this.localVideo.nativeElement.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); // Affecte le flux local à l'élément vidéo local

    // Gestion des flux distants
    this.webRTCService.getPeerConnection().ontrack = (event: RTCTrackEvent) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0]; // Affecte le flux distant à l'élément vidéo distant

      this.audioStrengthSubscription = this.webRTCService.audioStrength$.subscribe(strength => {
        this.remoteAudioStrength = strength;
      });
    };

    this.updateAudioStrength();
  }

  ngOnDestroy() {
    this.webRTCService.closeConnection();
  }

  private updateAudioStrength(): void {
    this.audioStrength = this.webRTCService.audioStrength;

    setTimeout(() => this.updateAudioStrength(), 100);
  }

  async call() {
    await this.webRTCService.createOffer(); // Initie l'appel en créant et envoyant une offre
  }

  answerOffer(offer: RTCSessionDescriptionInit) {
    this.inCall = true;
    this.webRTCService.answerOffer(offer);
  }

  async leave() {
    this.inCall = false;
    await this.webRTCService.closeConnection();
    await this.webRTCService.createPeerConnection();
  }
}
