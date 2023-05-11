import React from 'react'
import { StatusBar } from 'expo-status-bar'
// Navigation
import { Link } from 'aetherspace/navigation'
// Schemas
import { z, aetherSchema, AetherProps } from 'aetherspace/schemas'
// Primitives
import { View, Text, Pressable } from 'aetherspace/primitives'
// SEO
import { H1 } from 'aetherspace/html-elements'

/* --- Schemas & Types ------------------------------------------------------------------------- */

const HomePropsSchema = aetherSchema('ReportScreenProps', {})

const HomeParamsSchema = aetherSchema('ReportScreenParams', {})

export type ReportScreenProps = AetherProps<typeof HomePropsSchema>
export type ReportScreenParams = AetherProps<typeof HomeParamsSchema>

/* --- <ReportScreen/> --------------------------------------------------------------------------- */

export const ReportScreen = (props: AetherProps<typeof HomePropsSchema>) => {
  // -- Render --

  return (
    <View class="relative flex w-full h-full items-center justify-center bg-black">
      <StatusBar style="auto" />
      <H1 class="text-white pb-2 roboto-bold font-bold text-lg">Report</H1>
      <View class="flex-row pt-3">
        <Pressable
          class="flex-row py-1 px-2 mx-1 bg-white items-center rounded-md"
          // onPress={() => openLink(graphQLEndpoint || '/api/graphql')}
          accessibilityRole="button"
        >
          <Text class="text-black roboto-bold text-sm">Back</Text>
        </Pressable>
      </View>
    </View>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = HomePropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default ReportScreen
