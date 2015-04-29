'use strict';

// Module to keep track of our designer page.
angular.module('vizualizeItApp')
  .controller('DesignerCtrl', [
      '$scope',
      'componentLoaderService',
      'previewService',
      'flowchartService',
      'shaderCompileService',
      'timeService',
      'audioService',
    function (
      $scope,
      componentLoaderService,
      previewService,
      flowchartService,
      shaderCompileService,
      timeService,
      audioService
      ) {
    $scope.missingComponents = [{name: "Geometry", dataType: "geometry"}, {name: "Vertex Shader", dataType: "vertex"}, {name: "Fragment Shader", dataType: "fragment"}, {name: "Blending Mode", dataType: "none"}];
    $scope.blendModes = ["uniform mix","difference", "solid orange", "blue shift"];
    var nextFreeComponentId = 100;
    var toolPaneInitialized = false;
    $scope.selectedBlendMode = "";

    audioService.init();
    audioService.setCanvas(document.getElementById("analysis"));

    // Initially, get the list of components from the server. Then setup our page
    // and start the preview with a blank setup.
    componentLoaderService.getComponents(function (componentList) {

      // We'll make a class to hold data about each component in our flowchart.
      // Store each component's raw data from the server in a 'hash' field.
      var FlowchartComponent = class {
        constructor(hash) {
          this.hash = hash;
          this.x = 0;
          this.y = 0;
        }
      }

      // Make an object for our flowchart. Give it a reference to it's canvas.
      // Set our initialization function, and make new flowchart components based
      // on our server response.
      $scope.flowchart = {};
      $scope.flowchart.canvas = document.getElementById("flowchart");
      $scope.flowchart.activeComponents = [];
      $scope.flowchart.placeNewComponent = flowchartPlaceNewComponent;
      $scope.flowchart.items = componentList.map(function (flowchartComponentHash) {
        return new FlowchartComponent(flowchartComponentHash);
      });

      $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        // Add click listeners to tool pane items
        if (toolPaneInitialized == false) {
          for (let i = 0; i < $scope.flowchart.items.length; i++) {
            document.getElementById("item"+i).addEventListener("click", function () {
              var component = new FlowchartComponent($scope.flowchart.items[i].hash);
              $scope.flowchart.placeNewComponent(component);
              flowchartService.syncStructures($scope.flowchart.activeComponents);
            });
          }
        }
      });

      document.getElementById("playButton").addEventListener("click", function () {
        alert("replaying");
        audioService.replay();
      });

      document.getElementById("audio_file").onchange = function () {
        audioService.setSound(this.files[0]);
      }

      // Remove the appropriate element from activeComponents when the flowchart
      // detects a user deleting a node.
      flowchartService.registerComponentDeletionCallback(function (elementId) {
        for (let component of $scope.flowchart.activeComponents) {
          if (component.domElementId == elementId) {
            var deletionIndex = $scope.flowchart.activeComponents.indexOf(component);
            $scope.flowchart.activeComponents.splice(deletionIndex,1);
          }
        }
      });

      // Render the preview when a new connection is made
      flowchartService.registerNewConnectionCallback(function () {
        $scope.loadComponentData();
      });

      // Set the controller to render the preview when the blend mode changes.
      $scope.$watch('selectedBlendMode', function () {
        $scope.loadComponentData();
      });

      // Print out the list of items in our system.
      console.log($scope.flowchart.items);
    });

    // Add a component to flowchart. Keep DOM element/component IDs unique so that
    // we can delete and add components without confusing new and old components.
    var flowchartPlaceNewComponent = function (component) {
      $scope.$apply(function () {
        component.domElementId = "flowchartWindow"+nextFreeComponentId;
        nextFreeComponentId++;
        $scope.flowchart.activeComponents.push(component);
      });
    }

    // Lazy load the actual data for each component.
    $scope.loadComponentData = function () {
      // Grab the flowchart as a directed graph.
      var componentGraph = flowchartService.saveFlowchartData();

      // Iterate over components, keeping track of how many components need
      // processing. When each component is finished being processed, check to
      // see if all components have been processed. If so, begin rendering to the
      // preview canvas (todo).

      // Knock off one element to retrieve for the DISPLAY flowchart element, which
      // doesn't have a corresponding component to load from the server.

      $scope.componentsToRetrieve = componentGraph.nodes.length - 1;
      if ($scope.componentsToRetrieve == 0) {
        $scope.processShaders(componentGraph);
      }
      componentGraph.nodes.forEach(function (node) {
        var component = $scope.componentForDomElementId(node.name);
        if (component !== undefined) {
          componentLoaderService.getComponent(component.hash._id, function (textData) {
            component.hash.text = textData;
            $scope.componentsToRetrieve--;
            if ($scope.componentsToRetrieve == 0) {
              $scope.processShaders(componentGraph);
            }
          });
        }
      });
    };

    $scope.componentForDomElementId = function (domElementId) {
      for (var i = 0; i < $scope.flowchart.activeComponents.length; i++) {
        if ($scope.flowchart.activeComponents[i].domElementId == domElementId) {
          return $scope.flowchart.activeComponents[i];
        }
      }
    };

    $scope.processShaders = function (componentGraph) {
      var components = $scope.flowchart.activeComponents;

      // Get hashes from active components attatched to the appropriate graph nodes.
      for (let graphComponent of componentGraph.nodes) {
        for (let component of components) {
          if (graphComponent.name == component.domElementId) {
            graphComponent.hash = component.hash;
          }
        }
      }

      var geometryComponents = [];
      var vertexComponents = [];
      var fragmentComponents = [];

      // Get the root node (the display flowchart element)
      var exploreComponent = componentGraph.nodes[componentGraph.nodes.length-1];

      // Perform DFS on graph.
      var exploreStack = $scope.inputComponentsTo(exploreComponent, componentGraph);
      var visitedComponents = [];
      while (exploreStack.length > 0) {
        var exploreComponent = exploreStack.pop();
        visitedComponents.push(exploreComponent);
        if (exploreComponent.hash.dataType == "geometry") {
          geometryComponents.push(exploreComponent);
        } else if (exploreComponent.hash.dataType == "vertex") {
          vertexComponents.push(exploreComponent);
        } else if (exploreComponent.hash.dataType == "fragment" || exploreComponent.hash.dataType == "fragment-timed") {
          fragmentComponents.push(exploreComponent);
          exploreComponent.hash.uniformComponent = null;
          console.log(exploreComponent);
        } else if (exploreComponent.hash.dataType == "uniform") {
          var outputNodeName = $scope.outputComponentOf(exploreComponent, componentGraph).name;
          for (let shader of fragmentComponents) {
            if (shader.name == outputNodeName) {
              shader.hash.uniformComponent = exploreComponent;
            }
          }
        }

        // Push all adjacent nodes onto stack
        var inputComponents = $scope.inputComponentsTo(exploreComponent, componentGraph);
        for (let component of inputComponents) {
          exploreStack.push(component);
        }
      }

      $scope.missingComponents = [];
      if (geometryComponents.length == 0 || vertexComponents.length == 0 || fragmentComponents.length == 0 || $scope.selectedBlendMode == "") {
        if (geometryComponents.length == 0) {
          $scope.missingComponents.push({name: "Geometry", dataType: "geometry"});
        }
        if (vertexComponents.length == 0) {
          $scope.missingComponents.push({name: "Vertex Shader", dataType: "vertex"});
        }
        if (fragmentComponents.length == 0) {
          $scope.missingComponents.push({name: "Fragment Shader", dataType: "fragment"});
        }
        if ($scope.selectedBlendMode == "") {
          $scope.missingComponents.push({name: "Blending Mode", dataType: "none"});
        }
        for (let fragShader of fragmentComponents) {
          if (fragShader.hash.dataType == "fragment-timed") {
            if (fragShader.hash.uniformComponent === undefined || fragShader.hash.uniformComponent === null) {
              $scope.missingComponents.push({name: "Uniform for Shader", dataType: "uniform"});
            }
          }
        }
        previewService.mutePreview();
        return;
      }
      previewService.showPreview();

      var geometryText = PlyReader().parse(geometryComponents[0].hash.text);
      var vertexText = shaderCompileService.compileVertexShader(vertexComponents, fragmentComponents);
      var fragmentText = shaderCompileService.compileFragmentShader(fragmentComponents, $scope.selectedBlendMode);

      var uniformMap = {};
      for (var shader of fragmentComponents) {
        if (shader.hash.uniformComponent !== undefined) {
          uniformMap[shader.hash.uniformComponent.name] = {
            location: null,
            valueFunction: function () {return eval(shader.hash.uniformComponent.hash.text);}
          }
        }
      }
      previewService.render(uniformMap,geometryText,vertexText,fragmentText);
    };

    $scope.inputComponentsTo = function (component, graph) {
      var nodes = [];

      // Iterate over all input endpoints to our component
      for (let inputEndpoint of component.inputs) {
        // Iterate over all edges
        for (let edge of graph.edges) {
          // If edge's to endpoint is our input, get the edge's from element
          if (edge.to == inputEndpoint) {
            for (let node of graph.nodes) {
              for (let outputEndpoint of node.outputs) {
                if (outputEndpoint == edge.from) {
                  nodes.push(node);
                }
              }
            }
          }
        }
      }
      return nodes;
    };

    $scope.outputComponentOf = function (component, graph) {
      // Iterate over all input endpoints to our component
      for (let outputEndpoint of component.outputs) {
        // Iterate over all edges
        for (let edge of graph.edges) {
          // If edge's to endpoint is our input, get the edge's from element
          if (edge.from == outputEndpoint) {
            for (let node of graph.nodes) {
              for (let inputEndpoint of node.inputs) {
                if (inputEndpoint == edge.to) {
                  return node;
                }
              }
            }
          }
        }
      }
    };
  }]);
