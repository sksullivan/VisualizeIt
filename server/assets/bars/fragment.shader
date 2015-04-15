precision mediump float;
varying vec3 vColor;

void main(void) {
  vec4 tempPixel;

  //@code
  if (int(mod(gl_FragCoord.x/5.,2.)) == 1) {
    tempPixel = vec4(1., 1., 1., 1.);
  } else {
    tempPixel = vec4(0, 0, 0, 1.);
  }
  //@end

  gl_FragColor = tempPixel;
}
