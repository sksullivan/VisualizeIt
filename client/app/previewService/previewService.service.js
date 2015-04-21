'use strict';

angular.module('vizualizeItApp')
  .service('previewService', function (timeService) {
    var storedGeomData = null;
    var storedFragmentData = null;
    var storedVertexData = null;
    var storedUniformMap = null;
    //var animate;

    this.mutePreview = function () {
      $("#preview").hide();
    }

    this.showPreview = function () {
      $("#preview").show();
    }

    this.render = function (newUniformMap, newGeomData, newVshaderData, newFshaderData) {
      if (newGeomData !== undefined) {
        storedFragmentData = newFshaderData;
        storedGeomData = newGeomData;
        storedVertexData = newVshaderData;
        storedUniformMap = newUniformMap;
      }
      var fshader = storedFragmentData;
      var geom = storedGeomData;
      var vshader = storedVertexData;
      var uniformMap = newUniformMap;

      // Grab a reference to the preveiw canvas DOM element.
      var cvs = document.getElementById("preview");

      // Set this canvas to be the proper height.
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight/2;

      // Create an OpenGL context for our canvas. Use antiailiasing.
      var GL;
      try {
        GL = cvs.getContext("experimental-webgl", { antialias: true });
      } catch (e) {
        alert("You are not webgl compatible :(") ;
        return false;
      }

      // Set up our shaders based on passed in vertex & fragment shader.
      /*jshint multistr: true */
      var shader_vertex_source = vshader;
      var shader_fragment_source = fshader

      // Function to compile shaders with error logging.
      var get_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
          alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
          return false;
        }
        return shader;
      };

      // Compile both shaders.
      var shader_vertex = get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
      var shader_fragment = get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

      // Attach shaders to shader program for context.
      var SHADER_PROGRAM = GL.createProgram();
      GL.attachShader(SHADER_PROGRAM, shader_vertex);
      GL.attachShader(SHADER_PROGRAM, shader_fragment);
      GL.linkProgram(SHADER_PROGRAM);

      // Print some debug info
      //console.log(GL.getShaderInfoLog(SHADER_PROGRAM));
      console.log(GL.getProgramInfoLog(SHADER_PROGRAM));

      // Set attributes for shaders.
      //var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
      var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
      //var _frameCount = GL.getUniformLocation(SHADER_PROGRAM, "frameCount");
      for (let uniformName in uniformMap) {
        uniformMap[uniformName].location = GL.getUniformLocation(SHADER_PROGRAM, uniformName);
      }

      // Set attributes for geometry.
      //GL.enableVertexAttribArray(_color);
      GL.enableVertexAttribArray(_position);

      GL.useProgram(SHADER_PROGRAM);


      // Read points from passed in geometry, assemble into array of vertexes.
      var verts = [];
      geom.points.forEach(function (vertex) {
        verts.push([vertex[0],vertex[1],vertex[2]]);
      });
      var mesh_vertexes = geom.vertices;

      // Create buffer for mesh data. Bind buffer to mesh verteces.
      var MESH_VERTEX= GL.createBuffer();
      GL.bindBuffer(GL.ARRAY_BUFFER, MESH_VERTEX);
      GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(mesh_vertexes), GL.STATIC_DRAW);

      // Read faces from passed in gemoetry, assemble into array of faces. Create
      // buffer for face data, bind buffer to array of faces.
      var mesh_faces = [].concat.apply([],geom.polys);
      var MESH_FACES= GL.createBuffer ();
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, MESH_FACES);
      GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh_faces), GL.STATIC_DRAW);


      // Clear screen.
      GL.clearColor(0.0, 0.0, 0.0, 0.0);

      // Function to render geometry to canvas.
      var animate = function () {
        // Set size of OpenGl viewport. Clear pixel buffer.
        GL.viewport(0.0, 0.0, cvs.width, cvs.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        // Mark mesh vertices so OpenGL can draw mesh geometry.
        GL.bindBuffer(GL.ARRAY_BUFFER, MESH_VERTEX);

        // Prepare attribute (position and color) data for drawing.
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3),0);
        //GL.uniform1f(_frameCount, timeService.getElapsedFrames());
        var uniformNames = Object.keys(uniformMap);
        for (var i = 0; i < uniformNames.length; i++) {
          GL.uniform1f(uniformMap[uniformNames[i]].location, uniformMap[uniformNames[i]].valueFunction());
        }
        //GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(2+3),2*4);

        // Mark face data so OpenGL can draw mesh faces.
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, MESH_FACES);

        // Finally, finally, render all this data to the screen
        GL.drawArrays(GL.TRIANGLES, 0, mesh_faces.length);
        GL.flush();

        // Render this frame again when the browser says it's OK to do so.
        window.requestAnimationFrame(animate);
      };
      animate();
    };
  });
