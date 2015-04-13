precision mediump float;
varying vec3 vColor;

void main(void) {
  gl_FragColor = vec4(gl_FragCoord.x/900., 0, 0, 1.);
}
