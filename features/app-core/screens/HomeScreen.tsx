import React from 'react'
import { useWindowDimensions, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
// Navigation
import { Link, useAetherNav } from 'aetherspace/navigation'
// Schemas
import { z, aetherSchema, AetherProps } from 'aetherspace/schemas'
// Primitives
import { View, Text, Pressable } from 'aetherspace/primitives'
// SEO
import { H1 } from 'aetherspace/html-elements'
// Components
import { DevicePicker } from '../DevicePicker'
import ReportsList from '../ReportsList'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/* --- Schemas & Types ------------------------------------------------------------------------- */

const HomeScreenPropsSchema = aetherSchema('HomeScreenProps', {})

export type HomeScreenProps = AetherProps<typeof HomeScreenPropsSchema>

/* --- <HomeScreen/> --------------------------------------------------------------------------- */

export const HomeScreen = (props: AetherProps<typeof HomeScreenPropsSchema>) => {
  // Hooks
  const { openLink } = useAetherNav()
  const { height } = useWindowDimensions()
  // const { top, bottom } = useSafeAreaInsets()

  // -- Render --

  return (
    <ScrollView /* contentContainerStyle={{ paddingTop: top }} */>
      <StatusBar style="light" translucent />
      <View className="py-12 bg-black">
        <View className="justify-center" /* style={{ height: height - top - 200 }}*/>
          <DevicePicker />
        </View>

        <ReportsList />
      </View>
    </ScrollView>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = HomeScreenPropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen
