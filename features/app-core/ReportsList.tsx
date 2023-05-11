import { Text, View } from 'aetherspace/primitives'
import React from 'react'

export default function ReportsList() {
  return (
    <View className="p-6 flex flex-col gap-4">
      <View className="p-6 h-28 bg-slate-800 rounded-lg">
        <Text className="text-white">Report 4</Text>
      </View>
      <View className="p-6 h-28 bg-slate-800 rounded-lg">
        <Text className="text-white">Report 3</Text>
      </View>
      <View className="p-6 h-28 bg-slate-800 rounded-lg">
        <Text className="text-white">Report 2</Text>
      </View>
      <View className="p-6 h-28 bg-slate-800 rounded-lg">
        <Text className="text-white">Report 1</Text>
      </View>
    </View>
  )
}
