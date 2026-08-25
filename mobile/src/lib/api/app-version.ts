import * as Application from "expo-application";
import { Alert, Linking, Platform } from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function checkForAppUpdate() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/app-version`);
    const json = await response.json();

    const platform = Platform.OS === "ios" ? "ios" : "android";
    const release = json.data[platform];

    const installedBuild = Number(Application.nativeBuildVersion ?? 0);
    const latestBuild = Number(release.latestBuild);
    const minimumBuild = Number(release.minimumBuild);

    if (installedBuild < minimumBuild) {
      Alert.alert(
        "Update required",
        "You need to update Ask A Punk to keep using it.",
        [
          {
            text: "Update now",
            onPress: () => Linking.openURL(release.downloadUrl),
          },
        ],
        { cancelable: false }
      );
    } else if (installedBuild < latestBuild) {
      Alert.alert(
        "Update available",
        "A newer version of Ask A Punk is available.",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Update",
            onPress: () => Linking.openURL(release.downloadUrl),
          },
        ]
      );
    }
  } catch (error) {
    // Don't block the app if the version server is temporarily unavailable.
    console.warn("Could not check for app update:", error);
  }
}