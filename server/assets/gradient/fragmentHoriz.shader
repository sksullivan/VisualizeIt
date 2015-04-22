precision mediump float;
varying vec3 vColor;

void main(void) {
  vec4 tempPixel;

  //@code
  tempPixel = vec4(gl_FragCoord.x/900., 0, 0, 1.);
  //@endcode

  gl_FragCoord = tempPixel;
}
