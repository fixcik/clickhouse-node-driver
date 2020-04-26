export interface PacketOptions<T> {
  stream: T;
}
export default class Packet<T> {
  stream: T
  constructor ({ stream }: PacketOptions<T>) {
    this.stream = stream
  }
}
