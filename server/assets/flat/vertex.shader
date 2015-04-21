precision mediump float;
attribute vec2 position; //the position of the point
attribute vec3 color;  //the color of the point
varying vec3 vColor;
uniform float frameCount;

void main(void) {
  gl_Position = vec4(position, 0., 1.);
  vColor = color;
}
