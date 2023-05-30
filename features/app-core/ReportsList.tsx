import { Text, View } from 'aetherspace/primitives'
import React from 'react'
import { state } from './global-state'

export default function ReportsList() {
  return (
    <View className="p-6 flex flex-col gap-4">
      {state.sessions.map((session, id) => (
        <View className="p-6 h-28 bg-slate-800 rounded-lg" key={id}>
          <Text className="text-white">Session {session.startAt}</Text>
        </View>
      ))}
    </View>
  )
}
