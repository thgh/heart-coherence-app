import { configureObservablePersistence } from '@legendapp/state/persist'

import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv'

// Global configuration
configureObservablePersistence({
  persistLocal: ObservablePersistMMKV,
})
