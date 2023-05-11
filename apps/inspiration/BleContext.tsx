import { BleManager, Device } from 'react-native-ble-plx'
import { createContext } from 'react'

export interface IBleContext {
  manager: BleManager
  scanning: 'scanning' | 'init' | 'reading' | 'permissions' | 'stopped'
  setScanning: (
    scanning: 'scanning' | 'init' | 'reading' | 'permissions' | 'stopped'
  ) => void
  device: { current: Device }
  setDevice: (device: Device) => void
  rr: { current: number[] }
  heart: { current: { rate: number; at: number }[] }
}

export const BleContext = createContext<IBleContext | null>(null)
