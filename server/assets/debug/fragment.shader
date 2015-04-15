precision mediump float;
varying vec3 vColor;

void main(void) {

  //@code
  tempPixel = (vec4(gl_FragCoord.x/900., 0.0, 0.0, 1.0)*0.5) + (vec4(0.0, gl_FragCoord.y/200., 0.0, 1.0)*0.5);
  //@end
}
