import { configureObservablePersistence } from '@legendapp/state/persist'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'

// Global configuration
configureObservablePersistence({
  persistLocal: ObservablePersistLocalStorage,
})
