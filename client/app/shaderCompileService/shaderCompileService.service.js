'use strict';

angular.module('vizualizeItApp')
  .service('shaderCompileService', function (timeService) {

    // Extracts color generation code from shaders, combines into one large shader.
    this.compileFragmentShader = function (shaders, blendMode) {
      var blendWeights = [];
      var blendOffsets = [];
      var computedShaderLines = [];

      // Add shader boilerplate, declare pixel values array and temp vector.
      computedShaderLines.push("precision mediump float;");
      computedShaderLines.push("varying vec3 vColor;");
      for (let shader of shaders) {
        if (shader.hash.uniformComponent !== undefined) {
          computedShaderLines.push("uniform float "+shader.hash.uniformComponent.name+";");
        }
      }
      computedShaderLines.push("void main(void) {");
      computedShaderLines.push("  vec4 pixelValues["+shaders.length+"];");
      computedShaderLines.push("  vec4 tempPixel;");
      computedShaderLines.push("  float localUniform;");

      // For all shaders, add variable declarations if not already declared.
      var declaredVariableLines = [];
      for (let shader of shaders) {
        var shaderVariableDeclarationLines = this.getVariableDeclarations(shader);
        for (let line of shaderVariableDeclarationLines) {
          if (declaredVariableLines.indexOf(line) == -1) {
            computedShaderLines.push(line);
            declaredVariableLines.push(line);
          }
        }
      }

      // For all shaders, extract code, calculate offset and weight. Add code to
      // computed shader, and add line to save caluclated pixel color to array.
      for (let shader of shaders) {
        blendWeights = this.getBlendWeights(shaders.length,blendMode);
        blendOffsets = this.getBlendOffsets(shaders.length,blendMode);
        if (shader.hash.uniformComponent !== undefined) {
          computedShaderLines.push("  localUniform = "+shader.hash.uniformComponent.name+";");
        }
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

    this.compileVertexShader = function (vertexShaders, fragmentShaders) {
      var computedShaderLines = [];

      computedShaderLines.push("precision mediump float;");
      computedShaderLines.push("attribute vec2 position;");
      computedShaderLines.push("attribute vec3 color;");
      computedShaderLines.push("varying vec3 vColor;");
      for (let shader of fragmentShaders) {
        if (shader.hash.uniformComponent !== undefined) {
          computedShaderLines.push("uniform float "+shader.hash.uniformComponent.name+";");
        }
      }

      computedShaderLines.push("void main(void) {");
      computedShaderLines.push("  gl_Position = vec4(position, 0., 1.);");
      computedShaderLines.push("  vColor = color;");
      computedShaderLines.push("}");
      console.log(computedShaderLines.join("\n"));
      return computedShaderLines.join("\n");

      return shaders[0].hash.text;
    }

    // Looks for "//@code" and "//@end" tags, returns lines between.
    this.getCode = function (shader) {
      return this.getTextBetweenTags(shader, "//@code", "//@endcode");
    };

    // Looks for "//@vars" and "//@end" tags, returns lines between.
    this.getVariableDeclarations = function (shader) {
      return this.getTextBetweenTags(shader, "//@vars", "//@endvars");
    };

    this.getTextBetweenTags = function (shader, startTag, endTag) {
      var shaderLines = shader.hash.text.split("\n");
      var codeStartIndex, codeEndIndex;
      for (let line of shaderLines) {
        if (line.indexOf(startTag) > -1) {
          codeStartIndex = shaderLines.indexOf(line)+1;
        }
        if (line.indexOf(endTag) > -1) {
          codeEndIndex = shaderLines.indexOf(line);
        }
      }
      if (codeStartIndex === undefined || codeEndIndex === undefined) {
        return [];
      }
      return shaderLines.slice(codeStartIndex,codeEndIndex);
    }

    // Gets array of weights based on blend mode.
    this.getBlendWeights = function (shaderCount, blendMode) {
      var weights = new Array(shaderCount);
      if (blendMode == "uniform mix") {
        for (var i = 0; i < shaderCount; i++) {
          weights[i] = 1/shaderCount;
        }
      } else if (blendMode == "difference") {
        weights[0] = 1;
        for (var i = 1; i < shaderCount; i++) {
          weights[i] = -1;
        }
      } else if (blendMode == "solid orange") {
        for (var i = 0; i < shaderCount; i++) {
          weights[i] = 0;
        }
      } else if (blendMode == "solid orange") {
        for (var i = 0; i < shaderCount; i++) {
          weights[i] = 0;
        }
      } else if (blendMode == "blue shift") {
        for (var i = 0; i < shaderCount; i++) {
          weights[i] = 1/shaderCount-0.1;
        }
      }
      return weights;
    };

    // Gets array of offsets based on blend mode.
    this.getBlendOffsets = function (shaderCount, blendMode) {
      console.log(blendMode);
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
      } else if (blendMode == "solid orange") {
        for (var i = 0; i < shaderCount; i++) {
          offsets[i] = [1/shaderCount,.5/shaderCount,0,1/shaderCount];
        }
      } else if (blendMode == "blue shift") {
        for (var i = 0; i < shaderCount; i++) {
          offsets[i] = [0,0,1/shaderCount,0];
        }
      }
      return offsets;
    };
  });
