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
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BackHandler, ScrollView, useWindowDimensions } from 'react-native'
import { device, state } from '../global-state'
import { disconnect } from '../DevicePicker'
import { For, useSelector } from '@legendapp/state/react'

/* --- Schemas & Types ------------------------------------------------------------------------- */

const SessionScreenPropsSchema = aetherSchema('SessionScreenProps', {})

export type SessionScreenProps = AetherProps<typeof SessionScreenPropsSchema>

/* --- <SessionScreen/> --------------------------------------------------------------------------- */

const graphItems = 30
const height = 300
export const SessionScreen = (props: AetherProps<typeof SessionScreenPropsSchema>) => {
  // Hooks
  const { openLink, goBack } = useAetherNav()
  const { width } = useWindowDimensions()

  useEffect(
    () =>
      BackHandler.addEventListener('hardwareBackPress', () => {
        disconnect()
        return false
      }).remove,
    []
  )

  const rates = useSelector(() => state.session.heartRates.get())
  const intervals = rates.flatMap((rate) => rate.intervals)
  const safe = useSafeAreaInsets()
  // -- Render --

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingTop: safe.top }}>
      <View class="relative flex w-full h-full items-center justify-center bg-black">
        <StatusBar style="auto" />
        <H1 class="text-white pb-2 roboto-bold font-bold text-lg">Session</H1>
        <H1 class="text-white pb-2 roboto-bold font-bold text-lg">
          Start {state.session.startAt.get()}
        </H1>
        <H1 class="text-white pb-2 roboto-bold font-bold text-lg"></H1>
        <Text class="text-white pb-2 roboto-bold font-bold text-lg">
          {rates
            .slice(-10)
            .map((rate) => rate.value)
            .join(', ')}
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

        <View
          style={{
            backgroundColor: '#222',
            width,
            height,
            flexDirection: 'row',
          }}
        >
          {intervals.slice(-graphItems - 1).map((rr, key, array) => {
            const prev = array[key - 1]
            const slope = rr - prev
            const up = slope > 0
            const abs = Math.abs(slope)

            const bar = Math.min(height / 2, abs)
            const upBar = up ? bar : 0
            const color = '#ccc'

            return prev ? (
              <View
                key={key}
                style={{
                  marginTop: height / 2 - upBar,
                  height: bar,
                  width: (100 / graphItems).toPrecision(5) + '%',
                  backgroundColor: color,
                }}
              />
            ) : null
          })}
        </View>
      </View>
    </ScrollView>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = SessionScreenPropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default SessionScreen
