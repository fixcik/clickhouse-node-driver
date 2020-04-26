export default class Packet<S> {
  stream: S
  constructor (stream: S) {
    this.stream = stream
  }
}
