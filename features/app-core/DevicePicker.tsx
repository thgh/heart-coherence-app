import { Text, View } from 'aetherspace/primitives'
import React, { useEffect, useState, createContext, useRef, useCallback } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { BleManager, Device, UUID } from 'react-native-ble-plx'
import useEvent from './hooks/useEvent'
import { device, manager, state } from './global-state'

import { requestMultiple, PERMISSIONS, checkMultiple } from 'react-native-permissions'
import { ScanCallbackType } from 'react-native-ble-plx'

const HEART_RATE: UUID = '0000180d-0000-1000-8000-00805f9b34fb'
const HEART_RATE_MEASUREMENT: UUID = '00002a37-0000-1000-8000-00805f9b34fb'
const graphItems = 30

export function DevicePicker() {
  const { devices, permission, scan } = useBluetoothDevice()

  if (devices.size === 1) {
    const suggestion = devices.values().next().value
    return (
      <View className="px-6">
        <Text className="text-gray-500 text-lg pb-4">Suggestion</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Allow bluetooth"
          onPress={async () => {
            await suggestion.connect()
            device.native.set(suggestion)
          }}
          style={styles.pressable}
        >
          <Text
            className="text-white opacity-80 text-3xl pb-4 "
            style={{ fontFamily: 'monospace' }}
          >
            {suggestion.name}
          </Text>
          <Text className="text-white text-lg tracking-wide uppercase font-medium text-right">
            Continue
          </Text>
        </Pressable>
      </View>
    )
  }

  if (devices.size) {
    return (
      <View className="px-6">
        <Text className="text-white">Choose your device to connect to</Text>
        {Array.from(devices).map((suggestion) => (
          <View key={suggestion.id}>
            <Text className="text-white">{suggestion.name}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Allow bluetooth"
              onPress={async () => {
                await suggestion.connect()
                device.native.set(suggestion)
              }}
              style={styles.pressable}
            >
              <Text
                className="text-white opacity-80 text-3xl pb-4 "
                style={{ fontFamily: 'monospace' }}
              >
                {suggestion.name}
              </Text>
              <Text className="text-white text-lg tracking-wide uppercase font-medium text-right">
                Connect
              </Text>
            </Pressable>
          </View>
        ))}
        <Pressable accessibilityRole="button" accessibilityHint="Allow bluetooth" onPress={scan}>
          <Text className="text-white">Let&apos;s go</Text>
        </Pressable>

        <Text className="text-gray-500 text-lg pb-4">Suggestion</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Allow bluetooth"
          onPress={scan}
          style={styles.pressable}
        >
          <Text
            className="text-white opacity-80 text-3xl pb-4 "
            style={{ fontFamily: 'monospace' }}
          >
            {suggestion.name}
          </Text>
          <Text className="text-white text-lg tracking-wide uppercase font-medium text-right">
            Continue
          </Text>
        </Pressable>
      </View>
    )
  }

  if (permission === 'denied') {
    return (
      <View className="px-6">
        <Text className="text-white">Bluetooth access required!</Text>
        <Pressable accessibilityRole="button" accessibilityHint="Allow bluetooth" onPress={scan}>
          <Text className="text-white">Let&apos;s go</Text>
        </Pressable>
      </View>
    )
  }
  return (
    <View className="px-6">
      <Text className="text-white">DevicePicker {permission}</Text>
    </View>
  )
}

export interface IBleContext {
  manager: BleManager
  scanning: 'scanning' | 'init' | 'reading' | 'permissions' | 'stopped'
  setScanning: (scanning: 'scanning' | 'init' | 'reading' | 'permissions' | 'stopped') => void
  device: { current: Device }
  setDevice: (device: Device) => void
  rr: { current: number[] }
  heart: { current: { rate: number; at: number }[] }
}

export const BleContext = createContext<IBleContext | null>(null)

export default function useBluetoothDevice() {
  const [permission, setPermission] = useState('init')
  const [devices, setDevices] = useState(() => new Set<Device>())
  const [ignore, setIgnore] = useState(() => new Set<string>())

  // device.

  const [scanning, setScanning] = useState<IBleContext['scanning']>('init')
  const dev = useRef<Device | null>(null)
  const heart = useRef<{ at: number; rate: number }[]>([])
  const rr = useRef<number[]>([])
  const [, boo] = useState(false)
  const render = useCallback(() => boo((a) => !a), [])
  const disconnected = useEvent(async (error: any, device: Device) => {
    if (dev.current?.id === device.id) {
      dev.current = null
    }
    render()
  })
  const setDevice = useEvent(async (device: Device) => {
    if (device)
      console.log(
        'ble setDevice',
        device.name,
        device.id,
        device.localName,
        device.manufacturerData,
        device.native.serviceData
      )
    if (!device && (await dev.current?.isConnected)) {
      console.log('disconnecting', dev.current.id, dev.current.name)
      dev.current.cancelConnection().then(() => {
        setScanning('stopped')
      })
    } else if (!device) {
      setScanning('stopped')
    }
    dev.current = device
    render()

    if (!device) {
      return
    }

    console.log('connecting...')
    dev.current = device = await device.connect({ autoConnect: false })
    render()
    console.log('connected...')

    device.onDisconnected(disconnected)

    dev.current = device = await device.discoverAllServicesAndCharacteristics()

    device.monitorCharacteristicForService(HEART_RATE, HEART_RATE_MEASUREMENT, (error, char) => {
      if (!char) return console.log('char err', error)

      const buffer = Buffer.from(char.value, 'base64')
      const bytes = new Uint8Array(buffer.toJSON().data)
      console.log('hear', char.value, bytes, bytes[1])
      const now = Date.now()
      heart.current.push({ at: now, rate: bytes[1] })
      for (let index = 2; index < bytes.length; index += 2) {
        const ms = bytes[index + 1] * 256 + bytes[index]
        rr.current.push(ms)
      }
      render()
    })
  })

  const considerDevice = useEvent((dev: Device) => {
    if (device.current) return
    if (!dev.name?.startsWith('HRM')) return
    manager.stopDeviceScan()
    setScanning('reading')
    setDevice(dev)
  })

  const scan = async () => {
    if (device.peek()) return console.log('no scan, already connected')

    if (!manager.peek()) {
      manager.set(new BleManager())
    }

    console.log('permissions')
    const permissions = await requestMultiple([
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ])
    console.log('permissions', permissions)

    const managerr = manager.peek()!

    const subscription = managerr.onStateChange(async (state) => {
      console.log('ble state change', state)
      if (state === 'PoweredOn') {
        console.log('ble start scan')
        setScanning('scanning')
        managerr.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
          if (error) {
            // Handle error (scanning will be stopped automatically)
            console.log('ble error', error, [
              // @ts-expect-error
              error.cause,
              error.reason,
              error.errorCode,
              error.attErrorCode,
              error.androidErrorCode,
              error.message,
            ])
            return
          }
          if (!device) return

          const key = device.id + '-' + device.name
          if (ignore.has(key)) return
          ignore.add(key)
          if (device.serviceUUIDs?.includes(HEART_RATE) && !devices.has(device)) {
            console.log('device', device?.id, device.name, device.native.serviceUUIDs)
            devices.add(device)
            setDevices(new Set(devices))
          }
        })
        subscription.remove()
      }
    }, true)
  }
  const stop = () => {
    console.log('stopscan')
    manager.stopDeviceScan()
    setDevice(null)
  }

  useEffect(() => {
    ;(async () => {
      const result = await checkMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ])
      if (
        result['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
        result['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
        result['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
      ) {
        setPermission('granted')
        scan()
      } else if (
        result['android.permission.BLUETOOTH_SCAN'] === 'blocked' ||
        result['android.permission.BLUETOOTH_CONNECT'] === 'blocked' ||
        result['android.permission.ACCESS_FINE_LOCATION'] === 'blocked' ||
        result['android.permission.BLUETOOTH_SCAN'] === 'limited' ||
        result['android.permission.BLUETOOTH_CONNECT'] === 'limited' ||
        result['android.permission.ACCESS_FINE_LOCATION'] === 'limited'
      ) {
        setPermission('blocked')
      } else {
        setPermission('denied')
      }
    })()
  }, [])

  return {
    devices,
    permission,
    scan,
    stop,
    scanning,
    // device: device.current,
    heart,
    rr,
  }
}

const styles = {
  pressable: ({ pressed }) => ({
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 32,
    backgroundColor: pressed ? '#4B5563' : 'rgb(71, 85, 105)',
    borderRadius: 12,
    opacity: pressed ? 0.5 : 1,
  }),
}
