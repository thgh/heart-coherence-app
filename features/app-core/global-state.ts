import './global-state-persist'
import { observable } from '@legendapp/state'
import { persistObservable } from '@legendapp/state/persist'
import { BleManager, Device } from 'react-native-ble-plx'

export interface Session {
  startAt: string
  endAt?: string
  score: number
  rates: { at: number; rate: number }[]
}

export const manager = observable(null as null | BleManager)

export const device = observable({
  web: null as null | Device,
  native: null as null | Device,
  /** Indicates if autoconnect has run in this pageload */
  hasAutoConnected: false,
})

export const state = observable({
  /** Latest connected device uuid that will connect automatically */
  deviceUuid: '',
  /** Preference that indicates that app should connect immediately to whatever device */
  autoConnect: false,
  session: null as null | Session,
  /** Sorted */
  sessions: [] as Session[],
})

persistObservable(state, { local: 'store' })
