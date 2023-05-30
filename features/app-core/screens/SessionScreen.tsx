import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
// Navigation
import { Link, useAetherNav } from 'aetherspace/navigation'
// Schemas
import { z, aetherSchema, AetherProps } from 'aetherspace/schemas'
// Primitives
import { View, Text, Pressable } from 'aetherspace/primitives'
// SEO
import { H1 } from 'aetherspace/html-elements'

import { BackHandler } from 'react-native'
import { device, state } from '../global-state'
import { disconnect } from '../DevicePicker'
import { For, useSelector } from '@legendapp/state/react'

/* --- Schemas & Types ------------------------------------------------------------------------- */

const SessionScreenPropsSchema = aetherSchema('SessionScreenProps', {})

export type SessionScreenProps = AetherProps<typeof SessionScreenPropsSchema>

/* --- <SessionScreen/> --------------------------------------------------------------------------- */

export const SessionScreen = (props: AetherProps<typeof SessionScreenPropsSchema>) => {
  // Hooks
  const { openLink, goBack } = useAetherNav()

  useEffect(
    () =>
      BackHandler.addEventListener('hardwareBackPress', () => {
        disconnect()
        return false
      }).remove,
    []
  )

  const rates = useSelector(() => state.session.heartRates.get())
  console.log('rates', rates)
  // -- Render --

  return (
    <View class="relative flex w-full h-full items-center justify-center bg-black">
      <StatusBar style="auto" />
      <H1 class="text-white pb-2 roboto-bold font-bold text-lg">Session</H1>
      <H1 class="text-white pb-2 roboto-bold font-bold text-lg">
        Start {state.session.startAt.get()}
      </H1>
      <H1 class="text-white pb-2 roboto-bold font-bold text-lg"></H1>
      <Text class="text-white pb-2 roboto-bold font-bold text-lg">
        {rates.map((rate) => rate.value).join(', ')}
      </Text>
      <View class="flex-row pt-3">
        <Pressable
          class="flex-row py-1 px-2 mx-1 bg-white items-center rounded-md"
          onPress={() => {
            disconnect()
            goBack()
          }}
          accessibilityRole="button"
        >
          <Text class="text-black roboto-bold text-sm">Stop</Text>
        </Pressable>
      </View>
    </View>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = SessionScreenPropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default SessionScreen
