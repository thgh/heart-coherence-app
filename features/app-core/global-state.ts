import './global-state-persist'
import { observable } from '@legendapp/state'
import { persistObservable } from '@legendapp/state/persist'
import { BleManager, Device } from 'react-native-ble-plx'

export const manager = observable(null as null | BleManager)

export const device = observable(null as null | Device)

export const state = observable({
  /** Latest connected device uuid that will connect automatically */
  deviceUuid: '',
  automaticStart: true,
  /** Sorted */
  reports: [] as {
    startAt: string
    endAt: string
    score: number
    rates: number[]
  }[],
})

persistObservable(state, { local: 'store' })
