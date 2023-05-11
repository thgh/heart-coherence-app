import React from 'react'
import { useWindowDimensions, ScrollView } from 'react-native'
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

  const { height } = useWindowDimensions()
  const { top, bottom } = useSafeAreaInsets()

  return (
    <ScrollView contentContainerStyle={{ paddingTop: top }}>
      <StatusBar style="light" translucent />
      <View className="py-12">
        <View className="justify-center" style={{ height: height - top - 200 }}>
          <DevicePicker />
        </View>

        <ReportsList />
      </View>
    </ScrollView>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = HomePropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen
