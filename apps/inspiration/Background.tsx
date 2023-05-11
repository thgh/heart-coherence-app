import React, { useEffect, useMemo, useState } from 'react'
import { Animated, Easing, ViewProps, ViewStyle } from 'react-native'

export default function BackgroundView({
  duration = 1000,
  style,
  ...props
}: ViewProps & { style: ViewStyle; duration?: number }) {
  const [animation] = useState(() => new Animated.Value(0))
  const [colors, setColors] = useState([
    style.backgroundColor as string,
    style.backgroundColor as string,
  ])

  const backgroundColor = animation.interpolate({
    inputRange: colors.map((_, i) => i),
    outputRange: colors,
  })
  useEffect(() => {
    if (colors[colors.length - 1] !== style.backgroundColor)
      setColors((colors) => colors.concat(style.backgroundColor as string))
  }, [style.backgroundColor])

  useEffect(() => {
    if (colors.length < 2) return
    Animated.timing(animation, {
      duration,
      toValue: colors.length - 1,
      useNativeDriver: false,
    }).start(({ finished }) => {
      // if (finished) setColors(colors.slice(1))
    })
  }, [colors.length])

  return (
    <Animated.View
      {...props}
      style={[
        { ...(style as object), backgroundColor: undefined },
        { backgroundColor },
      ]}
    ></Animated.View>
  )
}
