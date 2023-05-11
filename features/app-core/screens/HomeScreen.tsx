import React from 'react'
import { StatusBar } from 'expo-status-bar'
// Navigation
import { Link, fetchAetherProps, useAetherRoute } from 'aetherspace/navigation'
// Schemas
import { z, aetherSchema, AetherProps } from 'aetherspace/schemas'
// Primitives
import { View, Text, Pressable } from 'aetherspace/primitives'
// SEO
import { H1 } from 'aetherspace/html-elements'

/* --- Schemas & Types ------------------------------------------------------------------------- */

const HomePropsSchema = aetherSchema('HomeScreenProps', {
  customGreeting: z.string().default('Hello GREEN stack 👋').describe('A greeting for the user'), // prettier-ignore
  alive: z.boolean().default(true),
  kicking: z.boolean().default(true),
})

const HomeParamsSchema = aetherSchema('HomeScreenParams', {
  echo: z.string().default('Hello GREEN stack 👋').describe('Echo argument for the GraphQL health endpoint'), // prettier-ignore
})

export type HomeScreenProps = AetherProps<typeof HomePropsSchema>
export type HomeScreenParams = AetherProps<typeof HomeParamsSchema>

/* --- GraphQL & Data Fetching ----------------------------------------------------------------- */

const getScreenDataQuery = `
  query($healthCheckArgs: HealthCheckArgs!) {
    healthCheck(args: $healthCheckArgs) {
      alive
      kicking
      echo
    }
  }
`

const getHomeScreenArgs = (params: HomeScreenParams = {}) => ({
  healthCheckArgs: HomeParamsSchema.parse(params),
})

const getHomeScreenData = async (queryKey: string, queryVariables?: HomeScreenParams) => {
  const queryData = queryKey || getScreenDataQuery
  const queryInput = queryVariables || getHomeScreenArgs() // Use defaults if not defined
  const { data } = await fetchAetherProps(queryData, queryInput)
  const { alive, kicking, echo } = data?.healthCheck || {}
  return { alive, kicking, customGreeting: echo } as HomeScreenProps
}

export const screenConfig = {
  query: getScreenDataQuery,
  getGraphqlVars: getHomeScreenArgs,
  getGraphqlData: getHomeScreenData,
  paramSchema: HomeParamsSchema,
  propSchema: HomePropsSchema,
  refetchOnMount: false,
  backgroundColor: '#FFFFFF',
}

/* --- <HomeScreen/> --------------------------------------------------------------------------- */

export const HomeScreen = (props: AetherProps<typeof HomePropsSchema>) => {
  // Props & Data
  const [pageData] = useAetherRoute(props, screenConfig)

  // -- Render --

  return (
    <View class="relative flex w-full h-full items-center justify-center bg-black">
      <StatusBar style="auto" />
      <H1 class="text-white pb-2 roboto-bold font-bold text-lg">Bluetooth Hackathon</H1>
      <Text class="md:w-2/3 lg:w-1/2 pt-5 pb-3 px-4 text-center text-sm text-white">...</Text>
      <View class="flex-row pt-3">
        <Pressable
          class="flex-row py-1 px-2 mx-1 bg-white items-center rounded-md"
          // onPress={() => openLink(graphQLEndpoint || '/api/graphql')}
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
    </View>
  )
}

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = HomePropsSchema.introspect()

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen
