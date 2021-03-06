precision mediump float;
varying vec3 vColor;

void main(void) {
  vec4 tempPixel;

  //@code
  if (int(mod(gl_FragCoord.x/5.+(localUniform/2.0),2.)) == 1) {
    tempPixel = vec4(1., 1., 1., 1.);
  } else {
    tempPixel = vec4(0, 0, 0, 1.);
  }
  //@endcode

  gl_FragColor = tempPixel;
}
