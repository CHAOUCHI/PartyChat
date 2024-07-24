import { Offer } from "./Offer";

export interface UserEntity{
    id: string,
    name: string,
    offer: Offer | null
}