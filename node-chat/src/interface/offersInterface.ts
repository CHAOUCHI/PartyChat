export interface Offer {
    offererUserName: string ;
    offer: any; // Replace 'any' with the actual type if known (e.g., RTCSessionDescriptionInit)
    offerIceCandidates: any[]; // Replace 'any' with the actual type if known (e.g., RTCIceCandidate)
    answererUserName: string | null;
    answer: any; // Replace 'any' with the actual type if known (e.g., RTCSessionDescriptionInit)
    answererIceCandidates: any[]; // Replace 'any' with the actual type if known (e.g., RTCIceCandidate)
  }