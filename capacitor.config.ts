import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.noorulquran.app',
  appName: 'NoorulQuran',
  webDir: 'dist',
  backgroundColor: '#050807',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#050807',
    allowMixedContent: false,
  },
}

export default config
