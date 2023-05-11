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
import ReportsList from '../ReportsList'

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
    <View class="relative flex w-full h-full bg-black py-12">
      <StatusBar style="light" />
      <DevicePicker />
      <ReportsList />
    </View>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = HomePropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen
