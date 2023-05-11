import { Stack } from 'expo-router'
// Config
import tailwindConfig from 'app/tailwind.config'
// Context
import { AetherContextManager } from 'aetherspace/context'
// Assets
import * as assets from 'registries/assets.generated'
// Hooks
import useLoadFonts from 'app/hooks/useLoadFonts'
import React from 'react'

/* --- <ExpoRootLayout/> ----------------------------------------------------------------------- */

const ExpoRootLayout = () => {
  // Hide app when fonts not yet loaded
  const fontsLoaded = useLoadFonts()

  // -- Splash --

  if (!fontsLoaded) return null

  // -- Render --

  return (
    <AetherContextManager assets={assets} icons={{}} twConfig={tailwindConfig} isExpo isAppDir>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'slide_from_right',
        }}
      />
    </AetherContextManager>
  )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default ExpoRootLayout
