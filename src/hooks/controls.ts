import { FullscreenControl, Map, NavigationControl } from 'mapbox-gl'
export const useControls = (map: Map) => {
  map.addControl(new NavigationControl(), 'top-left')
  map.addControl(new FullscreenControl(), 'top-left')
}
