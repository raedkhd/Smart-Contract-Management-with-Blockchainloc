import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.3d575b89c54c4509afdd0230b283ff24",
  appName: "Protocol Vault",
  webDir: "dist",
  server: {
    // For live preview during development, uncomment and point to your Lovable preview URL:
    // url: "https://id-preview--3d575b89-c54c-4509-afdd-0230b283ff24.lovable.app",
    // cleartext: true,
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
