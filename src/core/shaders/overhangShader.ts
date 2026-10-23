import * as THREE from 'three';

/**
 * Custom GLSL ShaderMaterial that colors faces according to 3D print overhang angle.
 * Downward facing slopes > threshold are marked in red (support needed).
 */
export function createOverhangMaterial(thresholdDegrees: number = 45): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uThreshold: { value: Math.sin((thresholdDegrees * Math.PI) / 180) },
      uLightDir: { value: new THREE.Vector3(0.5, 0.8, 0.5).normalize() },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uThreshold;
      uniform vec3 uLightDir;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        // Normal in world space (Three.js Y is UP, so downward is -Y)
        // Face normal dot with (0.0, -1.0, 0.0) gives downward projection
        // If normal.y is negative, the surface faces downward
        float downwardDot = -vNormal.y;

        // Diffuse ambient lighting
        float diff = max(dot(vNormal, uLightDir), 0.2);

        vec3 color;
        if (downwardDot > uThreshold + 0.2) {
          // Critical overhang (> 60°) - RED (Supports required)
          color = vec3(0.95, 0.2, 0.2);
        } else if (downwardDot > uThreshold) {
          // Warning overhang (45° - 60°) - AMBER (May need brim/slowdown)
          color = vec3(1.0, 0.65, 0.0);
        } else {
          // Safe printable zone (0° - 45°) - TEAL / GREEN
          color = vec3(0.08, 0.75, 0.55);
        }

        // Apply lighting and technical edge rim
        vec3 finalColor = color * (diff * 0.7 + 0.35);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  });
}
