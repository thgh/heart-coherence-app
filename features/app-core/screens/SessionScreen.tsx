import React from 'react'
import { StatusBar } from 'expo-status-bar'
// Navigation
import { Link, useAetherNav } from 'aetherspace/navigation'
// Schemas
import { z, aetherSchema, AetherProps } from 'aetherspace/schemas'
// Primitives
import { View, Text, Pressable } from 'aetherspace/primitives'
// SEO
import { H1 } from 'aetherspace/html-elements'

/* --- Schemas & Types ------------------------------------------------------------------------- */

const SessionScreenPropsSchema = aetherSchema('SessionScreenProps', {})

export type SessionScreenProps = AetherProps<typeof SessionScreenPropsSchema>

/* --- <SessionScreen/> --------------------------------------------------------------------------- */

export const SessionScreen = (props: AetherProps<typeof SessionScreenPropsSchema>) => {
  // Hooks
  const { openLink } = useAetherNav()

  // -- Render --

  return (
    <View class="relative flex w-full h-full items-center justify-center bg-black">
      <StatusBar style="auto" />
      <H1 class="text-white pb-2 roboto-bold font-bold text-lg">Session</H1>
      <View class="flex-row pt-3">
        <Pressable
          class="flex-row py-1 px-2 mx-1 bg-white items-center rounded-md"
          onPress={() => openLink('/report')}
          accessibilityRole="button"
        >
          <Text class="text-black roboto-bold text-sm">Start</Text>
        </Pressable>
      </View>
    </View>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = SessionScreenPropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default SessionScreen
