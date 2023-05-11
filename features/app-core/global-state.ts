import './global-state-persist'
import { observable } from '@legendapp/state'
import { persistObservable } from '@legendapp/state/persist'

const obs = observable({
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

persistObservable(obs, { local: 'store' })
