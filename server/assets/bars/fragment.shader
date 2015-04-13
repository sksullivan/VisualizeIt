precision mediump float;
varying vec3 vColor;

void main(void) {
  if (int(mod(gl_FragCoord.x/5.,2.)) == 1) {
    gl_FragColor = vec4(1., 1., 1., 1.);
  } else {
    gl_FragColor = vec4(0, 0, 0, 1.);
  }
}
