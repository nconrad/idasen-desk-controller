const serviceID = '99fa0001-338a-1024-8a49-009c0215f78a'
const characteristicID = '99fa0002-338a-1024-8a49-009c0215f78a'

export default class Desk {

  constructor() {
    this.device = null
    this.service = null
    this.onDisconnected = this.onDisconnected.bind(this)
  }

  async request() {
    const options = {
      optionalServices: [
        serviceID
      ],
      filters: [{
        namePrefix: 'Desk'
      }]
    }
    return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device
        this.device.addEventListener('gattserverdisconnected', this.onDisconnected)
      })
  }

  async connect() {
    if (!this.device) throw 'Device is not connected.'

    const server = await this.device.gatt.connect()
    this.service = await server.getPrimaryService(serviceID)
  }

  disconnect() {
    if (!this.device) {
      return Promise.reject('Device is not connected.')
    }
    return this.device.gatt.disconnect()
  }

  onDisconnected() {
    console.log('Device is disconnected.')
  }

  async moveUp() {
    this.sendCmd('4700')
  }

  async moveDown() {
    this.sendCmd('4600')
  }

  async _stop() {
    this.sendCmd('FF00')
  }

  async sendCmd(cmd) {
    const char = await this.service.getCharacteristic(characteristicID)
    await char.writeValue(hexStrToArray(cmd))
  }
}


function hexStrToArray(hexString) {
  let decimals = []
  for (let i = 0; i < hexString.length; i += 2) {
    decimals.push(parseInt(hexString.substr(i, 2), 16))
  }
  return new Uint8Array(decimals)
}