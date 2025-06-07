import { Object3D } from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any
      ambientLight: any
      pointLight: any
      octahedronGeometry: any
      icosahedronGeometry: any
      tetrahedronGeometry: any
      dodecahedronGeometry: any
      boxGeometry: any
      meshStandardMaterial: any
    }
  }
} 