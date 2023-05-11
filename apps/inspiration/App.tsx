import { StatusBar } from 'expo-status-bar'
import {
  Button,
  Dimensions,
  PermissionsAndroid,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Buffer } from 'buffer'

import {
  NavigationContainer,
  DarkTheme,
  useNavigation,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { BleManager, Device, UUID } from 'react-native-ble-plx'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { BleContext, IBleContext } from './BleContext'
import useEvent from './useEvent'
import useFirstHRM from './useFirstHRM'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BackgroundView from './Background'

const HEART_RATE: UUID = '0000180d-0000-1000-8000-00805f9b34fb'
const HEART_RATE_MEASUREMENT: UUID = '00002a37-0000-1000-8000-00805f9b34fb'
const graphItems = 30

const Stack = createNativeStackNavigator()

const states = {}

type RootStackParamList = {
  Home: undefined
  Connect: undefined
}
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function App() {
  const [manager, setManager] = useState(() => new BleManager())
  const [scanning, setScanning] = useState<IBleContext['scanning']>('init')
  const dev = useRef<Device | null>(null)
  const heart = useRef<{ at: number; rate: number }[]>([])
  const rr = useRef<number[]>([])
  const [, boo] = useState(false)
  const render = useCallback(() => boo((a) => !a), [])
  const disconnected = useEvent(async (error: any, device: Device) => {
    if (dev.current?.id === device.id) {
      dev.current = null
    }
    render()
  })
  const setDevice = useEvent(async (device: Device) => {
    if (device)
      console.log(
        'ble setDevice',
        device.name,
        device.id,
        device.localName,
        device.manufacturerData,
        device.serviceData
      )
    if (!device && (await dev.current?.isConnected)) {
      console.log('disconnecting', dev.current.id, dev.current.name)
      dev.current.cancelConnection().then(() => {
        setScanning('stopped')
      })
    } else if (!device) {
      setScanning('stopped')
    }
    dev.current = device
    render()

    if (!device) {
      return
    }

    console.log('connecting...')
    dev.current = device = await device.connect({ autoConnect: false })
    render()
    console.log('connected...')

    device.onDisconnected(disconnected)

    dev.current = device = await device.discoverAllServicesAndCharacteristics()

    device.monitorCharacteristicForService(
      HEART_RATE,
      HEART_RATE_MEASUREMENT,
      (error, char) => {
        if (!char) return console.log('char err', error)

        const buffer = Buffer.from(char.value, 'base64')
        const bytes = new Uint8Array(buffer.toJSON().data)
        console.log('hear', char.value, bytes, bytes[1])
        const now = Date.now()
        heart.current.push({ at: now, rate: bytes[1] })
        for (let index = 2; index < bytes.length; index += 2) {
          const ms = bytes[index + 1] * 256 + bytes[index]
          rr.current.push(ms)
        }
        render()
      }
    )
  })

  return (
    <View style={styles.root}>
      <BleContext.Provider
        value={{
          manager,
          device: dev,
          setDevice,
          heart,
          rr,
          scanning,
          setScanning,
        }}
      >
        <NavigationContainer theme={DarkTheme}>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Connect" component={Connect} />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </BleContext.Provider>
    </View>
  )
}

const size = 200

export function Home({ navigation }: Props) {
  const first = useFirstHRM()

  const consecutives = 3

  const score = first.rr.current.reduce(
    (acc, rr) => {
      if (!rr) return acc
      if (!acc.last) return { ...acc, last: rr }

      if (acc.trend >= consecutives && rr > acc.last) acc.sum++
      else if (acc.trend > 0 && rr > acc.last) acc.trend++
      else if (rr > acc.last) acc.trend = 1

      if (acc.trend <= -consecutives && rr < acc.last) acc.sum++
      else if (acc.trend < 0 && rr < acc.last) acc.trend--
      else if (rr < acc.last) acc.trend = -1

      acc.last = rr
      return acc
    },
    { trend: 0, consecutive: 0, last: 0, sum: 0 }
  )
  // console.log('score', score)

  const [, boo] = useState(false)
  const render = useCallback(() => boo((a) => !a), [])

  useEffect(() => {
    return () => {
      clearInterval(inter)
    }
  }, [])

  const [mode, setMode] = useState<'setup' | 'focus'>('setup')
  useEffect(() => {
    setMode('setup')
    const t = setTimeout(() => setMode('focus'), 5000)
    return () => clearTimeout(t)
  }, [first.scanning])
  const connectionAttention = mode == 'setup' && first.device
  const connectionColor = mode == 'setup' ? '#ffffff' : '#555555'
  const connectionBg = mode == 'setup' && first.device ? '#222222' : '#000000'

  const { width, height } = Dimensions.get('screen')
  const windowHeight = Dimensions.get('window').height
  const safeTop = height - windowHeight

  const safe = useSafeAreaInsets()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Fold */}
      <View style={{ height: safe.top, width }} />
      <View
        style={{
          width,
          height: windowHeight - 100 - 24,
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: '#222',
            width,
            height: 100,
            flexDirection: 'row',
          }}
        >
          {first.rr.current.slice(-graphItems - 1).map((rr, key, array) => {
            const prev = array[key - 1]
            const slope = rr - prev
            const up = slope > 0
            const abs = Math.abs(slope)

            const bar = Math.min(50, abs)
            const upBar = up ? bar : 0
            const color = '#ccc'

            return prev ? (
              <View
                key={key}
                style={{
                  marginTop: 50 - upBar,
                  height: bar,
                  width: (100 / graphItems).toPrecision(5) + '%',
                  backgroundColor: color,
                }}
              ></View>
            ) : null
          })}
        </View>

        <View style={{ marginTop: 8 }} />
        <View style={{ paddingHorizontal: 16 }}>
          <Text>{score.sum}</Text>
        </View>

        <View style={{ marginTop: 24 }} />
        <View>
          <Button
            title="fake"
            color="#124"
            onPress={() => {
              if (inter) {
                first.rr.current = []
                first.heart.current = []
                clearInterval(inter)
                inter = null
                return
              }
              let before = 50 + Math.random() * 40
              clearInterval(inter)
              inter = setInterval(() => {
                before += Math.random() * 10 - 5
                first.heart.current.push({
                  at: Date.now(),
                  rate: Math.floor(before),
                })
                first.rr.current.push(Math.floor(60000 / before))
                render()
              }, 1000)
            }}
          />
        </View>

        <View style={{ marginTop: 24 }} />

        {/* Start & stop */}
        {first.scanning == 'scanning' ||
        first.scanning == 'reading' ||
        first.device ? (
          <Circle
            onPress={() => first.stop()}
            label="Stop"
            color={connectionColor}
          />
        ) : first.scanning == 'init' || first.scanning == 'stopped' ? (
          <Circle
            onPress={() => first.scan()}
            label="Start"
            color={connectionColor}
          />
        ) : null}
      </View>

      <View style={{ marginTop: 24 }} />

      {/* 2 */}
      <BackgroundView
        duration={connectionAttention ? 300 : 3000}
        style={{
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: connectionBg,
          width,
        }}
      >
        {first.device && (
          <>
            <Text style={{ color: connectionColor }}>
              Connected to{' '}
              <Text style={{ fontWeight: 'bold' }}>{first.device.name}</Text>
            </Text>
            <Text style={{ color: connectionColor, opacity: 0.5 }}>
              {' '}
              {first.device.id}
            </Text>
          </>
        )}
      </BackgroundView>
      <View style={{ marginTop: 24 }} />

      <View style={{ width: '100%' }}>
        <View style={{ margin: 16 }}>
          <Text>Scoring</Text>
        </View>
        <Checkbox label="Upward trend for 3+ beats"></Checkbox>
        <Checkbox label="Downward trend for 3+ beats"></Checkbox>
        <Checkbox label="Within range of 50-80 bpm"></Checkbox>
        <Checkbox label="1+ minute session duration"></Checkbox>
      </View>

      <View style={{ marginTop: 24 }} />
      <View style={{ marginTop: 24 }} />
      <View style={{ marginTop: 24 }} />
      <View style={{ marginTop: 24 }} />
    </ScrollView>
  )
}

function Circle({ label, onPress, color = '#ffffff' }) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          borderWidth: size / 25,
          borderColor: color + '66',
          width: size,
          height: size,
          borderRadius: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: size / 6,
            fontWeight: 'bold',
            color: color,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  )
}

function Checkbox({ label }) {
  const [state, setState] = useState(true)
  const ref = useRef<Switch>(null)
  return (
    <Pressable
      onPress={() => setState((a) => !a)}
      style={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        backgroundColor: '#222',
      }}
    >
      <View style={{ flexGrow: 1 }}>
        <Text style={{ color: 'white' }}>{label}</Text>
      </View>
      <Switch
        value={state}
        // thumbColor={}
        // trackColor={{ false: 'white', true: '#f00' }}
        onValueChange={() => setState((a) => !a)}
        ref={ref}
      />
    </Pressable>
  )
}

let inter

export function Connect() {
  return (
    <View style={styles.container}>
      <Text>Connect your device</Text>
    </View>
  )
}

// @ts-ignore
Text.defaultProps = Text.defaultProps || {}
// @ts-ignore
Text.defaultProps.style = { color: 'white' }

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#011',
  },
  container: {
    flex: 1,
    // backgroundColor: '#011',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
})
