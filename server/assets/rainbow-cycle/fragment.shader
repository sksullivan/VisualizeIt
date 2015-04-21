precision mediump float;
varying vec3 vColor;

void main(void) {

  //@code
  int r = 0;
  int g = 0;
  int b = 0;
	int step = int(mod(localUniform,255.0*6.0));
	if (step < 255) {
    r = 255;
    g = step;
  } else if (step < 255*2) {
    r = 255-(step-255);
    g = 255;
  } else if (step < 255*3) {
    g = 255;
    b = step-255*2;
  } else if (step < 255*4) {
    g = 255-(step-255*3);
    b = 255;
  } else if (step < 255*5) {
    b = 255;
    r = step-255*4;
  } else {
    b = 255-(step-255*5);
    r = 255;
  }
  tempPixel = vec4(float(r)/255.0, float(g)/255.0, float(b)/255.0, 1.0);
  //@end
}
