import React, { useState, useEffect } from 'react'
import { device, state } from '../global-state'
import type { Bluetooth } from '@types/web-bluetooth'

/* --- useBluetoothDevice() ------------------------------------------------------------------------------ */

const useBluetoothDevice = () => {
  // State
  const [error, setError] = useState(null)

  // -- Handlers --
  
  async function requestDevice() {
    try {
      const selectedDevice = await (navigator.bluetooth as Bluetooth).requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: [
          'battery_service',
          0x2a98,
          0x2a9d,
          0x2a9e,
          'heart_rate',
          'device_information',
        ],
      })


            // Connect to the device
            const server = await selectedDevice.gatt?.connect()
            console.log('server', server)
    
            // Get the primary service of the device
            const service = await server?.getPrimaryService('heart_rate')
            console.log('service', service)

            const char = await service?.getCharacteristic('heart_rate_measurement')
            console.log('char', char)

        char.addEventListener("data", (evt) =>
          console.log("char data", evt)
        );

        const start = Date.now()

        if (state.session.peek()) {
          console.warn('Session already exists!')
        }
        state.session.set({
          heartRates: [],
          score: 0,
          startAt: new Date().toJSON(),
        })
      
        char.oncharacteristicvaluechanged = () => {
          console.log("char value changed", char.value.getUint8(1));
          state.session.heartRates.push({
            at: Date.now() - start,
            value: char.value.getUint8(1)
          })
        };
        char.startNotifications();

            // Check for all services

      device.web.set(selectedDevice)

      setError(null)
    } catch (error) {
      setError(error)
    }
  }

  // -- Effects --

  useEffect(() => {
    // You can call functions here as you would in mounted() lifecycle hook in Vue.js
    requestDevice()
  }, [])

  // -- Return --

  return {
    device,
    error,
    requestDevice,
  }
}

/* --- Exports --------------------------------------------------------------------------------- */

export default useBluetoothDevice
