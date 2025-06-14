import { Material, BufferGeometry } from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: {
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: [number, number, number];
        geometry?: BufferGeometry;
        material?: Material;
        children?: React.ReactNode;
      };
      octahedronGeometry: {
        args?: [number];
      };
      icosahedronGeometry: {
        args?: [number];
      };
      tetrahedronGeometry: {
        args?: [number];
      };
      dodecahedronGeometry: {
        args?: [number];
      };
      boxGeometry: {
        args?: [number, number, number];
      };
      meshStandardMaterial: {
        color?: string;
        emissive?: string;
        emissiveIntensity?: number;
      };
      ambientLight: {
        intensity?: number;
      };
      pointLight: {
        position?: [number, number, number];
        intensity?: number;
        color?: string;
      };
    }
  }
} 