import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { StyleProp, TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

const MAPPING: IconMapping = {
  home: "home",
  timeline: "history",
  record: "mic",
  future: "lock",
  insights: "auto-awesome",
  settings: "settings",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  const iconName = MAPPING[name] || "help";
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
