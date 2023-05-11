import React from 'react'
import useBluetoothDevice from './hooks/useBluetoothDevice.web'
import { View, Text } from 'aetherspace/primitives'
import { state } from './global-state'

export function DevicePicker() {
  const {
    requestDevice,
    device,
    error,
  } = useBluetoothDevice()

  console.log({
    device: device.web?.get()?.name,
  })

  return (
    <View className="w-full mb-4 items-center">
      <Text className="text-white" onPress={requestDevice}>DevicePicker</Text>
    </View>
  )
}
