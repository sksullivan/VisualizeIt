'use strict';

// Module to keep track of our designer page.
angular.module('vizualizeItApp')
  .controller('DesignerCtrl', function ($scope,componentLoaderService,previewService,flowchartService) {

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
      flowchartService.registerComponentDeletionCallback(function (index) {
        $scope.flowchart.activeComponents.splice(index, 1);
      });

      // Print out the list of items in our system.
      console.log($scope.flowchart.items);

      // Set our page to listen for keypresses with jQuery.
      $(document).keypress(function (e) {
        console.log(e.keyCode);
        if (e.keyCode == 13) { // Enter
          $scope.loadComponentData();
        } else {
          var index = e.keyCode-49; // Hopefully the number keys
          // Clone the component selected from our list, add it to our flowchart.
          var component = new FlowchartComponent($scope.flowchart.items[index].hash);
          $scope.flowchart.placeNewComponent(component);
          flowchartService.addComponent(component);
        }
      });
    });

    // Add a component to flowchart.
    var flowchartPlaceNewComponent = function (component) {
      $scope.$apply(function () {
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
      $scope.componentsToRetrieve = Object.keys(componentGraph.nodes).length - 1;
      Object.keys(componentGraph.nodes).forEach(function (node) {
        var component = $scope.componentForDomElementId(node);
        if (component !== undefined) {
          componentLoaderService.getComponent(component.hash._id,function (textData) {
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

      

      // Iterate over components. If no geom, no vtx or no frag shader, stop.
      var geometryComponents = [];
      var vertexComponents = [];
      var fragmentComponents = [];
      for (var i = 0; i < components.length; i++) {
        if (components[i].hash.dataType == "geometry") {
          geometryComponents.push(components[i]);
        } else if (components[i].hash.dataType == "vertex") {
          vertexComponents.push(components[i]);
        } else if (components[i].hash.dataType == "fragment") {
          fragmentComponents.push(components[i]);
        }
      }

      if (geometryComponents.length == 0 || vertexComponents.length == 0 || fragmentComponents.length == 0) {
        alert("Need more componenets");
        return;
      }

      var geometryText = $scope.compileComponents(geometryComponents);
      var vertexText = $scope.compileComponents(vertexComponents);
      var fragmentText = $scope.compileComponents(fragmentComponents);

      previewService.render(geometryText,vertexText,fragmentText);
    };

    $scope.compileComponents = function (componentList) {
      if (componentList[0].hash.dataType == "geometry") {
        console.log(componentList[0].hash);
        console.log(componentList[0].hash.text);
        return PlyReader().parse(componentList[0].hash.text);
      }
      return componentList[0].hash.text;
    };
  });
