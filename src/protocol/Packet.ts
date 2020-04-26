export default class Packet<T, S> {
  stream: S
  _data!: T
  constructor (stream: S) {
    this.stream = stream
  }

  getData (): T {
    return this._data
  }
}
