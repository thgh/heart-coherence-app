import React from 'react'
import { StatusBar } from 'expo-status-bar'
// Navigation
import { Link, fetchAetherProps, useAetherNav, useAetherRoute } from 'aetherspace/navigation'
// Schemas
import { z, aetherSchema, AetherProps } from 'aetherspace/schemas'
// Primitives
import { View, Text, Pressable } from 'aetherspace/primitives'
// SEO
import { H1 } from 'aetherspace/html-elements'
import { DevicePicker } from '../DevicePicker'

/* --- Schemas & Types ------------------------------------------------------------------------- */

const HomePropsSchema = aetherSchema('HomeScreenProps', {})

const HomeParamsSchema = aetherSchema('HomeScreenParams', {})

export type HomeScreenProps = AetherProps<typeof HomePropsSchema>
export type HomeScreenParams = AetherProps<typeof HomeParamsSchema>

/* --- <HomeScreen/> --------------------------------------------------------------------------- */

export const HomeScreen = (props: AetherProps<typeof HomePropsSchema>) => {
  // Hooks
  const { openLink } = useAetherNav()

  // -- Render --

  return (
    <View class="relative flex w-full h-full items-center justify-center bg-black">
      <StatusBar style="auto" />
      <H1 class="text-white pb-2 roboto-bold font-bold text-lg">Bluetooth Hackathon</H1>
      <Text class="md:w-2/3 lg:w-1/2 pt-5 pb-3 px-4 text-center text-sm text-white">...</Text>
      <View class="flex-row pt-3">
        <Pressable
          class="flex-row py-1 px-2 mx-1 bg-white items-center rounded-md"
          onPress={() => openLink('/session')}
          accessibilityRole="button"
        >
          <Text class="text-black roboto-bold text-sm">Enable Bluetooth</Text>
        </Pressable>
      </View>
      <Link
        href="https://github.com/thgh/heart-coherence-app#getting-started-%EF%B8%8F"
        class="roboto-bold pt-5 text-center text-sm text-black"
      >
        Github Repo
      </Link>
      <DevicePicker />
    </View>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = HomePropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen
