precision mediump float;
varying vec3 vColor;

void main(void) {
  vec4 tempPixel;

  //@code
  tempPixel = vec4(0, gl_FragCoord.y/200., 0, 1.);
  //@end

  gl_FragCoord = tempPixel;
}
