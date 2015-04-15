'use strict';

angular.module('vizualizeItApp')
  .service('shaderCompileService', function () {

    // Extracts color generation code from shaders, combines into one large shader.
    this.compile = function (shaders, blendMode) {
      var blendWeights = [];
      var blendOffsets = [];
      var computedShaderLines = [];

      // Add shader boilerplate, declare pixel values array and temp vector.
      computedShaderLines.push("precision mediump float;");
      computedShaderLines.push("varying vec3 vColor;");
      computedShaderLines.push("");
      computedShaderLines.push("void main(void) {");
      computedShaderLines.push("  vec4 pixelValues["+shaders.length+"];");
      computedShaderLines.push("  vec4 tempPixel;");

      // For all shaders, extract code, calculate offset and weight. Add code to
      // computed shader, and add line to save caluclated pixel color to array.
      for (let shader of shaders) {
        blendWeights = this.getBlendWeights(shaders.length,blendMode);
        blendOffsets = this.getBlendOffsets(shaders.length,blendMode);
        var shaderLines = this.getCode(shader);
        for (let line of shaderLines) {
          computedShaderLines.push(line);
        }
        computedShaderLines.push("  pixelValues["+shaders.indexOf(shader)+"] = tempPixel;");
      }

      // Combine array of shader values.
      computedShaderLines.push("  gl_FragColor = vec4(0.,0.,0.,0.);");
      for (let shader of shaders) {
        console.log(blendWeights);
        console.log(blendOffsets);
        var i = shaders.indexOf(shader);

        // Scale color vector
        if (blendWeights[i] % 1 === 0) {
          computedShaderLines.push("  pixelValues["+i+"] = pixelValues["+i+"]*("+blendWeights[i]+".);");
        } else {
          computedShaderLines.push("  pixelValues["+i+"] = pixelValues["+i+"]*("+blendWeights[i]+");");
        }

        // Translate color vector
        computedShaderLines.push("  pixelValues["+i+"] += vec4("+blendOffsets[i][0]+","+blendOffsets[i][1]+","+blendOffsets[i][2]+","+blendOffsets[i][3]+");")

        // Send off correct color
        computedShaderLines.push("  gl_FragColor += pixelValues["+i+"];");
      }
      computedShaderLines.push("}");
      console.log(computedShaderLines.join("\n"));
      return computedShaderLines.join("\n");
    };

    // Looks for "//@code" and "//@end" tags, returns line between.
    this.getCode = function (shader) {
      var shaderLines = shader.hash.text.split("\n");
      for (let line of shaderLines) {
        var codeStartIndex, codeEndIndex;
        if (line.indexOf("//@code") > -1) {
          codeStartIndex = shaderLines.indexOf(line)+1;
        }
        if (line.indexOf("//@end") > -1) {
          codeEndIndex = shaderLines.indexOf(line);
        }
      }
      return shaderLines.slice(codeStartIndex,codeEndIndex);
    };

    // Gets array of weights based on blend mode.
    this.getBlendWeights = function (shaderCount, blendMode) {
      var weights = new Array(shaderCount);
      if (blendMode == "uniform mix" || blendMode == "solid orange") {
        for (var i = 0; i < shaderCount; i++) {
          weights[i] = 1/shaderCount;
        }
      } else if (blendMode == "difference") {
        weights[0] = 1;
        for (var i = 1; i < shaderCount; i++) {
          weights[i] = -1;
        }
      }
      return weights;
    };

    // Gets array of offsets based on blend mode.
    this.getBlendOffsets = function (shaderCount, blendMode) {
      var offsets = new Array(shaderCount);
      if (blendMode == "uniform mix") {
        for (var i = 0; i < shaderCount; i++) {
          offsets[i] = [0,0,0,0];
        }
      } else if (blendMode == "difference") {
        offsets[0] = [0,0,0,0];
        for (var i = 1; i < shaderCount; i++) {
          offsets[i] = [0,0,0,-1];
        }
      } else if (blendMode == "solid orange"){
        for (var i = 0; i < shaderCount; i++) {
          offsets[i] = ["1.",.5,0,"1."];
        }
      }
      return offsets;
    };
  });
