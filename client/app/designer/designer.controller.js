'use strict';

angular.module('vizualizeItApp')
  .controller('DesignerCtrl', function ($scope,designerService) {
    $scope.message = 'Hello';
    designerService.getComponents(function (componentList) {
      console.log(componentList);
      designerService.getComponent(componentList[0]._id,function (flatGeomText) {
        designerService.getComponent(componentList[1]._id,function (flatVertexShaderText) {
          designerService.getComponent(componentList[2]._id,function (flatFragmentShaderText) {
            main(PlyReader().parse(flatGeomText),flatVertexShaderText,flatFragmentShaderText);
          });
        });
      });
    });

    var main = function(geom,vshader,fshader) {
        var cvs = document.getElementById("preview");

        cvs.width=window.innerWidth/2;
        cvs.height=window.innerHeight/2;

        /*========================= GET WEBGL CONTEXT ========================= */
        var GL;
        try {
          GL = cvs.getContext("experimental-webgl", {antialias: true});
        } catch (e) {
          alert("You are not webgl compatible :(") ;
          return false;
        }

        /*========================= SHADERS ========================= */
        /*jshint multistr: true */
        var shader_vertex_source = vshader;


        var shader_fragment_source = fshader


        var get_shader=function(source, type, typeString) {
          var shader = GL.createShader(type);
          GL.shaderSource(shader, source);
          GL.compileShader(shader);
          if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
            return false;
          }
          return shader;
        };

        var shader_vertex=get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");

        var shader_fragment=get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

        var SHADER_PROGRAM=GL.createProgram();
        GL.attachShader(SHADER_PROGRAM, shader_vertex);
        GL.attachShader(SHADER_PROGRAM, shader_fragment);

        GL.linkProgram(SHADER_PROGRAM);

        //var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
        var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

        //GL.enableVertexAttribArray(_color);
        GL.enableVertexAttribArray(_position);

        GL.useProgram(SHADER_PROGRAM);


        /*========================= THE TRIANGLE ========================= */
        //POINTS :
        console.log(geom);
        var verts = [];
        geom.points.forEach(function (vertex) {
          verts.push([vertex[0],vertex[1],vertex[2]]);
        });
        var triangle_vertex = geom.vertices;

        var TRIANGLE_VERTEX= GL.createBuffer ();
        GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER,
                      new Float32Array(triangle_vertex),
          GL.STATIC_DRAW);

        //FACES :
        console.log([].concat.apply([],geom.polys));
        var geom_faces = [].concat.apply([],geom.polys);
        var GEOM_FACES= GL.createBuffer ();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GEOM_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                      new Uint16Array(geom_faces),
          GL.STATIC_DRAW);



        /*========================= DRAWING ========================= */
        GL.clearColor(0.0, 0.0, 0.0, 0.0);

        var animate = function() {

          GL.viewport(0.0, 0.0, cvs.width, cvs.height);
          GL.clear(GL.COLOR_BUFFER_BIT);

          GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);

          GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3),0) ;
          //GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(2+3),2*4) ;

          GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GEOM_FACES);
          //GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
          GL.drawArrays(GL.TRIANGLES, 0, geom_faces.length);
          GL.flush();

          window.requestAnimationFrame(animate);
        };

        animate();
      };
  });
