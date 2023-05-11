import { useContext } from 'react'
import { Device } from 'react-native-ble-plx'
import { requestMultiple, PERMISSIONS } from 'react-native-permissions'
import { BleContext } from './BleContext'
import useEvent from './useEvent'

export default function useFirstHRM() {
  const { manager, scanning, setScanning, device, setDevice, heart, rr } =
    useContext(BleContext)

  const considerDevice = useEvent((dev: Device) => {
    if (device.current) return
    if (!dev.name?.startsWith('HRM')) return
    manager.stopDeviceScan()
    setScanning('reading')
    setDevice(dev)
  })

  const scan = async () => {
    if (device.current) return console.log('no scan, already connected')

    console.log('permissions')
    const permissions = await requestMultiple([
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ])
    console.log('permissions', permissions)

    const subscription = manager.onStateChange((state) => {
      console.log('ble state change', state)
      if (state === 'PoweredOn') {
        console.log('ble start scan')

        setScanning('scanning')
        manager.startDeviceScan(
          // ['0x180D'],
          null,
          { scanMode: 0, allowDuplicates: false },
          (error, device) => {
            if (error) {
              // Handle error (scanning will be stopped automatically)
              console.log('ble error', error, [
                error.cause,
                error.reason,
                error.errorCode,
                error.attErrorCode,
                error.androidErrorCode,
                error.message,
              ])
              return
            }
            considerDevice(device)
          }
        )
        subscription.remove()
      }
    }, true)
  }

  const stop = () => {
    console.log('stopscan')
    manager.stopDeviceScan()
    setDevice(null)
  }
  return {
    scan,
    stop,
    scanning,
    device: device.current,
    heart,
    rr,
  }
}
